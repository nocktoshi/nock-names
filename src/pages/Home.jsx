import { useState, useEffect } from "react";
import { Zap, Search } from "lucide-react";
import { Link } from "wouter";
import DomainSearch from "@/components/DomainSearch";
import DomainCard from "@/components/DomainCard";
import DomainSuggestions from "@/components/DomainSuggestions";
import RecentlyRegistered from "@/components/RecentlyRegistered";
import WalletConnection from "@/components/WalletConnection";
import RegistrationModal from "@/components/RegistrationModal";
import ThemeToggle from "@/components/ThemeToggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NockchainProvider, wasm } from "@nockbox/iris-sdk";

import { fetchSearchResults, postRegister } from "@/api";
import { getFee, PAYMENT_ADDRESS } from "@/common";

export default function Home() {
  const [searchResults, setSearchResults] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState();
  const [statusText, setStatusText] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [connectedAccount, setConnectedAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [transactionHash, setTransactionHash] = useState();
  const [rpcClient, setRpcClient] = useState(null);

  useEffect(() => {
    const initWalletAndWasm = async () => {
      try {
        await wasm.default(); // Initialize the WASM module
        const client = new wasm.GrpcClient("https://rpc.nockbox.org");
        setRpcClient(client);

        // Initialize wallet provider
        const nockchain = new NockchainProvider();
        setProvider(nockchain); // Set provider immediately so UI can show connect button
      } catch (error) {
        console.error("Failed to initialize WASM or NockchainProvider:", error);
        // Provider is still set, so user can try to connect manually
      }
    };

    initWalletAndWasm();
  }, []);

  // todo: remove mock functionality
  const mockSuggestions = (originalDomain) => {
    return [
      {
        name: `${originalDomain}app.nock`,
        price: getFee(`${originalDomain}app`),
        isAvailable: true,
        owner: null,
        registeredAt: null,
        expiresAt: null,
      },
      {
        name: `${originalDomain}2025.nock`,
        price: getFee(`${originalDomain}2025`),
        isAvailable: true,
        owner: null,
        registeredAt: null,
        expiresAt: null,
      },
      {
        name: `my${originalDomain}.nock`,
        price: getFee(`my${originalDomain}`),
        isAvailable: true,
        owner: null,
        registeredAt: null,
        expiresAt: null,
      },
    ];
  };

  const handleSearch = async (domain) => {
    setIsLoading(true);
    setSearchTerm(domain);
    console.log(`Searching for domain: ${domain}`);

    fetchSearchResults(domain).then((data) => {
      if (data) {
        setSearchResults([data]);
        // If the main domain is taken, show suggestions
        if (!data.isAvailable) {
          const generatedSuggestions = mockSuggestions(
            domain.replace(".nock", "")
          );
          setSuggestions(generatedSuggestions);
        } else {
          setSuggestions([]);
        }
      } else {
        setSearchResults([]);
        setSuggestions([]);
      }
      setIsLoading(false);
    });
  };

  const handleRegister = (domain) => {
    setSelectedDomain(domain);
    setIsModalOpen(true);
    setTransactionStatus(undefined);
  };

  const handleConfirmRegistration = async (name) => {
    console.log(`Confirming registration for: ${name}`);
    setIsRegistering(true);
    setStatusText("");

    const address = connectedAccount;

    try {
      if (!/^[a-z0-9]+\.nock$/.test(name)) {
        setTransactionStatus("failed");
        setStatusText("Name must be alphanumeric lowercase and end with .nock");
        return;
      }
      if (!address) {
        setTransactionStatus("failed");
        setStatusText("Please connect your wallet first");
        return;
      }

      const response = await postRegister(name, address);
      const [status, responseName] = response.key.split(":");
      if (status === "pending") {
        const fee = getFee(responseName);
        setTransactionStatus("sending");
        setStatusText("Sending transaction...");

        try {
          // Implement full WASM transaction flow as recommended by devs:
          // 1. Get balance with WASM gRPC client
          // 2. Build tx with WASM using user's balance/notes
          // 3. Sign with provider
          // 4. Send signed tx over WASM gRPC client

          setStatusText("Fetching wallet balance...");

          console.log("Connected address:", address);

          // Get balance from the blockchain
          let balance, spendCondition;
          try {
            const pkh = wasm.Pkh.single(address);
            console.log("PKH created:", pkh);

            spendCondition = wasm.SpendCondition.newPkh(pkh);
            console.log("Spend condition created:", spendCondition);

            const firstName = spendCondition.firstName();
            console.log("First name:", firstName.value);

            balance = await rpcClient.getBalanceByFirstName(firstName.value);
            if (!balance || !balance.notes || balance.notes.length === 0) {
              console.log("No notes found - wallet might be empty");
              setTransactionStatus("failed");
              setStatusText("No funds available in wallet");
              return;
            }
          } catch (balanceError) {
            console.error("Error fetching balance:", balanceError);
            setTransactionStatus("failed");
            setStatusText("Failed to fetch wallet balance");
            return;
          }

          console.log("Found " + balance.notes.length + " notes");

          // Convert notes from protobuf
          const notes = balance.notes.map((n) =>
            wasm.Note.fromProtobuf(n.note)
          );
          notes.sort((a, b) => Number(b.assets) - Number(a.assets));
          const note = notes[0];
          const noteAssets = note.assets;
          console.log("Using note with " + noteAssets + " nicks");

          const amount = BigInt(fee * 65536);
          const feePerWord = BigInt(32768); // 0.5 NOCK per word

          console.log("Building transaction to send " + amount + " nicks...");
          const builder = new wasm.TxBuilder(feePerWord);

          // Create recipient digest - using PAYMENT_ADDRESS from common
          const recipient = PAYMENT_ADDRESS;
          const recipientDigest = new wasm.Digest(recipient);

          // Create refund digest (same as wallet PKH)
          const refundDigest = new wasm.Digest(address);
          console.log("Creating simple spend...");
          console.log({
            note: notes[0].value,
            sc: spendCondition.value,
            rec: recipientDigest.value,
            amt: amount,
            ref: refundDigest.value,
          });
          builder.simpleSpend(
            [notes[0]],
            [spendCondition],
            recipientDigest,
            amount,
            null, // fee_override (let it auto-calculate)
            refundDigest,
            false // include_lock_data (no lockData for lower fees)
          );

          // 7. Build the transaction and get notes/spend conditions
          console.log("Building raw transaction...");
          const nockchainTx = builder.build();
          console.log("Transaction ID: " + nockchainTx.id.value);

          const rawTxProtobuf = nockchainTx.toRawTx().toProtobuf();

          // Get notes and spend conditions from builder
          const txNotes = builder.allNotes();

          console.log("Notes count: " + txNotes.notes.length);
          console.log(
            "Spend conditions count: " + txNotes.spendConditions.length
          );

          // 8. Sign using provider.signRawTx (pass wasm notes directly)
          setStatusText("Signing transaction...");

          // Sign the transaction with provider
          const signedTxProtobuf = await provider.signRawTx({
            rawTx: rawTxProtobuf, // Pass wasm RawTx directly
            notes: txNotes.notes, // Pass wasm Note objects directly
            spendConditions: txNotes.spendConditions, // Pass wasm SpendCondition objects directly
          });

          console.log("Transaction signed successfully!");

          setStatusText("Sending transaction...");

          // Send via WASM gRPC client
          console.log("Sending transaction via RPC client...");
          const result = await rpcClient.sendTransaction(signedTxProtobuf);
          console.log("Transaction result:", result);
          console.log("Transaction sent, TX ID:", nockchainTx.id.value);

          setTransactionHash(nockchainTx.id.value);
          setTransactionStatus("pending");
          setStatusText(
            `Transaction sent! Waiting for confirmation...\nTransaction Hash: ${nockchainTx.id.value}`
          );
        } catch (error) {
          console.error("Transaction error:", error);
          setTransactionStatus("failed");
          setStatusText("Error during transaction: " + error);
        } finally {
          setIsRegistering(false);
        }
      } else if (status === "confirmed") {
        setTransactionStatus("confirmed");
        setStatusText("Domain registered successfully!");
      } else {
        setTransactionStatus("failed");
        setStatusText("Registration failed");
      }
    } catch (error) {
      setTransactionStatus("failed");
      setStatusText(
        "Error during transaction: " +
          (error?.response?.data?.error ?? error.message ?? error)
      );
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDomain(null);
    setTransactionStatus(undefined);
    setTransactionHash(undefined);
    setIsRegistering(false);
  };

  return (
    <div className="min-h-screen bg-background no-default-hover-elevate">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <Zap className="h-6 w-6 text-primary web3-pulse" />
                <span className="text-xl font-bold web3-gradient-text">
                  NockNames
                </span>
              </div>
              <Badge variant="secondary" className="text-xs">
                Beta
              </Badge>
            </div>

            <div className="flex items-center gap-3">
              <Link href="/lookup">
                <Button
                  variant="outline"
                  className="gap-2"
                  data-testid="button-navigate-lookup"
                >
                  <Search className="h-4 w-4" />
                  Lookup
                </Button>
              </Link>
              <ThemeToggle />
              <WalletConnection
                provider={provider}
                onAccountChange={setConnectedAccount}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 web3-gradient-text">
            Claim Your .nock
          </h1>
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            Search, register, and manage your .nock domains
          </p>

          <DomainSearch onSearch={handleSearch} isLoading={isLoading} />
        </div>
      </section>

      {/* Results Section */}
      {searchResults.length > 0 && (
        <section className="py-8 px-4 no-default-hover-elevate">
          <div className="container mx-auto">
            <div className="max-w-4xl mx-auto">
              <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-2">Search Results</h2>
                <p className="text-muted-foreground">
                  Results for "<span className="font-mono">{searchTerm}</span>"
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {searchResults.map((domain) => (
                  <DomainCard
                    key={domain.name}
                    domain={domain}
                    onRegister={handleRegister}
                    isRegistering={isRegistering}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Suggestions Section */}
      {suggestions.length > 0 && (
        <section className="py-8 px-4 no-default-hover-elevate">
          <div className="container mx-auto">
            <DomainSuggestions
              originalSearch={searchTerm}
              suggestions={suggestions}
              onRegister={handleRegister}
              isRegistering={isRegistering}
            />
          </div>
        </section>
      )}

      {/* Recently Registered Section */}
      <section className="py-8 px-4 no-default-hover-elevate">
        <div className="container mx-auto">
          <RecentlyRegistered limit={6} />
        </div>
      </section>

      {/* Empty State */}
      {searchResults.length === 0 && !isLoading && (
        <section className="py-8 px-4 no-default-hover-elevate">
          <div className="container mx-auto text-center max-w-2xl">
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div
                  className="p-4 rounded-lg border hover-elevate cursor-pointer glassmorphism web3-glow-hover"
                  onClick={() => handleSearch("myname")}
                >
                  <span className="font-mono text-sm">myname.nock</span>
                </div>
                <div
                  className="p-4 rounded-lg border hover-elevate cursor-pointer glassmorphism web3-glow-hover"
                  onClick={() => handleSearch("awesome")}
                >
                  <span className="font-mono text-sm">awesome.nock</span>
                </div>
                <div
                  className="p-4 rounded-lg border hover-elevate cursor-pointer glassmorphism web3-glow-hover"
                  onClick={() => handleSearch("crypto")}
                >
                  <span className="font-mono text-sm">crypto.nock</span>
                </div>
                <div
                  className="p-4 rounded-lg border hover-elevate cursor-pointer glassmorphism web3-glow-hover"
                  onClick={() => handleSearch("future")}
                >
                  <span className="font-mono text-sm">future.nock</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Registry Address Banner */}
      <div className="bg-muted/50 border-b border-border">
        <div className="container mx-auto px-4 py-2">
          <div className="text-center text-sm text-muted-foreground">
            <span className="font-medium">Registry/Payments Address:</span>
            <br />
            <code className="bg-background px-2 py-1 rounded text-xs font-mono">
              nocknames.nock =&gt;
              8s29XUK8Do7QWt2MHfPdd1gDSta6db4c3bQrxP1YdJNfXpL3WPzTT5
            </code>
            <br />
            <code className="bg-background px-2 py-1 rounded text-xs font-mono">
              Questions? Contact @nocktoshi on tg
            </code>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-sm text-muted-foreground">
            <p>&copy; 2026 Nockchain.net, LLC. Powered by Nockchain.</p>
          </div>
        </div>
      </footer>

      {/* Registration Modal */}
      <RegistrationModal
        domain={selectedDomain}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmRegistration}
        isProcessing={isRegistering}
        transactionHash={transactionHash}
        transactionStatus={transactionStatus}
        statusText={statusText}
        account={connectedAccount}
        onAccountChange={setConnectedAccount}
        provider={provider}
      />
    </div>
  );
}
