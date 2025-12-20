import { useState, useCallback } from "react";
import { PAYMENT_ADDRESS, getFee } from "@/common";
import { postRegister, postVerify } from "@/api";
import { Pkh, TxBuilder, SpendCondition, Digest, Note } from "@nockbox/iris-wasm";

const STATUSES = {
  idle: "idle",
  validating: "validating",
  requesting: "requesting",
  verifying: "verifying",
  building: "building",
  signing: "signing",
  sending: "sending",
  pending: "pending",
  confirmed: "confirmed",
  failed: "failed",
};

export function useRegistrationFlow({ provider, rpcClient }) {
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

  const verifyPayment = useCallback(
    async (name, address) => {
      setIsProcessing(true);
      setTransactionHash(undefined);
      setStatus(STATUSES.verifying);
      setStatusText("Verifying payment...");

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

        const res = await postVerify(name, address);
        const registration = res?.registration;
        const message = res?.message ?? "Verification complete";

        if (!registration) {
          setStatus(STATUSES.failed);
          setStatusText(message);
          return { ok: false };
        }

        if (registration.status === "registered") {
          setStatus(STATUSES.confirmed);
          setStatusText(message);
          if (registration.txHash) setTransactionHash(registration.txHash);
          return { ok: true, registration };
        }

        setStatus(STATUSES.pending);
        setStatusText(message);
        if (registration.txHash) setTransactionHash(registration.txHash);
        return { ok: true, registration };
      } catch (error) {
        setStatus(STATUSES.failed);
        setStatusText(
          "Error verifying payment: " +
            (error?.response?.data?.error ?? error.message ?? String(error))
        );
        return { ok: false, error };
      } finally {
        setIsProcessing(false);
      }
    },
    []
  );

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

        if (!rpcClient) {
          setStatus(STATUSES.failed);
          setStatusText("RPC client not initialized");
          return { ok: false };
        }

        setStatus(STATUSES.requesting);
        setStatusText("Creating registration request...");
        const response = await postRegister(name, address);
        if (response?.address !== address) {
          setStatus(STATUSES.failed);
          setStatusText("Address mismatch");
          return { ok: false };
        }
        if(response.name !== name) {
          setStatus(STATUSES.failed);
          setStatusText("Name mismatch");
          return { ok: false };
        }

        if (response.status === "pending") {
          const fee = getFee(name);

          // Fetch balance
          let balance;
          let spendCondition;
          setStatus(STATUSES.building);
          setStatusText("Fetching wallet balance...");
          try {
            // Note: `SpendCondition.newPkh` consumes the passed `Pkh` (moves it),
            // so don't reuse the same `Pkh` instance across calls.
            spendCondition = SpendCondition.newPkh(Pkh.single(address));
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
          const notes = balance.notes.map((n) => Note.fromProtobuf(n.note));
          notes.sort((a, b) => Number(b.assets) - Number(a.assets));
          const note = notes[0];
          const amount = BigInt(fee * 65536);
          const feePerWord = BigInt(32768); // 0.5 NOCK per word
          const builder = new TxBuilder(feePerWord);
          const recipientDigest = new Digest(PAYMENT_ADDRESS);
          const refundDigest = new Digest(address);

          // `simpleSpend` expects notes and spend_conditions to have the same length.
          // Also, `SpendCondition.newPkh` consumes the passed `Pkh`, so create a fresh one per note.
          const spendConditions = notes.map(() =>
            SpendCondition.newPkh(Pkh.single(address))
          );

          builder.simpleSpend(
            notes,
            spendConditions,
            recipientDigest,
            amount,
            null,
            refundDigest,
            false,
            // TODO: Hold on memo until iris is ready
            //`nockname=${name}` //memo
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

        if (response.status === "confirmed") {
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
    [provider, rpcClient]
  );

  return {
    status,
    statusText,
    transactionHash,
    isProcessing,
    registerDomain,
    verifyPayment,
    reset,
  };
}

export { STATUSES };

