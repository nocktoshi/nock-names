import { ExternalLink, Clock, Shield, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function DomainDetails({
  domain,
  onRegister,
  isRegistering = false,
  isRegisterDisabled = false,
}) {
  const status = domain.status ?? (domain.isAvailable ? "available" : "registered");
  const isAvailable = status === "available";
  const isPending = status === "pending";
  const canRegister = typeof onRegister === "function";
  const statusBadgeClassName = isPending
    ? "bg-yellow-500 text-black border-transparent no-default-hover-elevate"
    : undefined;

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getDaysUntilExpiry = () => {
    if (!domain.expiresAt) return null;
    const now = new Date();
    const expiry = new Date(domain.expiresAt);
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysUntilExpiry = getDaysUntilExpiry();

  return (
    <Card
      data-testid={`card-domain-details-${domain.name}`}
      className="w-full max-w-4xl mx-auto"
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-mono">
            {domain.name}
          </CardTitle>
          <Badge
            variant={isAvailable ? "default" : "secondary"}
            className={["text-sm", statusBadgeClassName].filter(Boolean).join(" ")}
          >
            {status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Registration Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <Badge
                  variant={isAvailable ? "outline" : "default"}
                  className={statusBadgeClassName}
                >
                  {status}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Price</span>
                <span
                  className="font-mono font-semibold"
                  data-testid="text-domain-price"
                >
                  {domain.price} NOCK
                </span>
              </div>
              {domain.registeredAt && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Registered</span>
                  <span className="text-sm">
                    {formatDate(domain.registeredAt)}
                  </span>
                </div>
              )}
              {domain.expiresAt && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Expires</span>
                  <div className="text-right">
                    <span className="text-sm">
                      {formatDate(domain.expiresAt)}
                    </span>
                    {daysUntilExpiry !== null && (
                      <div
                        className={`text-xs ${
                          daysUntilExpiry < 30
                            ? "text-destructive"
                            : "text-muted-foreground"
                        }`}
                      >
                        {daysUntilExpiry > 0
                          ? `${daysUntilExpiry} days left`
                          : "Expired"}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Ownership Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {domain.owner ? (
                <>
                  <div className="space-y-2">
                    <span className="text-muted-foreground text-sm">
                      Owner Address
                    </span>
                    <div className="flex items-center gap-2">
                      <span
                        className="font-mono text-sm bg-muted px-2 py-1 rounded break-words"
                        data-testid="text-owner-address"
                        style={{ wordBreak: 'break-word' }}
                      >
                        {domain.owner}
                      </span>
                      <Button size="icon" variant="outline" className="h-8 w-8">
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <span className="text-muted-foreground text-sm">
                      Short Address
                    </span>
                    <span className="font-mono">
                      {domain.owner.slice(0, 6)}...{domain.owner.slice(-4)}
                    </span>
                  </div>
                </>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">
                    No owner - domain is available
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Separator />

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {domain.owner ? (
            <Button
              variant="outline"
              className="gap-2"
              asChild
            >
              <a
                href={`https://nockblocks.com/address/${domain.owner}?tab=transactions`}
                target="_blank"
                rel="noreferrer"
              >
                <ExternalLink className="h-4 w-4" />
                View on Explorer
              </a>
            </Button>
          ) : (
            <Button variant="outline" className="gap-2" disabled>
              <ExternalLink className="h-4 w-4" />
              View on Explorer
            </Button>
          )}
          {isPending && domain.owner ? (
            <Button
              className="gap-2"
              onClick={() => onRegister?.(domain)}
              disabled={!canRegister || isRegistering || isRegisterDisabled}
              data-testid={`button-complete-payment-${domain.name}`}
            >
              Complete Payment
            </Button>
          ) : domain.owner ? (
            <Button variant="outline" className="gap-2">
              <Clock className="h-4 w-4" />
              Transaction History
            </Button>
          ) : null}

          {isAvailable && (
            <Button
              className="gap-2"
              onClick={() => onRegister?.(domain)}
              disabled={!canRegister || isRegistering || isRegisterDisabled}
              data-testid={`button-register-${domain.name}`}
            >
              Register Domain
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
