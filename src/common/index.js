const PAYMENT_ADDRESS =
  "8s29XUK8Do7QWt2MHfPdd1gDSta6db4c3bQrxP1YdJNfXpL3WPzTT5";

function getFee(name) {
  const nameWithoutSuffix = (name || "").replace(".nock", "");
  if (!nameWithoutSuffix) return 0;
  if (nameWithoutSuffix.length >= 10) return 100;
  if (nameWithoutSuffix.length >= 5) return 500;
  return 5000;
}

export { PAYMENT_ADDRESS, getFee };
