import { Check, X, Clock, ExternalLink } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function DomainCard({
  domain,
  onRegister,
  isRegistering = false,
  isRegisterDisabled = false,
}) {
  const status = domain.status ?? (domain.isAvailable ? "available" : "registered");
  const isAvailable = status === "available";
  const isPending = status === "pending";

  const getStatusBadge = () => {
    if (status === "available") {
      return (
        <Badge
          variant="default"
          className="bg-chart-2 text-primary-foreground hover-elevate"
        >
          <Check className="h-3 w-3 mr-1" />
          Available
        </Badge>
      );
    }
    if (status === "pending") {
      return (
        <Badge
          variant="secondary"
          className="bg-yellow-500 text-black border-transparent no-default-hover-elevate"
        >
          <Clock className="h-3 w-3 mr-1" />
          Pending
        </Badge>
      );
    }
    return (
      <Badge variant="destructive">
        <X className="h-3 w-3 mr-1" />
        Registered
      </Badge>
    );
  };

  return (
    <Card
      data-testid={`card-domain-${domain.name}`}
      className="hover-elevate web3-glow-hover border-2 domain-card-premium"
    >
      <CardContent className="p-6">
        <div className="items-center justify-between mb-4">
          {getStatusBadge()}
          <h3
            className="text-lg font-mono font-semibold"
            data-testid={`text-domain-name-${domain.name}`}
          >
            {domain.name}
          </h3>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Price</span>
            <span
              className="font-semibold"
              data-testid={`text-price-${domain.name}`}
            >
              {domain.price} NOCK
            </span>
          </div>

          {!isAvailable && domain.owner && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Owner</span>
              <span
                className="font-mono text-xs truncate max-w-32"
                title={domain.owner}
              >
                {domain.owner.slice(0, 6)}...{domain.owner.slice(-4)}
              </span>
            </div>
          )}

          {domain.expiresAt && !isAvailable && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Expires</span>
              <span className="text-xs">
                {new Date(domain.expiresAt).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-6 pt-0">
        {isAvailable ? (
          <Button
            data-testid={`button-register-${domain.name}`}
            className="w-full"
            onClick={() => onRegister(domain)}
            disabled={isRegistering || isRegisterDisabled}
          >
            {isRegistering ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Registering...
              </>
            ) : (
              "Register Domain"
            )}
          </Button>
        ) : isPending ? (
          <div className="w-full flex flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              className="w-full sm:flex-1 min-w-0 whitespace-normal leading-tight"
              asChild
            >
              <a
                href={`https://nockblocks.com/address/${domain.owner}?tab=transactions`}
                target="_blank"
                rel="noreferrer"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View on Explorer
              </a>
            </Button>
            <Button
              data-testid={`button-complete-payment-${domain.name}`}
              className="w-full sm:flex-1 min-w-0 whitespace-normal leading-tight"
              onClick={() => onRegister(domain)}
              disabled={isRegistering || isRegisterDisabled}
            >
              Complete Payment
            </Button>
          </div>
        ) : domain.owner ? (
          <Button variant="outline" className="w-full" asChild>
            <a
              href={`https://nockblocks.com/address/${domain.owner}?tab=transactions`}
              target="_blank"
              rel="noreferrer"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View on Explorer
            </a>
          </Button>
        ) : (
          <Button variant="outline" className="w-full" disabled>
            <ExternalLink className="h-4 w-4 mr-2" />
            View on Explorer
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
