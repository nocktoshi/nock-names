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

const normalizeStatus = (raw) => {
  if (!raw) return null;
  const { status } = raw;
  if (status === "available" || status === "pending" || status === "registered") {
    return status;
  }
  // Back-compat for older API responses
  if (isBool(raw.isAvailable)) return raw.isAvailable ? "available" : "registered";
  return null;
};

const validateDomain = (raw) => {
  if (!raw || !isString(raw.name)) return null;
  const status = normalizeStatus(raw);
  if (!status) return null;
  const price = toNumberOrNull(raw.price);
  if (price === null) return null;
  return {
    id: isString(raw.id) ? raw.id : undefined,
    name: raw.name,
    price,
    status,
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
    const pending = parseArray(pendingRes.data, validateRegistration).map((r) => ({
      ...r,
      status: "pending",
    }));
    const verified = parseArray(verifiedRes.data, validateRegistration).map((r) => ({
      ...r,
      status: "registered",
    }));
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

export const postVerify = async (name, address) => {
  assertApiUrl();
  const response = await apiClient.post("/verify", {
    address,
    name: name.toLowerCase(),
  });
  return response.data || {};
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
        status: "available",
        owner: null,
        registeredAt: null,
        expiresAt: null,
      },
      {
        id: `suggest-2026-${base}`,
        name: `${base}2026.nock`,
        price: getFee(`${base}2026`),
        status: "available",
        owner: null,
        registeredAt: null,
        expiresAt: null,
      },
      {
        id: `suggest-my-${base}`,
        name: `my${base}.nock`,
        price: getFee(`my${base}`),
        status: "available",
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
