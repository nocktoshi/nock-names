import { apiClient, assertApiUrl } from "@/lib/api-client";
import { getFee } from "@/common";

const toIsoOrNull = (value) => {
  if (value === null || value === undefined) return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d.toISOString();
};

const toNumberOrNull = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

const isString = (v) => typeof v === "string";
const isBool = (v) => typeof v === "boolean";

const validateDomain = (raw) => {
  if (!raw || !isString(raw.name) || !isBool(raw.isAvailable)) return null;
  const price = toNumberOrNull(raw.price);
  if (price === null) return null;
  return {
    id: isString(raw.id) ? raw.id : undefined,
    name: raw.name,
    price,
    isAvailable: raw.isAvailable,
    owner: raw.owner === null || isString(raw.owner) ? raw.owner : null,
    registeredAt: toIsoOrNull(raw.registeredAt),
    expiresAt: toIsoOrNull(raw.expiresAt),
  };
};

const validateRegistration = (raw) => {
  if (!raw || !isString(raw.name)) return null;
  return {
    id: isString(raw.id) ? raw.id : undefined,
    name: raw.name,
    address: raw.address === null || isString(raw.address) ? raw.address : null,
    timestamp: toIsoOrNull(raw.timestamp) ?? new Date().toISOString(),
  };
};

const parseArray = (items, validator) => {
  if (!Array.isArray(items)) return [];
  return items
    .map((item) => validator(item))
    .filter(Boolean);
};

export const fetchRecent = async () => {
  assertApiUrl();
  try {
    const [pendingRes, verifiedRes] = await Promise.all([
      apiClient.get("/pending"),
      apiClient.get("/verified"),
    ]);
    const pending = parseArray(pendingRes.data, validateRegistration);
    const verified = parseArray(verifiedRes.data, validateRegistration);
    return [...pending, ...verified].map((item, idx) => ({
      ...item,
      id: item.id ?? `recent-${idx}-${item.name}`,
    }));
  } catch (error) {
    console.error("Failed to fetch recent registrations:", error);
    return [];
  }
};

export const fetchSearchResults = async (name) => {
  assertApiUrl();
  try {
    const trimmed = name.replace(".nock", "");
    const response = await apiClient.get(
      `/search?name=${encodeURIComponent(trimmed)}`
    );
    const parsed = validateDomain(response.data);
    if (parsed) {
      // Debug override: force this one name to appear available in UI
      // (useful when testing registration flow even if backend marks it taken).
      if (parsed.name === "4444444444.nock") {
        return {
          ...parsed,
          isAvailable: true,
          owner: null,
          registeredAt: null,
          expiresAt: null,
        };
      }
      return parsed;
    }
    console.error("Invalid search response shape", response.data);
    return null;
  } catch (error) {
    console.error("Failed to search registrations:", error);
    return null;
  }
};

export const fetchDomainDetails = async (name) => {
  return fetchSearchResults(name);
};

export const fetchAddressPortfolio = async (address) => {
  assertApiUrl();
  try {
    const response = await apiClient.get(
      `/search?address=${encodeURIComponent(address)}`
    );
    const { pending = [], verified = [] } = response.data || {};
    const combined = [...pending, ...verified];
    return combined.map((item, idx) => ({
      id: item.txHash ?? `${address}-${idx}`,
      name: item.name,
      price: getFee(item.name),
      isAvailable: false,
      owner: item.address,
      registeredAt: item.timestamp
        ? new Date(item.timestamp).toISOString()
        : null,
      expiresAt: null,
      status: item.status ?? "registered",
    }));
  } catch (error) {
    console.error("Failed to fetch address portfolio:", error);
    return [];
  }
};

export const postRegister = async (name, address) => {
  assertApiUrl();
  const response = await apiClient.post("/register", {
    address,
    name: name.toLowerCase(),
  });
  return response.data || [];
};

export const fetchSuggestions = async (name) => {
  assertApiUrl();
  try {
    const trimmed = name.replace(".nock", "");
    const base = trimmed.toLowerCase();
    // TODO: replace with real backend suggestion endpoint when available
    return [
      {
        id: `suggest-app-${base}`,
        name: `${base}app.nock`,
        price: getFee(`${base}app`),
        isAvailable: true,
        owner: null,
        registeredAt: null,
        expiresAt: null,
      },
      {
        id: `suggest-2026-${base}`,
        name: `${base}2026.nock`,
        price: getFee(`${base}2026`),
        isAvailable: true,
        owner: null,
        registeredAt: null,
        expiresAt: null,
      },
      {
        id: `suggest-my-${base}`,
        name: `my${base}.nock`,
        price: getFee(`my${base}`),
        isAvailable: true,
        owner: null,
        registeredAt: null,
        expiresAt: null,
      },
    ];
  } catch (error) {
    console.error("Failed to fetch suggestions:", error);
    return [];
  }
};
