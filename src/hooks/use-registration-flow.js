import { useState, useCallback } from "react";
import { PAYMENT_ADDRESS, getFee } from "@/common";
import { postRegister } from "@/api";

const STATUSES = {
  idle: "idle",
  validating: "validating",
  requesting: "requesting",
  building: "building",
  signing: "signing",
  sending: "sending",
  pending: "pending",
  confirmed: "confirmed",
  failed: "failed",
};

export function useRegistrationFlow({ provider, rpcClient, wasm }) {
  const [status, setStatus] = useState(STATUSES.idle);
  const [statusText, setStatusText] = useState("");
  const [transactionHash, setTransactionHash] = useState();
  const [isProcessing, setIsProcessing] = useState(false);

  const reset = useCallback(() => {
    setStatus(STATUSES.idle);
    setStatusText("");
    setTransactionHash(undefined);
    setIsProcessing(false);
  }, []);

  const registerDomain = useCallback(
    async (name, address) => {
      setIsProcessing(true);
      setStatus(STATUSES.validating);
      setStatusText("Validating request...");
      setTransactionHash(undefined);

      try {
        if (!name || !/^[a-z0-9]+\.nock$/.test(name)) {
          setStatus(STATUSES.failed);
          setStatusText("Name must be alphanumeric lowercase and end with .nock");
          return { ok: false };
        }

        if (!address) {
          setStatus(STATUSES.failed);
          setStatusText("Please connect your wallet first");
          return { ok: false };
        }

        if (!provider) {
          setStatus(STATUSES.failed);
          setStatusText("Wallet provider not ready");
          return { ok: false };
        }

        if (!rpcClient || !wasm) {
          setStatus(STATUSES.failed);
          setStatusText("RPC client or WASM not initialized");
          return { ok: false };
        }

        setStatus(STATUSES.requesting);
        setStatusText("Creating registration request...");
        const response = await postRegister(name, address);
        const key = response?.key ?? "";
        const [regStatus, responseName] = key.split(":");

        if (regStatus === "pending") {
          const fee = getFee(responseName);

          // Fetch balance
          let balance;
          let spendCondition;
          setStatus(STATUSES.building);
          setStatusText("Fetching wallet balance...");
          try {
            const pkh = wasm.Pkh.single(address);
            spendCondition = wasm.SpendCondition.newPkh(pkh);
            const firstName = spendCondition.firstName();
            balance = await rpcClient.getBalanceByFirstName(firstName.value);

            if (!balance?.notes?.length) {
              setStatus(STATUSES.failed);
              setStatusText("No funds available in wallet");
              return { ok: false };
            }
          } catch (err) {
            setStatus(STATUSES.failed);
            setStatusText("Failed to fetch wallet balance");
            return { ok: false, error: err };
          }

          // Build transaction
          const notes = balance.notes.map((n) => wasm.Note.fromProtobuf(n.note));
          notes.sort((a, b) => Number(b.assets) - Number(a.assets));
          const note = notes[0];
          const amount = BigInt(fee * 65536);
          const feePerWord = BigInt(32768); // 0.5 NOCK per word
          const builder = new wasm.TxBuilder(feePerWord);
          const recipientDigest = new wasm.Digest(PAYMENT_ADDRESS);
          const refundDigest = new wasm.Digest(address);

          builder.simpleSpend(
            [note],
            [spendCondition],
            recipientDigest,
            amount,
            null,
            refundDigest,
            false
          );

          const nockchainTx = builder.build();
          const rawTxProtobuf = nockchainTx.toRawTx().toProtobuf();
          const txNotes = builder.allNotes();

          // Sign
          setStatus(STATUSES.signing);
          setStatusText("Signing transaction...");

          const signedTxProtobuf = await provider.signRawTx({
            rawTx: rawTxProtobuf,
            notes: txNotes.notes,
            spendConditions: txNotes.spendConditions,
          });

          // Send
          setStatus(STATUSES.sending);
          setStatusText("Sending transaction...");

          const result = await rpcClient.sendTransaction(signedTxProtobuf);
          if (!result) {
            setStatus(STATUSES.failed);
            setStatusText("Transaction send returned no result");
            return { ok: false };
          }

          setTransactionHash(nockchainTx.id.value);
          setStatus(STATUSES.pending);
          setStatusText(
            `Transaction sent! Waiting for confirmation... TX: ${nockchainTx.id.value}`
          );

          return { ok: true, hash: nockchainTx.id.value, result };
        }

        if (regStatus === "confirmed") {
          setStatus(STATUSES.confirmed);
          setStatusText("Domain registered successfully!");
          return { ok: true };
        }

        setStatus(STATUSES.failed);
        setStatusText("Registration failed");
        return { ok: false };
      } catch (error) {
        setStatus(STATUSES.failed);
        setStatusText(
          "Error during transaction: " +
            (error?.response?.data?.error ?? error.message ?? String(error))
        );
        return { ok: false, error };
      } finally {
        setIsProcessing(false);
      }
    },
    [provider, rpcClient, wasm]
  );

  return {
    status,
    statusText,
    transactionHash,
    isProcessing,
    registerDomain,
    reset,
  };
}

export { STATUSES };

