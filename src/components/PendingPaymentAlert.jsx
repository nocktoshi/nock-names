import { useState } from "react";
import { AlertTriangle, Clock, Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PAYMENT_ADDRESS } from "@/common";

export const PAYMENT_DEADLINE_DAYS = 7;

export function formatDaysLeft(timestamp) {
  if (!timestamp) return null;
  const created = new Date(timestamp).getTime();
  if (!Number.isFinite(created)) return null;
  const deadline = created + PAYMENT_DEADLINE_DAYS * 24 * 60 * 60 * 1000;
  const msLeft = deadline - Date.now();
  if (msLeft <= 0) return "expired";
  const daysLeft = Math.ceil(msLeft / (24 * 60 * 60 * 1000));
  return daysLeft === 1 ? "1 day left" : `${daysLeft} days left`;
}

export default function PendingPaymentAlert({
  name,
  price,
  createdAt,
  onComplete,
  isProcessing = false,
  isDisabled = false,
  className = "",
}) {
  const [addressCopied, setAddressCopied] = useState(false);
  const daysLeft = formatDaysLeft(createdAt);
  const deadlineExpired = daysLeft === "expired";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(PAYMENT_ADDRESS);
      setAddressCopied(true);
      setTimeout(() => setAddressCopied(false), 1500);
    } catch {
      // ignore
    }
  };

  return (
    <div
      className={`space-y-3 p-4 rounded-lg border ${
        deadlineExpired
          ? "border-destructive/40 bg-destructive/10"
          : "border-[color-mix(in_oklab,oklch(0.85_0.2_83.8)_55%,transparent)] bg-[color-mix(in_oklab,oklch(0.85_0.2_83.8)_12%,transparent)] dark:border-[color-mix(in_oklab,oklch(0.85_0.2_83.8)_55%,transparent)] dark:bg-[color-mix(in_oklab,oklch(0.85_0.2_83.8)_18%,transparent)]"
      } ${className}`.trim()}
      data-testid={name ? `pending-payment-alert-${name}` : "pending-payment-alert"}
    >
      <div className="flex items-start gap-2">
        <AlertTriangle
          className={`h-4 w-4 mt-0.5 shrink-0 ${
            deadlineExpired
              ? "text-destructive"
              : "text-[oklch(0.6_0.18_83.8)] dark:text-[oklch(0.88_0.2_83.8)]"
          }`}
        />
        <div className="text-sm min-w-0">
          <p className="font-semibold text-foreground">
            Send {price} NOCK
            {name ? (
              <>
                {" "}for <span className="font-mono">{name}</span>
              </>
            ) : null}{" "}
            to complete registration
          </p>
          <p className="text-xs mt-1 text-foreground/80">
            You have {PAYMENT_DEADLINE_DAYS} days from reservation to pay. If
            payment isn't received in time, the name will be released and can
            be registered by anyone else.
          </p>
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs text-foreground/70">
          Payment address
        </label>
        <div className="flex items-stretch gap-2">
          <code className="flex-1 min-w-0 font-mono text-xs bg-background border border-border rounded px-2 py-2 break-all">
            {PAYMENT_ADDRESS}
          </code>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleCopy}
            aria-label="Copy payment address"
            className="shrink-0 bg-background"
          >
            {addressCopied ? (
              <Check className="h-4 w-4 text-chart-2" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        {daysLeft ? (
          <div className="flex items-center gap-1.5 text-xs">
            <Clock
              className={`h-3 w-3 ${
                deadlineExpired
                  ? "text-destructive"
                  : "text-[oklch(0.6_0.18_83.8)] dark:text-[oklch(0.88_0.2_83.8)]"
              }`}
            />
            <span
              className={
                deadlineExpired
                  ? "text-destructive font-medium"
                  : "font-medium text-[oklch(0.55_0.15_83.8)] dark:text-[oklch(0.9_0.18_83.8)]"
              }
            >
              {deadlineExpired
                ? "Reservation expired — name may be released"
                : daysLeft}
            </span>
          </div>
        ) : (
          <span />
        )}

        {onComplete && (
          <Button
            size="sm"
            onClick={onComplete}
            disabled={isDisabled || isProcessing}
            data-testid={name ? `button-complete-payment-${name}` : undefined}
          >
            {isProcessing ? "Processing…" : "Complete Payment"}
          </Button>
        )}
      </div>
    </div>
  );
}
