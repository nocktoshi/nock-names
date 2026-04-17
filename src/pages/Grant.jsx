import { Link } from "wouter";
import {
  ArrowLeft,
  Zap,
  Target,
  Users,
  Shield,
  Rocket,
  Calendar,
  Coins,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";

import ThemeToggle from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";

const milestones = [
  {
    id: "M1",
    title: "Branding & Setup",
    deliverables: [
      "Acquire and secure nns.id (plus nns.io backup)",
      "Set up official docs site, GitHub repo, and branding (logo, website)",
      "Migrate nocknames.com traffic to new NNS branding",
    ],
    timeline: "Weeks 1–4",
    funding: "600,000",
    percentage: 12,
  },
  {
    id: "M2",
    title: "Core NNS Protocol",
    deliverables: [
      "Implement NNS protocol (name registration, ownership, memo support in raw txs)",
      "Implement transferability (memo-based ownership transfer)",
    ],
    timeline: "Weeks 5–12",
    funding: "1,750,000",
    percentage: 35,
  },
  {
    id: "M3",
    title: "Marketplace",
    deliverables: [
      "Build .nock marketplace frontend (listing, bidding, buy-now)",
      "Integrate secure escrow services",
      "Add royalty support and secondary sales fees (optional ecosystem fund)",
    ],
    timeline: "Weeks 13–18",
    funding: "1,450,000",
    percentage: 29,
  },
  {
    id: "M4",
    title: "API & Infrastructure",
    deliverables: [
      "Production resolver API (address ↔ .nock lookup)",
      "Resolver infrastructure supporting memo-based resolution",
      "Public docs, SDKs, and wallet integration examples (Iris Wallet first)",
    ],
    timeline: "Weeks 19–22",
    funding: "900,000",
    percentage: 18,
  },
  {
    id: "M5",
    title: "Launch, Audit & Handover",
    deliverables: [
      "Full mainnet launch + community marketing push",
      "Security review and audit",
      "Open-source everything + governance handover to Nockchain ecosystem",
    ],
    timeline: "Weeks 23–24",
    funding: "300,000",
    percentage: 6,
  },
];

const budgetBreakdown = [
  { item: "Domain acquisition & branding", amount: "120,000" },
  { item: "NNS protocol development & testing", amount: "1,750,000" },
  { item: "Marketplace frontend + escrow services", amount: "1,450,000" },
  { item: "Resolver API, infrastructure & hosting (first year)", amount: "900,000" },
  { item: "Security review and audit", amount: "470,000" },
  { item: "Community launch, docs & marketing", amount: "170,000" },
  { item: "Contingency & misc (wallets, legal setup)", amount: "140,000" },
];

const impacts = [
  {
    icon: Users,
    title: "User Adoption",
    description:
      "Human-readable names dramatically lower onboarding friction (no more copying long addresses).",
  },
  {
    icon: Rocket,
    title: "Developer Tools",
    description: "Easy integration into wallets, dApps, and explorers.",
  },
  {
    icon: Coins,
    title: "Economic Activity",
    description:
      "Marketplace creates secondary market revenue and liquidity for .nock names.",
  },
  {
    icon: Shield,
    title: "Ecosystem Differentiation",
    description:
      'Positions Nockchain as the "ENS of zkPoW" — a key primitive missing today.',
  },
];

const risks = [
  {
    risk: "Technical risk (Nockchain ZKVM quirks)",
    mitigation: "Early testing on testnet + community feedback on Telegram/Discord",
  },
  {
    risk: "Security risk",
    mitigation: "Full open-source + professional review before mainnet launch",
  },
  {
    risk: "Adoption risk",
    mitigation: "Phased rollout + marketing tied to existing nocknames.com users",
  },
];

export default function Grant() {
  return (
    <div className="min-h-screen bg-background no-default-hover-elevate">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-6 w-6 text-primary web3-pulse" />
              <span className="text-xl font-bold web3-gradient-text">NNS Grant</span>
              <Badge variant="secondary" className="text-xs">
                Proposal
              </Badge>
            </div>

            <div className="flex items-center gap-3">
              <Link href="/">
                <Button variant="outline" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Home
                </Button>
              </Link>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-4 border-b border-border">
        <div className="container mx-auto max-w-4xl text-center">
          <Badge className="mb-4 web3-gradient text-white border-0">
            Flock Proposal
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 web3-gradient-text">
            Nockchain Naming System (NNS)
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Full Protocol, Marketplace, and Infrastructure for the Nockchain Ecosystem
          </p>

          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <div className="glassmorphism rounded-lg px-6 py-4 web3-glow-hover">
              <div className="text-3xl font-bold web3-gradient-text">5,000,000</div>
              <div className="text-sm text-muted-foreground">$NOCK Requested</div>
            </div>
            <div className="glassmorphism rounded-lg px-6 py-4 web3-glow-hover">
              <div className="text-3xl font-bold web3-gradient-text">6</div>
              <div className="text-sm text-muted-foreground">Months Duration</div>
            </div>
            <div className="glassmorphism rounded-lg px-6 py-4 web3-glow-hover">
              <div className="text-3xl font-bold web3-gradient-text">5</div>
              <div className="text-sm text-muted-foreground">Milestones</div>
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            <span className="font-medium">Submitted by:</span> smoothiepool aka{" "}
            <span className="font-mono">@nocktoshi</span> • March 30, 2026
          </div>
        </div>
      </section>

      {/* Executive Summary */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <Card className="glassmorphism web3-glow-hover">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Executive Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                The Nock Naming System (NNS) will become the{" "}
                <span className="text-foreground font-medium">
                  official human-readable naming layer
                </span>{" "}
                for Nockchain. It translates raw Nockchain addresses into memorable{" "}
                <span className="font-mono text-primary">.nock</span> domains (e.g.,{" "}
                <span className="font-mono">logan.nock</span>), enabling seamless identity,
                transfers, and on-chain interactions.
              </p>
              <p>
                Building directly on the existing community project{" "}
                <span className="font-medium text-foreground">nocknames.com</span> (already
                live with basic registration), this grant funds:
              </p>
              <ul className="space-y-2 pl-4">
                {[
                  "Secure branding via nns.id domain acquisition",
                  "A full .nock domain marketplace with listing and escrow",
                  "Production-grade resolver API and infrastructure",
                  "Core NNS protocol development (memo support in raw transactions + transferability)",
                  "Native transferability of .nock names",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-chart-2 mt-1 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p>
                NNS will drive user adoption, developer tooling, and ecosystem growth on
                Nockchain — the zkPoW L1 for programmable gold and private applications.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Background */}
      <section className="py-12 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Background
          </h2>
          <div className="space-y-4 text-muted-foreground">
            <p>
              Nockchain is live on mainnet and already features a budding ecosystem of
              wallets, explorers, and early DeFi primitives. However, it lacks a robust,
              production-ready naming system.
            </p>
            <p>
              The community-built{" "}
              <span className="font-medium text-foreground">nocknames.com</span> has proven
              demand: users can search and claim .nock names today.
            </p>
            <p>
              This proposal upgrades nocknames.com into the{" "}
              <span className="font-medium text-foreground">official NNS protocol</span> — a
              secure, transferable, and memo-based naming layer purpose-built for
              Nockchain's ZKVM architecture.
            </p>
          </div>
        </div>
      </section>

      {/* Project Objectives */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Project Objectives
          </h2>
          <div className="grid gap-4">
            {[
              "Secure long-term branding and trust with a dedicated NNS domain.",
              "Launch a user-friendly .nock marketplace with built-in escrow for safe secondary trading.",
              "Deliver reliable, decentralized resolution infrastructure (API + resolver).",
              "Fully develop and deploy the NNS protocol, including memo support in raw transactions and transferability of .nock names.",
              "Enable true transferability of .nock names (one-click ownership transfer on Nockchain).",
            ].map((objective, i) => (
              <Card key={i} className="glassmorphism web3-glow-hover">
                <CardContent className="flex items-start gap-4 p-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-sm shrink-0">
                    {i + 1}
                  </div>
                  <p className="text-muted-foreground pt-1">{objective}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Milestones */}
      <section className="py-12 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Detailed Scope of Work & Milestones
          </h2>
          <div className="space-y-6">
            {milestones.map((milestone) => (
              <Card key={milestone.id} className="glassmorphism overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="font-mono">
                        {milestone.id}
                      </Badge>
                      <CardTitle className="text-lg">{milestone.title}</CardTitle>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-muted-foreground">{milestone.timeline}</span>
                      <Badge className="web3-gradient text-white border-0">
                        {milestone.funding} $NOCK
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <ul className="space-y-2">
                    {milestone.deliverables.map((deliverable, i) => (
                      <li key={i} className="flex items-start gap-2 text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4 text-chart-2 mt-1 shrink-0" />
                        <span>{deliverable}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="pt-2">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>Funding allocation</span>
                      <span>{milestone.percentage}%</span>
                    </div>
                    <Progress value={milestone.percentage} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-6 text-center text-sm text-muted-foreground">
            <span className="font-medium">Total:</span> 6 months • All code open-source
            under MIT/Apache 2.0 • Deployed on Nockchain mainnet
          </div>
        </div>
      </section>

      {/* Budget Breakdown */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Coins className="h-5 w-5 text-primary" />
            Budget Breakdown
          </h2>
          <Card className="glassmorphism overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Amount ($NOCK)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {budgetBreakdown.map((item, i) => (
                  <TableRow key={i}>
                    <TableCell>{item.item}</TableCell>
                    <TableCell className="text-right font-mono font-medium">
                      {item.amount}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-muted/50 font-bold">
                  <TableCell>Total Requested</TableCell>
                  <TableCell className="text-right font-mono web3-gradient-text">
                    5,000,000
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Card>
          <p className="mt-4 text-sm text-muted-foreground text-center">
            Funds will be used transparently; any underspend returns to the ecosystem fund.
            All payments in $NOCK.
          </p>
        </div>
      </section>

      {/* Team */}
      <section className="py-12 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Team
          </h2>
          <Card className="glassmorphism web3-glow-hover">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-chart-3 flex items-center justify-center text-2xl font-bold text-white shrink-0">
                  S
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-bold">
                    smoothiepool aka{" "}
                    <span className="font-mono text-primary">@nocktoshi</span>
                  </h3>
                  <p className="text-muted-foreground">
                    Creator of the original{" "}
                    <span className="font-medium text-foreground">nocknames.com</span>{" "}
                    (live since July 2025) and sole proposer. Experienced full-stack
                    developer with prior on-chain projects. Will handle all development,
                    protocol implementation, and community coordination.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Open to adding 1–2 contractors for UI/audit if budget allows (clearly
                    tracked).
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Expected Impact */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Rocket className="h-5 w-5 text-primary" />
            Expected Impact on Nockchain Ecosystem
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {impacts.map((impact, i) => (
              <Card key={i} className="glassmorphism web3-glow-hover">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <impact.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{impact.title}</h3>
                      <p className="text-sm text-muted-foreground">{impact.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <Card className="mt-6 glassmorphism">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-3">Success Metrics</h3>
              <div className="flex flex-wrap gap-4">
                <Badge variant="outline" className="text-sm py-2 px-4">
                  5,000+ .nock names registered in first 6 months
                </Badge>
                <Badge variant="outline" className="text-sm py-2 px-4">
                  10+ wallet/dApp integrations
                </Badge>
                <Badge variant="outline" className="text-sm py-2 px-4">
                  Active marketplace volume
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Risks & Mitigation */}
      <section className="py-12 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-primary" />
            Risks & Mitigation
          </h2>
          <div className="space-y-4">
            {risks.map((item, i) => (
              <Card key={i} className="glassmorphism">
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                    <div className="flex items-center gap-2 text-destructive font-medium">
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      <span>{item.risk}</span>
                    </div>
                    <span className="hidden md:block text-muted-foreground">→</span>
                    <div className="flex items-center gap-2 text-chart-2">
                      <Shield className="h-4 w-4 shrink-0" />
                      <span>{item.mitigation}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <p className="mt-4 text-sm text-muted-foreground text-center">
            All deliverables are milestone-gated; funding released only upon verifiable
            completion (GitHub + on-chain deployment).
          </p>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <Card className="glassmorphism web3-glow p-8">
            <h2 className="text-2xl font-bold mb-4 web3-gradient-text">
              Next Steps & Request
            </h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Request is for{" "}
              <span className="font-bold text-foreground">5,000,000 $NOCK</span> from the
              NockFund platform to deliver a complete, production-ready NNS in 6 months.
            </p>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              This is a high-leverage investment: one naming system will accelerate every
              wallet, dApp, and user interaction on Nockchain.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <Button size="lg" className="gap-2 web3-gradient border-0">
                <ExternalLink className="h-4 w-4" />
                Contact on Telegram
              </Button>
              <Link href="/">
                <Button size="lg" variant="outline" className="gap-2">
                  <Zap className="h-4 w-4" />
                  Try NockNames
                </Button>
              </Link>
            </div>
            <div className="text-lg font-medium web3-gradient-text">
              Let's make .nock the standard identity layer for programmable gold.
            </div>
          </Card>
        </div>
      </section>

      {/* Signature */}
      <section className="py-8 px-4 border-t border-border">
        <div className="container mx-auto max-w-4xl text-center">
          <p className="text-muted-foreground">
            — smoothiepool
            <br />
            <span className="font-mono text-primary">@nocktoshi</span> on X and Telegram
            <br />
            Creator of nocknames.com
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-sm text-muted-foreground">
            <p>&copy; 2026 Nockchain.net, LLC. Powered by Nockchain.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
