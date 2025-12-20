import { useState } from "react";
import { ArrowLeft, Search } from "lucide-react";
import { Link } from "wouter";
import LookupSearch from "@/components/LookupSearch";
import DomainDetails from "@/components/DomainDetails";
import AddressPortfolio from "@/components/AddressPortfolio";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLookupQuery } from "@/hooks/use-queries";
import RegistrationModal from "@/components/RegistrationModal";
import { useRegistrationFlow } from "@/hooks/use-registration-flow";
import { useIris } from "@/hooks/use-iris";
import ThemeToggle from "@/components/ThemeToggle";
import WalletConnection from "@/components/WalletConnection";

export default function Lookup() {
  const iris = useIris();
  const { provider, status: irisStatus, error: irisError, isReady: isIrisReady } = iris;
  const {
    status: transactionStatus,
    statusText,
    transactionHash,
    isProcessing: isRegistering,
    registerDomain,
    verifyPayment,
    reset: resetRegistration,
  } = useRegistrationFlow(iris);

  const [params, setParams] = useState({ query: null, type: "domain" });
  const [error, setError] = useState("");
  const [selectedDomain, setSelectedDomain] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [connectedAccount, setConnectedAccount] = useState(null);
  const lookupQuery = useLookupQuery(params);

  const handleSearch = async (query, type) => {
    setError("");
    console.log(`Looking up ${type}: ${query}`);
    try {
      setParams({ query, type });
    } catch (e) {
      console.error("Lookup failed", e);
      setError("Lookup failed. Please try again.");
    }
  };

  const handleDomainRegister = (domain) => {
    console.log(`Registering domain from lookup: ${domain.name}`);
    if (!isIrisReady) return;
    resetRegistration();
    setSelectedDomain(domain);
    setIsModalOpen(true);
  };

  const handleConfirmRegistration = async (name) => {
    if (!isIrisReady) return;
    await registerDomain(name, connectedAccount);
  };

  const handleVerifyPayment = async (name, addressOverride) => {
    if (!isIrisReady) return;
    await verifyPayment(name, addressOverride ?? connectedAccount);
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
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button
                  variant="outline"
                  size="icon"
                  data-testid="button-back-home"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <Search className="h-5 w-5 text-primary" />
                <h1 className="text-xl font-bold">Domain Lookup</h1>
              </div>
              <Badge variant="secondary" className="text-xs cursor-pointer">
                Beta
              </Badge>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <WalletConnection
                provider={provider}
                onAccountChange={setConnectedAccount}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Search Section */}
      <section className="py-12 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 web3-gradient-text">
            Lookup Domain Information
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Search for detailed domain information by name or explore all domains owned by a wallet address
          </p>
          
          <LookupSearch onSearch={handleSearch} isLoading={lookupQuery.isFetching} />
          {error && (
            <p className="text-sm text-destructive mt-3" role="alert">
              {error}
            </p>
          )}
        </div>
      </section>

      {/* Results Section */}
      {lookupQuery.data && (
        <section className="py-8 px-4 no-default-hover-elevate">
          <div className="container mx-auto">
            {lookupQuery.data.type === 'domain' ? (
              <div className="space-y-4">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-semibold mb-2">Domain Information</h3>
                  <p className="text-muted-foreground">
                    Results for domain "<span className="font-mono">{lookupQuery.data.query}</span>"
                  </p>
                </div>
                <DomainDetails
                  domain={lookupQuery.data.data}
                  onRegister={handleDomainRegister}
                  isRegistering={isRegistering}
                  isRegisterDisabled={!isIrisReady}
                />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-semibold mb-2">Address Portfolio</h3>
                  <p className="text-muted-foreground">
                    Domains owned by "<span className="font-mono text-xs">{lookupQuery.data.query}</span>"
                  </p>
                </div>
                <AddressPortfolio 
                  address={lookupQuery.data.query}
                  domains={lookupQuery.data.data}
                  onRegister={handleDomainRegister}
                />
              </div>
            )}
          </div>
        </section>
      )}

      <RegistrationModal
        domain={selectedDomain}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmRegistration}
        onVerify={handleVerifyPayment}
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

      {/* Empty State */}
      {!lookupQuery.data && !lookupQuery.isFetching && (
        <section className="py-16 px-4">
          <div className="container mx-auto text-center max-w-2xl">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-6 rounded-lg bg-card border hover-elevate cursor-pointer" 
                     onClick={() => handleSearch('johndoe', 'domain')}>
                  <div className="text-lg font-semibold mb-2">Try Domain Search</div>
                  <span className="font-mono text-sm text-primary">johndoe.nock</span>
                </div>
                <div className="p-6 rounded-lg bg-card border hover-elevate cursor-pointer" 
                     onClick={() => handleSearch('8s29XUK8Do7QWt2MHfPdd1gDSta6db4c3bQrxP1YdJNfXpL3WPzTT5', 'address')}>
                  <div className="text-lg font-semibold mb-2">Try Address Search</div>
                  <span className="font-mono text-xs text-primary">8s29X...WPzTT5</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Click on the examples above to see how the lookup works
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-sm text-muted-foreground">
            <p>&copy; 2026 Nockchain.net, LLC. Advanced domain tools for the Nockchain ecosystem.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}