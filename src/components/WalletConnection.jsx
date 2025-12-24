import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { NockchainProvider } from "@nockchain/sdk";
import Rose32 from "@/assets/Rose32.png";

const WalletConnection = ({ provider, onAccountChange }) => {
  const [account, setAccount] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    if (!provider) return;

    // Check if already connected
    if (provider.isConnected && provider.accounts.length > 0) {
      const acc = provider.accounts[0];
      setAccount(acc);
      onAccountChange?.(acc);
    }

    // Listen for account changes
    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        setAccount(null);
        onAccountChange?.(null);
      } else {
        const acc = accounts[0];
        setAccount(acc);
        onAccountChange?.(acc);
      }
    };

    provider.on("accountsChanged", handleAccountsChanged);

    return () => {
      provider.off("accountsChanged", handleAccountsChanged);
      provider.dispose();
    };
  }, [provider, onAccountChange]);

  const handleConnect = async () => {
    if (!provider) return;

    setIsConnecting(true);
    try {
      const walletInfo = await provider.connect();
      setAccount(walletInfo.pkh);
      onAccountChange?.(walletInfo.pkh);
    } catch (error) {
      console.error("Connection failed:", error);
      // Handle user rejection or other errors silently
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    setAccount(null);
    onAccountChange?.(null);
  };

  if (!NockchainProvider.isInstalled()) {
    return (
      <Button variant="outline" asChild>
        <a
          href="https://chromewebstore.google.com/detail/Iris%20Wallet/opodllkjacnodkojeedmgjbogbmfchlb"
          target="_blank"
          rel="noopener noreferrer"
        >
          Install Iris Wallet
        </a>
      </Button>
    );
  }

  if (!provider) {
    return (
      <Button
        disabled
        className="bg-gradient-to-r from-purple-500 to-pink-500 opacity-50 cursor-not-allowed"
      >
        <img
          src="data:image/svg+xml,%3csvg%20width='512'%20height='512'%20viewBox='0%200%20512%20512'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3cpath%20d='M256.614%20200.083C287.496%20200.083%20312.53%20225.118%20312.531%20256C312.531%20286.883%20287.497%20311.917%20256.614%20311.917C225.732%20311.916%20200.698%20286.882%20200.698%20256C200.698%20225.118%20225.733%20200.084%20256.614%20200.083Z'%20fill='black'/%3e%3cpath%20fill-rule='evenodd'%20clip-rule='evenodd'%20d='M332.427%200C374.975%200.00228222%20409.465%2034.4936%20409.468%2077.0417V101.896H434.323C476.876%20101.896%20511.364%20136.405%20511.364%20178.958C511.361%20221.475%20476.931%20255.945%20434.427%20256C476.931%20256.054%20511.381%20290.525%20511.385%20333.042C511.385%20375.594%20476.875%20410.104%20434.323%20410.104H409.468V434.958C409.463%20477.506%20374.975%20511.998%20332.427%20512C293.204%20512%20260.817%20482.682%20255.989%20444.771C251.162%20482.68%20218.793%20511.997%20179.573%20512C137.022%20512%20102.515%20477.507%20102.51%20434.958V410.104H77.6559C35.1069%20410.1%200.614752%20375.591%200.614258%20333.042C0.617971%20290.525%2035.0682%20256.054%2077.5726%20256C35.0684%20255.945%200.617312%20221.475%200.614258%20178.958C0.614256%20136.408%2035.1072%20101.901%2077.6559%20101.896H102.51V77.0417C102.514%2034.4922%20137.022%200%20179.573%200C218.789%200.00251207%20251.157%2029.3045%20255.989%2067.2083C260.821%2029.3023%20293.208%200.000302264%20332.427%200ZM304.573%20187.083C275.444%20167.238%20237.138%20167.237%20208.01%20187.083L121.593%20245.979C114.356%20250.912%20114.355%20261.588%20121.593%20266.521L208.01%20325.396C237.14%20345.245%20275.443%20345.244%20304.573%20325.396L390.989%20266.521C398.228%20261.588%20398.228%20250.912%20390.989%20245.979L304.573%20187.083Z'%20fill='black'/%3e%3c/svg%3e"
          alt="Iris"
          className="w-4 h-4 flex-shrink-0"
        />
        Loading...
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {account ? (
        <>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
              {account.slice(-4)}
            </div>
            <span className="text-sm font-medium truncate max-w-[120px]">
              {account.slice(0, 6)}...{account.slice(-4)}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDisconnect}
            className="h-8 px-2"
          >
            Disconnect
          </Button>
        </>
      ) : (
        <>
          <Button
            onClick={handleConnect}
            disabled={isConnecting}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            <img
              src={Rose32}
              alt="Rose Connect"
              className="w-4 h-4 flex-shrink-0"
            />
            {isConnecting ? "Connecting..." : "Rose Connect"}
          </Button>
        </>
      )}
    </div>
  );
};

export default WalletConnection;
