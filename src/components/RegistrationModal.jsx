import React from "react";
import { AlertTriangle, Clock, Check, X, Lock} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import WalletConnection from "./WalletConnection";

export default function RegistrationModal({
  domain,
  isOpen,
  onClose,
  onConfirm,
  onVerify,
  isProcessing = false,
  transactionHash,
  transactionStatus,
  statusText,
  account,
  onAccountChange,
  provider,
  irisStatus,
  irisError,
  isIrisReady = true,
}) {
  if (!domain) return null;
  const status = domain.status ?? (domain.isAvailable ? "available" : "registered");
  const pendingOwner = status === "pending" ? domain.owner : null;
  const effectiveAddress = status === "pending" ? pendingOwner : account;

  const getStatusDisplay = () => {
    if (!transactionStatus || transactionStatus === "idle") return null;
    const baseStatus = {
      icon: Clock,
      color: "bg-yellow-500",
      text: statusText,
    };

    const statusConfig = {
      building: baseStatus,
      requesting: baseStatus,
      verifying: baseStatus,
      signing: { ...baseStatus, icon: Lock },
      sending: baseStatus,
      pending: { ...baseStatus, icon: AlertTriangle },
      confirmed: { icon: Check, color: "bg-green-500", text: statusText },
      failed: { icon: X, color: "bg-red-500", text: statusText },
    };

    const config = statusConfig[transactionStatus] ?? {
      icon: X,
      color: "bg-red-500",
      text: statusText,
    };
    const Icon = config.icon;

    return (
      <div className="flex items-center gap-3 p-4 rounded-lg bg-muted">
      <div className={`p-2 rounded-full ${config.color}`}>
        <Icon className="h-4 w-4 text-white" />
      </div>
      <div className="flex-1">
        <p className="font-medium">{config.text}</p>
        {transactionHash && (
        <p className="text-sm text-muted-foreground font-mono">
          {transactionHash.slice(0, 6)}...{transactionHash.slice(-4)}
        </p>
        )}
      </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        data-testid="modal-registration"
        className="sm:max-w-md glassmorphism web3-glow"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>Register Domain</span>
            {status === "available" ? (
              <Badge variant="default" className="bg-chart-2">
                Available
              </Badge>
            ) : status === "pending" ? (
              <Badge
                variant="secondary"
                className="bg-yellow-500 text-black border-transparent no-default-hover-elevate"
              >
                Pending
              </Badge>
            ) : (
              <Badge variant="destructive">Registered</Badge>
            )}
          </DialogTitle>
          <DialogDescription>Register this .nock name</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Domain Info */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-lg font-mono font-semibold">
                {domain.name}
              </span>
            </div>

            {/* Cost Breakdown */}
            <div className="space-y-3 p-4 rounded-lg bg-muted">
              <div className="flex justify-between">
                <span className="text-sm">Domain price</span>
                <span className="font-mono">{domain.price} NOCK</span>
              </div>
              <Separator />
              <label className="text-sm">Address:</label>
              {!effectiveAddress ? (
                <WalletConnection
                  provider={provider}
                  onAccountChange={onAccountChange}
                />
              ) : (
                <div className="font-mono text-sm bg-background px-3 py-2 rounded border">
                  {effectiveAddress.slice(0, 6)}...{effectiveAddress.slice(-4)}
                </div>
              )}
            </div>

            {/* Transaction Status */}
            {getStatusDisplay()}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            {status === "pending" ? (
              <Button
                variant="outline"
                className="flex-1"
                onClick={async () =>
                  await onVerify?.(domain.name, pendingOwner ?? null)
                }
                disabled={
                  !isIrisReady ||
                  isProcessing ||
                  !pendingOwner ||
                  !onVerify
                }
                data-testid="button-verify-payment"
              >
                Verify Payment
              </Button>
            ) : (
              <Button
                variant="outline"
                className="flex-1"
                onClick={onClose}
                disabled={isProcessing && transactionStatus === "pending"}
                data-testid="button-cancel-registration"
              >
                {transactionStatus === "confirmed" ? "Close" : "Cancel"}
              </Button>
            )}
            <Button
              className="flex-1 web3-gradient hover:shadow-lg"
              onClick={async () => await onConfirm(domain.name)}
              // disabled={
              //   !isIrisReady ||
              //   isProcessing ||
              //   transactionStatus === "confirmed" ||
              //   !account
              // }
              data-testid="button-confirm-registration"
            >
              {isProcessing ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : transactionStatus === "confirmed" ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Registered
                </>
              ) : (
                `Pay ${domain.price} NOCK`
              )}
            </Button>
          </div>

          {!isIrisReady && (
            <p className="text-xs text-muted-foreground">
              {irisStatus === "error"
                ? `Iris initialization failed: ${irisError?.message ?? String(irisError)}`
                : "Initializing Iris…"}
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
