import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function DomainSearch({ onSearch, isLoading = false }) {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      onSearch(searchTerm.trim().toLowerCase());
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            data-testid="input-domain-search"
            type="text"
            placeholder="Search for a .nock name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 pr-32 h-14 text-lg rounded-xl border-2 focus:border-primary web3-glow focus:web3-glow"
            disabled={isLoading}
          />
          <Button
            data-testid="button-search-domain"
            type="submit"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-10 px-6 rounded-lg web3-gradient hover:shadow-lg"
            disabled={!searchTerm.trim() || isLoading}
          >
            {isLoading ? "Searching..." : "Search"}
          </Button>
        </div>
      </form>
      <p className="text-center text-sm text-muted-foreground mt-4">
        Enter a name to check availability and secure your .nock name
      </p>
    </div>
  );
}