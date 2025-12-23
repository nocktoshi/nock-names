import { useState } from "react";
import { ArrowLeft, Wallet } from "lucide-react";
import { Link } from "wouter";
import ThemeToggle from "@/components/ThemeToggle";
import WalletConnection from "@/components/WalletConnection";
import AddressPortfolio from "@/components/AddressPortfolio";
import RegistrationModal from "@/components/RegistrationModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRose } from "@nockchain/sdk";
import { useRegistrationFlow } from "@/hooks/use-registration-flow";
import { useAddressPortfolioQuery } from "@/hooks/use-queries";

export default function MyNock() {
  const rose = useRose();
  const { provider, status: roseStatus, error: roseError, isReady: isRoseReady } =
    rose;

  const {
    status: transactionStatus,
    statusText,
    transactionHash,
    isProcessing: isRegistering,
    registerDomain,
    verifyPayment,
    reset: resetRegistration,
  } = useRegistrationFlow(rose);

  const [connectedAccount, setConnectedAccount] = useState(null);
  const [selectedDomain, setSelectedDomain] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const portfolioQuery = useAddressPortfolioQuery(connectedAccount);
  const domains = portfolioQuery.data || [];

  const handleDomainRegister = (domain) => {
    if (!isRoseReady) return;
    resetRegistration();
    setSelectedDomain(domain);
    setIsModalOpen(true);
  };

  const handleConfirmRegistration = async (name) => {
    if (!isRoseReady) return;
    await registerDomain(name, connectedAccount);
  };

  const handleVerifyPayment = async (name, addressOverride) => {
    if (!isRoseReady) return;
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
                <Button variant="outline" size="icon">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-primary" />
                <h1 className="text-xl font-bold">My .nock</h1>
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

      {/* Content */}
      <section className="py-12 px-4">
        <div className="container mx-auto">
          {!connectedAccount ? (
            <div className="max-w-2xl mx-auto text-center space-y-4">
              <h2 className="text-2xl font-semibold">Connect your wallet</h2>
              <p className="text-muted-foreground">
                Connect to view your nock names (no search required).
              </p>
              <div className="flex justify-center">
                <WalletConnection
                  provider={provider}
                  onAccountChange={setConnectedAccount}
                />
              </div>
            </div>
          ) : portfolioQuery.isFetching ? (
            <div className="text-center text-sm text-muted-foreground">
              Loading your portfolio…
            </div>
          ) : (
            <AddressPortfolio
              address={connectedAccount}
              domains={domains}
              onRegister={handleDomainRegister}
            />
          )}
        </div>
      </section>

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
        isRoseReady={isRoseReady}
        roseStatus={roseStatus}
        roseError={roseError}
      />
    </div>
  );
}


