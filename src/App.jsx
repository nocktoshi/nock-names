import { Switch, Route } from "wouter";
import Home from "@/pages/Home";
import Lookup from "@/pages/Lookup";
import MyNock from "@/pages/MyNock";
import Upgrade from "@/pages/Upgrade";
import NotFound from "@/pages/not-found";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/lookup" component={Lookup} />
      <Route path="/my-nock" component={MyNock} />
      <Route path="/upgrade" component={Upgrade} />
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <TooltipProvider>
      <Toaster />
      <Router />
    </TooltipProvider>
  );
}

export default App;
