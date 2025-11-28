const crypto = require("crypto");
const querystring = require("querystring");

// Generate signature
exports.generateSignature = (data) => {
  const sortedKeys = Object.keys(data).sort();
  const paramString = sortedKeys
    .map(key => `${key}=${encodeURIComponent(data[key]).replace(/%20/g, "+")}`)
    .join("&");

  const passphrase = process.env.PAYFAST_PASSPHRASE || "";
  const fullString = paramString + (passphrase ? `&passphrase=${passphrase}` : "");

  return crypto.createHash("md5").update(fullString).digest("hex");
};

// Verify signature
exports.verifySignature = (data) => {
  const pfData = { ...data };
  const receivedSignature = pfData.signature;
  delete pfData.signature;

  const calculatedSignature = exports.generateSignature(pfData);
  return receivedSignature === calculatedSignature;
};

// Build PayFast redirect URL
exports.buildPayFastURL = (pfData) => {
  return "https://www.payfast.pk/eng/process?" + querystring.stringify(pfData);
};


