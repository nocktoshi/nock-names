import { useQuery } from "@tanstack/react-query";
import {
  fetchRecent,
  fetchSearchResults,
  fetchSuggestions,
  fetchAddressPortfolio,
  fetchDomainDetails,
} from "@/api";

export const useRecentRegistrations = (limit = 9) =>
  useQuery({
    queryKey: ["recent", limit],
    queryFn: async () => {
      const data = await fetchRecent();
      const sorted = data.sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
      );
      return sorted.slice(0, limit);
    },
    staleTime: 30_000,
  });

export const useDomainSearch = (name) =>
  useQuery({
    queryKey: ["search", name],
    queryFn: () => fetchSearchResults(name),
    enabled: Boolean(name),
    staleTime: 60_000,
  });

export const useSuggestions = (name, enabled) =>
  useQuery({
    queryKey: ["suggestions", name],
    queryFn: () => fetchSuggestions(name),
    enabled: Boolean(enabled && name),
    staleTime: 60_000,
  });

export const useLookupQuery = ({ query, type }) =>
  useQuery({
    queryKey: ["lookup", type, query],
    enabled: Boolean(query),
    staleTime: 60_000,
    queryFn: async () => {
      if (type === "address") {
        const domains = await fetchAddressPortfolio(query);
        return { type, query, data: domains };
      }
      const domain = await fetchDomainDetails(query);
      if (domain) return { type: "domain", query, data: domain };
      return {
        type: "domain",
        query,
        data: {
          id: "not-found",
          name: query,
          price: 0,
          status: "available",
          owner: null,
          registeredAt: null,
          expiresAt: null,
        },
      };
    },
  });

