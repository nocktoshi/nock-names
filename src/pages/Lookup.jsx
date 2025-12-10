import { useState } from "react";
import { ArrowLeft, Search } from "lucide-react";
import { Link } from "wouter";
import LookupSearch from "@/components/LookupSearch";
import DomainDetails from "@/components/DomainDetails";
import AddressPortfolio from "@/components/AddressPortfolio";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Lookup() {
  const [searchResults, setSearchResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // todo: remove mock functionality
  const mockDomainLookup = (name) => {
    const mockDomains = {
      'johndoe': {
        id: "lookup-1",
        name: "johndoe",
        price: "0.08",
        isAvailable: false,
        owner: "8s29XUK8Do7QWt2MHfPdd1gDSta6db4c3bQrxP1YdJNfXpL3WPzTT5",
        registeredAt: new Date("2024-01-15T14:30:00Z"),
        expiresAt: new Date("2026-01-15T14:30:00Z"),
      },
      'cryptogamer': {
        id: "lookup-2", 
        name: "cryptogamer",
        price: "0.15",
        isAvailable: false,
        owner: "0x8ba1f109551bD432803012645Hac136c54c4e4cb",
        registeredAt: new Date("2024-01-15T13:45:00Z"),
        expiresAt: new Date("2026-01-15T13:45:00Z"),
      },
      'available': {
        id: "lookup-3",
        name: "available",
        price: "0.1",
        isAvailable: true,
        owner: null,
        registeredAt: null,
        expiresAt: null,
      }
    };
    
    return mockDomains[name.toLowerCase()] || null;
  };

  // todo: remove mock functionality
  const mockAddressLookup = (address) => {
    const mockPortfolios = {
      '8s29XUK8Do7QWt2MHfPdd1gDSta6db4c3bQrxP1YdJNfXpL3WPzTT5': [
        {
          id: "portfolio-1",
          name: "johndoe",
          price: "0.08",
          isAvailable: false,
          owner: "8s29XUK8Do7QWt2MHfPdd1gDSta6db4c3bQrxP1YdJNfXpL3WPzTT5",
          registeredAt: new Date("2024-01-15T14:30:00Z"),
          expiresAt: new Date("2026-01-15T14:30:00Z"),
        },
        {
          id: "portfolio-2",
          name: "myawesome",
          price: "0.12",
          isAvailable: false,
          owner: "8s29XUK8Do7QWt2MHfPdd1gDSta6db4c3bQrxP1YdJNfXpL3WPzTT5",
          registeredAt: new Date("2024-01-10T10:15:00Z"),
          expiresAt: new Date("2026-01-10T10:15:00Z"),
        }
      ],
      '0x8ba1f109551bD432803012645Hac136c54c4e4cb': [
        {
          id: "portfolio-3",
          name: "cryptogamer",
          price: "0.15",
          isAvailable: false,
          owner: "0x8ba1f109551bD432803012645Hac136c54c4e4cb",
          registeredAt: new Date("2024-01-15T13:45:00Z"),
          expiresAt: new Date("2026-01-15T13:45:00Z"),
        }
      ]
    };
    
    return mockPortfolios[address] || [];
  };

  const handleSearch = async (query, type) => {
    setIsLoading(true);
    console.log(`Looking up ${type}: ${query}`);
    
    // Simulate API call
    setTimeout(() => {
      if (type === 'domain') {
        const domain = mockDomainLookup(query);
        if (domain) {
          setSearchResults({ type: 'domain', data: domain, query });
        } else {
          setSearchResults({ type: 'domain', data: {
            id: 'not-found',
            name: query,
            price: "0.1",
            isAvailable: true,
            owner: null,
            registeredAt: null,
            expiresAt: null,
          }, query });
        }
      } else {
        const domains = mockAddressLookup(query);
        setSearchResults({ type: 'address', data: domains, query });
      }
      setIsLoading(false);
    }, 1000);
  };

  const handleDomainRegister = (domain) => {
    console.log(`Registering domain from lookup: ${domain.name}`);
  };

  return (
    <div className="min-h-screen bg-background no-default-hover-elevate">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="outline" size="icon" data-testid="button-back-home">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Search className="h-5 w-5 text-primary" />
              <h1 className="text-xl font-bold">Domain Lookup</h1>
            </div>
            <Badge variant="secondary" className="text-xs cursor-pointer">
              Beta
            </Badge>
          </div>
        </div>
      </header>

      {/* Search Section */}
      <section className="py-12 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 web3-gradient-text">
            Lookup Domain Information
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Search for detailed domain information by name or explore all domains owned by a wallet address
          </p>
          
          <LookupSearch onSearch={handleSearch} isLoading={isLoading} />
        </div>
      </section>

      {/* Results Section */}
      {searchResults && (
        <section className="py-8 px-4 no-default-hover-elevate">
          <div className="container mx-auto">
            {searchResults.type === 'domain' ? (
              <div className="space-y-4">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-semibold mb-2">Domain Information</h3>
                  <p className="text-muted-foreground">
                    Results for domain "<span className="font-mono">{searchResults.query}</span>"
                  </p>
                </div>
                <DomainDetails domain={searchResults.data} />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-semibold mb-2">Address Portfolio</h3>
                  <p className="text-muted-foreground">
                    Domains owned by "<span className="font-mono text-xs">{searchResults.query}</span>"
                  </p>
                </div>
                <AddressPortfolio 
                  address={searchResults.query}
                  domains={searchResults.data}
                  onRegister={handleDomainRegister}
                />
              </div>
            )}
          </div>
        </section>
      )}

      {/* Empty State */}
      {!searchResults && !isLoading && (
        <section className="py-16 px-4">
          <div className="container mx-auto text-center max-w-2xl">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-6 rounded-lg bg-card border hover-elevate cursor-pointer" 
                     onClick={() => handleSearch('johndoe', 'domain')}>
                  <div className="text-lg font-semibold mb-2">Try Domain Search</div>
                  <span className="font-mono text-sm text-primary">johndoe.nock</span>
                </div>
                <div className="p-6 rounded-lg bg-card border hover-elevate cursor-pointer" 
                     onClick={() => handleSearch('8s29XUK8Do7QWt2MHfPdd1gDSta6db4c3bQrxP1YdJNfXpL3WPzTT5', 'address')}>
                  <div className="text-lg font-semibold mb-2">Try Address Search</div>
                  <span className="font-mono text-xs text-primary">8s29X...WPzTT5</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Click on the examples above to see how the lookup works
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-sm text-muted-foreground">
            <p>&copy; 2026 Nockchain.net, LLC. Advanced domain tools for the Nockchain ecosystem.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}