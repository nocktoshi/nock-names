import { Switch, Route } from "wouter";
import Home from "@/pages/Home";
import Lookup from "@/pages/Lookup";
import MyNock from "@/pages/MyNock";
import Upgrade from "@/pages/Upgrade";
import Grant from "@/pages/Grant";
import Developers from "@/pages/Developers";
import NotFound from "@/pages/not-found";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

function MigrationBanner() {
  return (
    <div className="w-full bg-[#D4F96A] px-4 py-3 text-center text-sm text-black">
      <p className="mx-auto max-w-5xl">
        Nocknames is evolving into the NNS protocol! We are excited to welcome you to
        our new home at{" "}
        <a
          href="https://nns.id"
          target="_blank"
          rel="noopener noreferrer"
          className="font-bold underline decoration-black/70 underline-offset-2 hover:decoration-black"
        >
          nns.id
        </a>
        .
      </p>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/lookup" component={Lookup} />
      <Route path="/my-nock" component={MyNock} />
      <Route path="/upgrade" component={Upgrade} />
      <Route path="/grant" component={Grant} />
      <Route path="/developers" component={Developers} />
      <Route path="/api" component={Developers} />
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <TooltipProvider>
      <Toaster />
      <MigrationBanner />
      <Router />
    </TooltipProvider>
  );
}

export default App;
