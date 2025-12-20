import { Wallet, Globe, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import DomainCard from "./DomainCard";

export default function AddressPortfolio({ address, domains, onRegister }) {
  const totalValue = domains.reduce(
    (sum, domain) => sum + parseFloat(domain.price),
    0
  );
  const statuses = domains.map(
    (d) => d.status ?? (d.isAvailable ? "available" : "registered")
  );
  const registeredCount = statuses.filter((s) => s === "registered").length;
  const pendingCount = statuses.filter((s) => s === "pending").length;

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Address Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Address Portfolio
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-1">
                Wallet Address
              </p>
              <p
                className="font-mono text-sm bg-muted px-3 py-2 rounded"
                data-testid="text-portfolio-address"
              >
                {address}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {domains.length}
              </div>
              <div className="text-sm text-muted-foreground">Total Domains</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-green-500">
                {registeredCount}
              </div>
              <div className="text-sm text-muted-foreground">Registered</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-yellow-500">
                {pendingCount}
              </div>
              <div className="text-sm text-muted-foreground">Pending</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-chart-3">
                {totalValue.toFixed(3)} NOCK
              </div>
              <div className="text-sm text-muted-foreground">
                Portfolio Value
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Domain List */}
      {domains.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Owned Domains
              <Badge variant="secondary" className="ml-2">
                {domains.length} {domains.length === 1 ? "domain" : "domains"}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {domains.map((domain) => (
                <DomainCard
                  key={domain.id}
                  domain={domain}
                  onRegister={onRegister || (() => {})}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Domains Found</h3>
            <p className="text-muted-foreground mb-4">
              This wallet address doesn't own any domains yet.
            </p>
            <Badge variant="outline" className="gap-2">
              <TrendingUp className="h-3 w-3" />
              Start building your nockchain identity
            </Badge>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
