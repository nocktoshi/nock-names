import { useState } from "react";
import { Search, User, Globe } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function LookupSearch({ onSearch, isLoading = false }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState("domain");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      onSearch(searchTerm.trim(), searchType);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Tabs value={searchType} onValueChange={(value) => setSearchType(value)}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="domain" data-testid="tab-domain">
            <Globe className="h-4 w-4 mr-2" />
            .nock Name
          </TabsTrigger>
          <TabsTrigger value="address" data-testid="tab-address">
            <User className="h-4 w-4 mr-2" />
            Wallet Address
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <form onSubmit={handleSubmit} className="relative">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                data-testid="input-lookup-search"
                type="text"
                placeholder={
                searchType === "domain"
                  ? "Enter .nock name (e.g., john.nock)"
                  : "Enter wallet address"
                }
                value={searchTerm}
                onChange={handleInputChange}
                className="pl-12 pr-32 h-14 text-lg rounded-xl border-2 focus:border-primary web3-glow focus:web3-glow"
                disabled={isLoading}
              />
              <Button
                data-testid="button-lookup-search"
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-10 px-6 rounded-lg web3-gradient hover:shadow-lg"
                disabled={!searchTerm.trim() || isLoading}
              >
                {isLoading ? "Searching..." : "Lookup"}
              </Button>
            </div>
          </form>

          <div className="flex items-center justify-center mt-4 gap-2">
            <Badge variant="outline" className="text-xs">
              {searchType === 'domain' ? <Globe className="h-3 w-3 mr-1" /> : <User className="h-3 w-3 mr-1" />}
              {searchType === 'domain' ? 'Global Search' : 'Address Search'}
            </Badge>
          </div>

          <TabsContent value="domain" className="mt-4">
            <p className="text-center text-sm text-muted-foreground">
              Search for detailed information about any .nock name
            </p>
          </TabsContent>
          
          <TabsContent value="address" className="mt-4">
            <p className="text-center text-sm text-muted-foreground">
              Find all .nock names owned by a specific wallet address
            </p>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}