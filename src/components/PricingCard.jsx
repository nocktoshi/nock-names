import { Tag } from "lucide-react";
import { PRICING_TIERS, getFee } from "@/common";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function PricingCard({ className = "" }) {
  const tiers = [...PRICING_TIERS].sort((a, b) => b.minLength - a.minLength);
  const examples = ["42.nock", "myname.nock", "supercalafragilistic.nock"];
  const fmt = (n) => Number(n).toLocaleString();

  return (
    <Card className={`border-2 glassmorphism web3-glow ${className}`.trim()}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5 text-primary" />
              Pricing
            </CardTitle>
            <CardDescription>
              Based on name length (excluding <span className="font-mono">.nock</span>)
            </CardDescription>
          </div>
          <Badge variant="secondary" className="whitespace-nowrap">
            NOCK
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <Table>
          <TableCaption>
            Shorter .nock names cost more to prevent squatting.
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Name length</TableHead>
              <TableHead className="text-right">Price</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tiers.map((tier) => (
              <TableRow key={tier.minLength}>
                <TableCell className="font-medium">{tier.label}</TableCell>
                <TableCell className="text-right">
                  <span className="font-mono text-primary">{fmt(tier.price)}</span>{" "}
                  <span className="text-muted-foreground">NOCK</span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>

      <CardFooter className="flex flex-col items-start gap-2">
        <div className="text-xs text-muted-foreground">Examples</div>
        <div className="flex flex-wrap gap-4">
          {examples.map((name) => (
            <div
              key={name}
              className="rounded-md border bg-background/60 px-3 py-1 text-xs"
            >
              <span className="font-mono">{name}</span>
              <span className="text-muted-foreground"> → </span>
              <span className="font-mono text-primary">{fmt(getFee(name))}</span>{" "}
              <span className="text-muted-foreground">NOCK</span>
            </div>
          ))}
        </div>
      </CardFooter>
    </Card>
  );
}


