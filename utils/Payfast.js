const crypto = require("crypto");

// Generate MD5 signature for PayFast (EXACT order required)
const generateSignature = (data) => {
  // CRITICAL: Fields must be in this EXACT order for PayFast
  const signatureString =
    `merchant_id=${data.merchant_id}&` +
    `merchant_key=${data.merchant_key}&` +
    `return_url=${encodeURIComponent(data.return_url)}&` +
    `cancel_url=${encodeURIComponent(data.cancel_url)}&` +
    `notify_url=${encodeURIComponent(data.notify_url)}&` +
    `name_first=${encodeURIComponent(data.name_first)}&` +
    `name_last=${encodeURIComponent(data.name_last)}&` +
    `email_address=${encodeURIComponent(data.email_address)}&` +
    `m_payment_id=${data.m_payment_id}&` +
    `amount=${data.amount}&` +
    `item_name=${encodeURIComponent(data.item_name)}&` +
    `item_description=${encodeURIComponent(data.item_description)}`;

  // Generate MD5 hash
  return crypto.createHash("md5").update(signatureString).digest("hex");
};

// Verify signature from callback (from PayFast)
const verifySignature = (data) => {
  const signature = data.signature;

  // Create copy without signature for verification
  const dataCopy = { ...data };
  delete dataCopy.signature;

  const recalculatedSignature = generateSignature(dataCopy);
  return signature === recalculatedSignature;
};

// Build PayFast PK checkout URL
const buildPayFastURL = (data) => {
  // PayFast Pakistan endpoints
  const checkoutUrl =
    process.env.NODE_ENV === "production"
      ? "https://ipg.apps.net.pk/Ecommerce/api/Transaction/PostTransaction"
      : "https://ipg.apps.net.pk/Ecommerce/api/Transaction/PostTransaction";

  // Return checkout URL with form data to be submitted from frontend
  return {
    checkoutUrl: checkoutUrl,
    formData: data // Contains merchant_id, merchant_key, signature, etc.
  };
};

module.exports = {
  generateSignature,
  verifySignature,
  buildPayFastURL,
};
