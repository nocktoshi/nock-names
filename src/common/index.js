const PAYMENT_ADDRESS =
  "8s29XUK8Do7QWt2MHfPdd1gDSta6db4c3bQrxP1YdJNfXpL3WPzTT5";

// Pricing is based on the length of the name *excluding* the ".nock" suffix.
// Keep this data structure as the single source of truth so UI + fee calculation stay in sync.
const PRICING_TIERS = [
  { minLength: 10, price: 100, label: "10+ characters" },
  { minLength: 5, price: 500, label: "5–9 characters" },
  { minLength: 1, price: 5000, label: "1–4 characters" },
];

function getFee(name) {
  const nameWithoutSuffix = (name || "").replace(".nock", "");
  if (!nameWithoutSuffix) return 0;
  const len = nameWithoutSuffix.length;
  for (const tier of PRICING_TIERS) {
    if (len >= tier.minLength) return tier.price;
  }
  return 0;
}

export { PAYMENT_ADDRESS, PRICING_TIERS, getFee };
