import { Lightbulb } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import DomainCard from "./DomainCard";

export default function DomainSuggestions({ 
  originalSearch, 
  suggestions, 
  onRegister,
  isRegistering = false,
  isRegisterDisabled = false,
}) {
  if (suggestions.length === 0) {
    return null;
  }

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-primary" />
          Alternative Suggestions
          <Badge variant="secondary" className="ml-2">
            {suggestions.length} available
          </Badge>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          "<span className="font-mono">{originalSearch}</span>" is not available. Here are some great alternatives:
        </p>
      </CardHeader>
      
      <CardContent className="p-6 pt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {suggestions.map((domain) => (
            <DomainCard
              key={domain.name}
              domain={domain}
              onRegister={onRegister}
              isRegistering={isRegistering}
              isRegisterDisabled={isRegisterDisabled}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}