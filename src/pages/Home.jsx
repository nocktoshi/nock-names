import { useState } from "react";
import { Zap, Search } from "lucide-react";
import { Link } from "wouter";
import DomainSearch from "@/components/DomainSearch";
import DomainCard from "@/components/DomainCard";
import DomainSuggestions from "@/components/DomainSuggestions";
import RecentlyRegistered from "@/components/RecentlyRegistered";
import WalletConnection from "@/components/WalletConnection";
import RegistrationModal from "@/components/RegistrationModal";
import ThemeToggle from "@/components/ThemeToggle";
import { useRegistrationFlow } from "@/hooks/use-registration-flow";
import { useDomainSearch, useSuggestions } from "@/hooks/use-queries";
import { useIris } from "@nockbox/iris-sdk";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function Home() {
  const iris = useIris();
  const {
    provider,
    status: irisStatus,
    error: irisError,
    isReady: isIrisReady,
  } = iris;
  const [selectedDomain, setSelectedDomain] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    status: transactionStatus,
    statusText,
    transactionHash,
    isProcessing: isRegistering,
    registerDomain,
    reset: resetRegistration,
  } = useRegistrationFlow(iris);
  const [searchTerm, setSearchTerm] = useState("");
  const [connectedAccount, setConnectedAccount] = useState(null);


  const searchQuery = useDomainSearch(searchTerm);
  const suggestionsQuery = useSuggestions(
    searchTerm,
    Boolean(searchQuery.data && !searchQuery.data.isAvailable)
  );

  const searchResults = searchQuery.data ? [searchQuery.data] : [];
  const suggestions = suggestionsQuery.data || [];
  const isLoading = searchQuery.isFetching || suggestionsQuery.isFetching;

  const handleSearch = async (domain) => {
    setSearchTerm(domain);
    console.log(`Searching for domain: ${domain}`);
  };

  const handleRegister = (domain) => {
    if (!isIrisReady) return;
    resetRegistration();
    setSelectedDomain(domain);
    setIsModalOpen(true);
  };

  const handleConfirmRegistration = async (name) => {
    if (!isIrisReady) return;
    console.log(`Confirming registration for: ${name}`);
    await registerDomain(name, connectedAccount);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDomain(null);
    resetRegistration();
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
                    isRegisterDisabled={!isIrisReady}
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
              isRegisterDisabled={!isIrisReady}
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
        isIrisReady={isIrisReady}
        irisStatus={irisStatus}
        irisError={irisError}
      />
    </div>
  );
}
