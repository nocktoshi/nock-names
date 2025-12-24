import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { ArrowLeftRight, ArrowLeft, Wallet } from "lucide-react";

import WalletConnection from "@/components/WalletConnection";
import ThemeToggle from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";

import { useRose } from "@nockchain/sdk";
import {
  Digest,
  Note,
  Pkh,
  SpendCondition,
  TxBuilder,
  hashPublicKey,
} from "@nockchain/rose-wasm";

const FEE_PER_WORD = 32768n; // 0.5 NOCK per word (matches existing site usage)
const NOCK_TO_NICKS = 65536;
const DUST_THRESHOLD_NICKS = FEE_PER_WORD * 2n; // 2x fee per word as dust threshold

const MIGRATE_V0_GET_STATUS = "nock_migrateV0GetStatus";
const MIGRATE_V0_SIGN_RAW_TX = "nock_migrateV0SignRawTx";

function formatNockApprox(nicks) {
  return (Number(nicks) / NOCK_TO_NICKS).toFixed(4);
}

function shorten(s) {
  if (!s) return "";
  return `${s.slice(0, 10)}…${s.slice(-8)}`;
}

// Minimal base58 (bitcoin alphabet) encode/decode for Iris v0 "bare pubkey" addresses.
const B58_ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
const B58_MAP = new Map(B58_ALPHABET.split("").map((c, i) => [c, i]));

function base58Decode(str) {
  const s = (str || "").trim();
  if (!s) return new Uint8Array();

  let zeros = 0;
  while (zeros < s.length && s[zeros] === "1") zeros++;

  const bytes = [0];
  for (let i = zeros; i < s.length; i++) {
    const val = B58_MAP.get(s[i]);
    if (val === undefined) throw new Error(`Invalid base58 character: "${s[i]}"`);

    let carry = val;
    for (let j = 0; j < bytes.length; j++) {
      const x = bytes[j] * 58 + carry;
      bytes[j] = x & 0xff;
      carry = x >> 8;
    }
    while (carry > 0) {
      bytes.push(carry & 0xff);
      carry >>= 8;
    }
  }

  const out = new Uint8Array(zeros + bytes.length);
  for (let i = 0; i < zeros; i++) out[i] = 0;
  for (let i = 0; i < bytes.length; i++) out[out.length - 1 - i] = bytes[i];
  return out;
}

export default function Upgrade() {
  const rose = useRose();
  const { provider, rpcClient, isReady: isRoseReady } = rose;

  const [v1Pkh, setV1Pkh] = useState(null);

  const [discoverStatus, setDiscoverStatus] = useState("idle");
  const [discoverError, setDiscoverError] = useState(null);

  const [hasV0Seed, setHasV0Seed] = useState(null); // { hasV0Seedphrase: boolean }
  const [candidates, setCandidates] = useState(null); // [{label,addressB58,pkhDigest}]
  const [v0Found, setV0Found] = useState(null); // { label, addressB58, noteCount, totalNicks }
  const [v0Address, setV0Address] = useState("");

  const [migrateStatus, setMigrateStatus] = useState("idle");
  const [migrateError, setMigrateError] = useState(null);
  const [txId, setTxId] = useState(null);

  const [includeDust, setIncludeDust] = useState(false);
  const [discoveredEntries, setDiscoveredEntries] = useState(null); // balance.notes entries (raw)
  const [selectedEntryKeys, setSelectedEntryKeys] = useState(() => new Set()); // Set<string> (stable note identifiers)

  const canDiscover = useMemo(() => {
    return Boolean(isRoseReady && provider && rpcClient);
  }, [isRoseReady, provider, rpcClient]);

  const isMethodNotSupported = useMemo(() => {
    const msg = (discoverError ?? "").toString();
    return msg.includes("METHOD_NOT_SUPPORTED");
  }, [discoverError]);

  const isNoVault = useMemo(() => {
    const msg = (discoverError ?? "").toString();
    return msg.includes("NO_VAULT");
  }, [discoverError]);

  const classifyNotes = useCallback((entries) => {
    const included = [];
    const skipped = [];

    for (let entryIndex = 0; entryIndex < entries.length; entryIndex++) {
      const e = entries[entryIndex];
      const note = Note.fromProtobuf(e.note);
      let digest = null;
      let name = null;
      try {
        const assets = typeof note.assets === "bigint" ? note.assets : BigInt(note.assets);
        const originPage = typeof note.originPage === "bigint" ? note.originPage : BigInt(note.originPage);
        digest = note.hash();
        const entryKey = digest.value;
        name = note.name;
        const isDust = assets <= DUST_THRESHOLD_NICKS;
        const row = {
          entryIndex,
          entryKey,
          nameFirst: name.first,
          nameLast: name.last,
          originPage: originPage.toString(),
          assetsNicks: assets,
          assetsNicksStr: assets.toString(),
          assetsNock: formatNockApprox(assets),
          isDust,
        };

        // Skip dust notes.
        if (isDust && !includeDust) {
          skipped.push({ ...row, reason: `Dust (≤ ${DUST_THRESHOLD_NICKS.toString()} nicks)` });
          continue;
        }

        included.push(row);
      } finally {
        // Prevent WASM leaks if anything throws between allocation and manual cleanup.
        try {
          name?.free?.();
        } catch {
          // ignore
        }
        try {
          digest?.free?.();
        } catch {
          // ignore
        }
        note.free();
      }
    }

    const sum = (arr) =>
      arr.reduce((acc, r) => acc + (typeof r.assetsNicks === "bigint" ? r.assetsNicks : BigInt(r.assetsNicks)), 0n);

    return {
      included,
      skipped,
      totals: {
        includedCount: included.length,
        skippedCount: skipped.length,
        includedNicks: sum(included),
        skippedNicks: sum(skipped),
      },
    };
  }, [includeDust]);

  const notesPreview = useMemo(() => {
    if (!discoveredEntries) return null;
    return classifyNotes(discoveredEntries);
  }, [discoveredEntries, classifyNotes]);

  // Default: select everything that would be migrated (based on includeDust setting).
  useEffect(() => {
    if (!notesPreview) {
      setSelectedEntryKeys(new Set());
      return;
    }
    setSelectedEntryKeys(new Set(notesPreview.included.map((n) => n.entryKey)));
  }, [notesPreview]);

  const selectedIncluded = useMemo(() => {
    if (!notesPreview) return [];
    return notesPreview.included.filter((n) => selectedEntryKeys.has(n.entryKey));
  }, [notesPreview, selectedEntryKeys]);

  const selectedTotals = useMemo(() => {
    const sum = selectedIncluded.reduce((acc, r) => acc + BigInt(r.assetsNicks), 0n);
    return { count: selectedIncluded.length, nicks: sum };
  }, [selectedIncluded]);

  const canMigrate = useMemo(() => {
    return Boolean(
      v1Pkh &&
        v0Found &&
        isRoseReady &&
        provider &&
        rpcClient &&
        selectedIncluded.length > 0
    );
  }, [v1Pkh, v0Found, isRoseReady, provider, rpcClient, selectedIncluded.length]);

  const refreshV0Status = useCallback(async () => {
    if (!provider) return;
    const { ok, hasV0Mnemonic } = await provider.request({ method: MIGRATE_V0_GET_STATUS });
    const hasV0Seed = ok && hasV0Mnemonic;
    setHasV0Seed(hasV0Seed);
    return hasV0Seed;
  }, [provider]);

  const discover = useCallback(async () => {
    if (!canDiscover) return;

    setDiscoverStatus("working");
    setDiscoverError(null);
    setV0Found(null);
    setDiscoveredEntries(null);
    setCandidates(null);
    setSelectedEntryKeys(new Set());

    try {
      const hasV0Seed = await refreshV0Status();
        if (!hasV0Seed) {
        setDiscoverError(
          "No v0 seedphrase stored in Rose Wallet yet. Open the Rose Wallet and store your v0 seedphrase there."
        );
        setDiscoverStatus("done");
        return;
      }

      // derive locally via wasm.
      const derived = (() => {
        const manual = v0Address.trim();
        if (!manual) {
          throw new Error("Enter a v0 address (base58 bare pubkey) to discover notes.");
        }
        const pkBytes = base58Decode(manual);
        return [
          {
            label: "manual",
            addressB58: manual,
            pkhDigest: hashPublicKey(pkBytes),
          },
        ];
      })();

      setCandidates(derived);

      let found = null;
      for (const r of derived) {
        const balance = await rpcClient.getBalanceByAddress(r.addressB58);
        const noteCount = balance?.notes?.length ?? 0;

        if (noteCount > 0) {
          const totalNicks = balance.notes.reduce((acc, e) => {
            const n = Note.fromProtobuf(e.note);
            try {
              const v = BigInt(n.assets);
              return acc + v;
            } finally {
              // Ensure WASM resources are always released, even if BigInt(...) throws.
              try {
                n.free();
              } catch {
                // never let cleanup mask the original error
              }
            }
          }, 0n);

          found = {
            label: r.label,
            addressB58: r.addressB58,
            noteCount,
            totalNicks,
            pkhDigest: r.pkhDigest,
          };
          setV0Found(found);
          setDiscoveredEntries(balance.notes);
          break;
        }
      }

      setDiscoverStatus("done");
      if (!found) {
        setDiscoverError("No notes found for derived v0 address candidates. Double-check your legacy address in Rose Wallet.");
      }
    } catch (e) {
      setDiscoverError(e?.message ?? String(e));
      setDiscoverStatus("error");
    }
  }, [canDiscover, rpcClient, refreshV0Status, v0Address]);

  const migrate = useCallback(async () => {
    if (!canMigrate) return;

    setMigrateStatus("working");
    setMigrateError(null);
    setTxId(null);

    const notes = [];
    const spendConditions = [];
    let builder = null;
    let recipientDigest = null;
    let refundDigest = null;
    let tx = null;
    let rawTx = null;

    const safeFree = (obj) => {
      try {
        // wasm-bindgen objects use `__wbg_ptr` for ownership. Some methods (e.g. `TxBuilder.simpleSpend`)
        // consume objects via `__destroy_into_raw()`, which sets `__wbg_ptr = 0`. In that case, the object
        // is already moved into WASM and must not be freed from JS.
        if (obj && typeof obj.__wbg_ptr === "number" && obj.__wbg_ptr === 0) return;
        obj?.free?.();
      } catch {
        // never let cleanup mask the original error
      }
    };

    try {
      const balance = await rpcClient.getBalanceByAddress(v0Found.addressB58);
      const entries = balance?.notes ?? [];
      if (!entries.length) throw new Error("No notes found at v0 address (already migrated?)");

      const trySpendConditionFromEntry = (entry) => {
        // Depending on RPC shape, lock/spend condition might be present separately.
        // Try a few common field names first; fall back to a PKH-based condition for the v0 derived address.
        const candidates = [
          entry?.spendCondition,
          entry?.spend_condition,
          entry?.lock,
          entry?.lockRoot,
        ].filter(Boolean);

        for (const c of candidates) {
          try {
            return SpendCondition.fromProtobuf(c);
          } catch {
            // keep trying
          }
        }

        // Most v0 derived addresses correspond to a simple PKH lock.
        return SpendCondition.newPkh(Pkh.single(v0Found.pkhDigest));
      };

      const matchedSelectedKeys = new Set();
      for (let entryIndex = 0; entryIndex < entries.length; entryIndex++) {
        const e = entries[entryIndex];
        let note = null;
        let entryKey = null;
        try {
          note = Note.fromProtobuf(e.note);
          let digest = null;
          try {
            digest = note.hash();
            entryKey = digest.value;
          } finally {
            safeFree(digest);
          }
        } catch (err) {
          safeFree(note);
          throw err;
        }

        if (!selectedEntryKeys.has(entryKey)) {
          safeFree(note);
          continue;
        }
        matchedSelectedKeys.add(entryKey);
        const assets = typeof note.assets === "bigint" ? note.assets : BigInt(note.assets);

        if (!includeDust && assets <= DUST_THRESHOLD_NICKS) {
          safeFree(note);
          continue;
        }

        try {
          let cond = null;
          try {
            cond = trySpendConditionFromEntry(e);
            notes.push(note);
            spendConditions.push(cond);
            note = null; // ownership transferred to `notes`
            cond = null; // ownership transferred to `spendConditions`
          } finally {
            safeFree(cond);
          }
        } catch {
          safeFree(note);
        }
      }

      const missingSelectedKeys = [];
      for (const k of selectedEntryKeys) {
        if (!matchedSelectedKeys.has(k)) missingSelectedKeys.push(k);
      }
      if (missingSelectedKeys.length > 0) {
        throw new Error(
          `Some selected notes are no longer available since discovery (spent/moved). Please re-discover and re-select. Missing: ${missingSelectedKeys.length}`
        );
      }

      if (!notes.length) {
        throw new Error(
          includeDust
            ? "No notes selected/usable. (All selected notes failed lock parsing.)"
            : "No spendable notes selected. (All selected notes were skipped as dust or failed lock parsing.)"
        );
      }

      builder = new TxBuilder(FEE_PER_WORD);
      recipientDigest = new Digest(v1Pkh);
      refundDigest = new Digest(v1Pkh);

      // NOTE: rose-rs TxBuilder rejects zero-gift simple spends (BuildError::ZeroGift),
      // so we use a 1-nick gift. Since `recipientDigest` == `refundDigest` (both v1 PKH),
      // the outputs effectively consolidate to v1 anyway (minus fees).
      builder.simpleSpend(
        notes,
        spendConditions,
        recipientDigest,
        1n,
        null,
        refundDigest,
        false,
        null
      );

      tx = builder.build();
      rawTx = tx.toRawTx();
      const rawTxProtobuf = rawTx.toProtobuf();

      // Convert wasm objects to protobuf JS objects (where applicable)
      const toProtobuf = (obj) =>
        obj && typeof obj.toProtobuf === "function" ? obj.toProtobuf() : obj;

      const signedRawTx = await provider.request({
        method: MIGRATE_V0_SIGN_RAW_TX,
        params: [
          (() => {
            // Newer Iris builds may not require a derivation label; keep it if we have one.
            const p = {
              rawTx: rawTxProtobuf,
              notes: notes.map(toProtobuf),
              spendConditions: spendConditions.map(toProtobuf),
            };
            if (v0Found?.label && v0Found.label !== "manual") {
              p.derivation = v0Found.label;
            }
            return p;
          })(),
        ],
      });

      await rpcClient.sendTransaction(signedRawTx);

      // Try to surface tx id if present
      try {
        const maybeTx = TxBuilder.fromTx; // keep bundler from tree-shaking wasm too hard
        void maybeTx;
      } catch {
        // ignore
      }

      setMigrateStatus("done");
      setTxId("(submitted)");
    } catch (e) {
      setMigrateError(e?.message ?? String(e));
      setMigrateStatus("error");
    } finally {
      // Cleanup (always run: success *and* failure). Note: ordering matters a bit:
      // free derived tx/rawTx before freeing builder, then free per-note objects.
      safeFree(rawTx);
      safeFree(tx);
      safeFree(builder);
      safeFree(refundDigest);
      safeFree(recipientDigest);
      for (const c of spendConditions) safeFree(c);
      for (const n of notes) safeFree(n);
    }
  }, [canMigrate, provider, rpcClient, v0Found, v1Pkh, includeDust, selectedEntryKeys]);

  return (
    <div className="min-h-screen bg-background no-default-hover-elevate">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ArrowLeftRight className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">Upgrade v0 → v1</span>
            </div>

            <div className="flex items-center gap-3">
              <Link href="/">
                <Button variant="outline" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Home
                </Button>
              </Link>
              <ThemeToggle />
              <WalletConnection provider={provider} onAccountChange={setV1Pkh} />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-10 max-w-3xl">
        <Card className="p-6 space-y-6">
          <Alert className="border-yellow-300/60 bg-yellow-50 text-yellow-900 dark:bg-yellow-950/30 dark:text-yellow-100">
            <AlertTitle>Experimental</AlertTitle>
            <AlertDescription>
              This upgrade flow is experimental. You must use the <span className="font-medium">Rose Wallet</span>{" "}
              as Iris Wallet does not support v0 migrations yet. You must also have your v0 seedphrase stored in Rose Wallet.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              <div className="font-medium">Destination (v1) PKH</div>
            </div>
            {v1Pkh ? (
              <div className="font-mono text-sm break-all">{v1Pkh}</div>
            ) : (
              <div className="flex flex-col gap-3">
                <div className="text-muted-foreground text-sm">
                  Connect Rose Wallet to set the destination v1 address.
                </div>
                <div className="flex">
                  <WalletConnection provider={provider} onAccountChange={setV1Pkh} />
                </div>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="font-medium">v0 pubkey (the really long one)</div>
            <div className="grid grid-cols-1 gap-3">
              <div className="space-y-2">
                <Input
                  value={v0Address}
                  onChange={(e) => setV0Address(e.target.value)}
                  placeholder="v0 pubkey"
                />
              </div>
              <div className="text-xs text-muted-foreground">
                Note: migration signing still requires the Rose Wallet to have your v0 seedphrase stored.
              </div>
            </div>
          </div>

          <Button onClick={discover} disabled={!canDiscover || discoverStatus === "working"}>
            {discoverStatus === "working" ? "Discovering..." : "Discover v0 Notes"}
          </Button>

          {discoverError && (
            <Alert variant="destructive">
              <AlertTitle>Discovery Error</AlertTitle>
              <AlertDescription>{discoverError}</AlertDescription>
            </Alert>
          )}

          {isMethodNotSupported && (
            <Alert className="border-yellow-300/60 bg-yellow-50 text-yellow-900 dark:bg-yellow-950/30 dark:text-yellow-100">
              <AlertTitle>No Support for v0 Migration</AlertTitle>
              <AlertDescription className="space-y-2">
                <div>
                  Your Iris extension is missing the required v0 migration methods (you’re seeing{" "}
                  <span className="font-mono">METHOD_NOT_SUPPORTED</span>).
                </div>
                <div className="space-y-1">
                  <div className="font-medium">Load the unpacked extension (Chrome)</div>
                  <ol className="list-decimal ml-5 space-y-1">
                    <li>
                      Download <a className="underline" href="/rose-extension-dist.zip">`rose-extension-dist.zip`</a> and extract it.
                    </li>
                    <li>Open `chrome://extensions` and enable Developer Mode.</li>
                    <li>Click “Load unpacked” and select the extracted folder.</li>
                    <li>Reload this page and try Discover again.</li>
                  </ol>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {isNoVault && (
            <Alert className="border-yellow-300/60 bg-yellow-50 text-yellow-900 dark:bg-yellow-950/30 dark:text-yellow-100">
              <AlertTitle>Extension Not Initialized</AlertTitle>
              <AlertDescription className="space-y-2">
                <div>
                  The unpacked Rose extension is installed, but it hasn’t been initialized yet (error{" "}
                  <span className="font-mono">NO_VAULT</span>).
                </div>
                <div className="space-y-1">
                  <div className="font-medium">Fix</div>
                  <ol className="list-decimal ml-5 space-y-1">
                    <li>Pin/open the Rose extension popup.</li>
                    <li>Complete onboarding (click "I have a v0 wallet") If you already onboarded click </li>
                    <li>After it shows an account, reload this page and click Discover again.</li>
                  </ol>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {hasV0Seed && (
            <Alert>
              <AlertTitle>Rose v0 seedphrase status</AlertTitle>
              <AlertDescription>
                {hasV0Seed
                  ? "✅ Stored in Rose Wallet (this website has no access to it)."
                  : "❌ Not stored. Open Rose Wallet and store your v0 seedphrase there."}
              </AlertDescription>
            </Alert>
          )}

          {candidates && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Derived v0 candidates (from Rose Wallet)</h2>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Label</TableHead>
                    <TableHead>v0 Address (Bare Pubkey)</TableHead>
                    <TableHead>v1 Address (PKH Digest)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {candidates.map((key, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{key.label}</TableCell>
                      <TableCell className="font-mono text-xs">{shorten(key.addressB58)}</TableCell>
                      <TableCell className="font-mono text-xs">{shorten(key.pkhDigest)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {v0Found && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Discovered v0 Notes</h2>
              <Alert>
                <AlertTitle>Notes found at {v0Found.label} address:</AlertTitle>
                <AlertDescription className="font-mono text-sm break-all">
                  {v0Found.addressB58}
                  <br />
                  ✅ Total Notes: {v0Found.noteCount}
                  <br />
                  ✅ Total Nicks: {v0Found.totalNicks.toString()} (approx. {formatNockApprox(v0Found.totalNicks)} NOCK)
                </AlertDescription>
              </Alert>

              {notesPreview && (
                <>
                  <div className="flex items-start justify-between gap-4 rounded-lg border bg-muted/20 p-4">
                    <div className="space-y-1">
                      <div className="font-medium">Include dust notes</div>
                      <div className="text-xs text-muted-foreground">
                        Dust is ≤ {DUST_THRESHOLD_NICKS.toString()} nicks. Enabling this may migrate notes that are
                        mostly/entirely consumed by fees.
                      </div>
                    </div>
                    <label className="flex items-center gap-2 select-none">
                      <input
                        type="checkbox"
                        className="h-5 w-5 rounded border border-input bg-background"
                        checked={includeDust}
                        onChange={(e) => setIncludeDust(e.target.checked)}
                      />
                      <span className="text-sm text-muted-foreground">Enable</span>
                    </label>
                  </div>

                  {includeDust && (
                    <Alert>
                      <AlertTitle>Warning</AlertTitle>
                      <AlertDescription>
                        Including dust notes can result in little-to-no value arriving in v1 after fees. Only enable
                        this if you explicitly want to sweep everything.
                      </AlertDescription>
                    </Alert>
                  )}

                  {notesPreview.included.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-md font-semibold">
                        Notes to be Migrated ({selectedTotals.count} selected / {notesPreview.totals.includedCount} total, {formatNockApprox(selectedTotals.nicks)} NOCK)
                      </h3>

                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setSelectedEntryKeys(
                              new Set(notesPreview.included.map((n) => n.entryKey))
                            )
                          }
                        >
                          Select all
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedEntryKeys(new Set())}
                        >
                          Select none
                        </Button>
                        {!v1Pkh && (
                          <div className="text-xs text-muted-foreground">
                            Connect your destination wallet to enable migration.
                          </div>
                        )}
                        {v1Pkh && selectedTotals.count === 0 && (
                          <div className="text-xs text-muted-foreground">
                            Select at least one note to migrate.
                          </div>
                        )}
                      </div>

                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[80px]">Pick</TableHead>
                            <TableHead>Name First</TableHead>
                            <TableHead>Name Last</TableHead>
                            <TableHead>Origin Block</TableHead>
                            <TableHead>Assets (Nicks)</TableHead>
                            <TableHead>Assets (NOCK)</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {notesPreview.included.map((n) => (
                          <TableRow key={n.entryKey}>
                              <TableCell>
                                <input
                                  type="checkbox"
                                  className="h-4 w-4 rounded border border-input bg-background"
                                checked={selectedEntryKeys.has(n.entryKey)}
                                  onChange={(e) => {
                                    const checked = e.target.checked;
                                  setSelectedEntryKeys((prev) => {
                                      const next = new Set(prev);
                                    if (checked) next.add(n.entryKey);
                                    else next.delete(n.entryKey);
                                      return next;
                                    });
                                  }}
                                />
                              </TableCell>
                              <TableCell className="font-mono text-xs">{shorten(n.nameFirst)}</TableCell>
                              <TableCell className="font-mono text-xs">{shorten(n.nameLast)}</TableCell>
                              <TableCell className="font-mono text-xs">{n.originPage}</TableCell>
                              <TableCell className="font-mono text-xs">{n.assetsNicksStr}</TableCell>
                              <TableCell className="font-mono text-xs">{n.assetsNock}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}

                  {notesPreview.skipped.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-md font-semibold">
                        Skipped Notes ({notesPreview.totals.skippedCount} notes, {formatNockApprox(notesPreview.totals.skippedNicks)} NOCK)
                      </h3>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name First</TableHead>
                            <TableHead>Name Last</TableHead>
                            <TableHead>Origin Block</TableHead>
                            <TableHead>Assets (Nicks)</TableHead>
                            <TableHead>Reason</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {notesPreview.skipped.map((n, i) => (
                            <TableRow key={i}>
                              <TableCell className="font-mono text-xs">{shorten(n.nameFirst)}</TableCell>
                              <TableCell className="font-mono text-xs">{shorten(n.nameLast)}</TableCell>
                              <TableCell className="font-mono text-xs">{n.originPage}</TableCell>
                              <TableCell className="font-mono text-xs">{n.assetsNicksStr}</TableCell>
                              <TableCell className="text-sm text-muted-foreground">{n.reason}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </>
              )}

              <Button onClick={migrate} disabled={!canMigrate || migrateStatus === "working"}>
                {migrateStatus === "working"
                  ? "Migrating..."
                  : includeDust
                    ? "Migrate Notes (including dust) to v1"
                    : "Migrate Spendable Notes to v1"}
              </Button>
            </div>
          )}

          {migrateError && (
            <Alert variant="destructive">
              <AlertTitle>Migration Error</AlertTitle>
              <AlertDescription>{migrateError}</AlertDescription>
            </Alert>
          )}

          {txId && (
            <Alert>
              <AlertTitle>Migration Transaction Sent!</AlertTitle>
              <AlertDescription className="font-mono text-sm break-all">{txId}</AlertDescription>
            </Alert>
          )}
        </Card>
      </main>
    </div>
  );
}
