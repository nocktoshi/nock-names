const PAYMENT_ADDRESS =
  "8s29XUK8Do7QWt2MHfPdd1gDSta6db4c3bQrxP1YdJNfXpL3WPzTT5";

// eslint-disable-next-line no-unused-vars
function getFee(name) {
  // 100 NOCK PROMO
	return 100;
  // const nameWithoutSuffix = name.replace(".nock", "");
  // return nameWithoutSuffix.length >= 10
  //   ? 100
  //   : nameWithoutSuffix.length >= 5
  //   ? 500
  //   : 5000;
}

export { PAYMENT_ADDRESS, getFee };
