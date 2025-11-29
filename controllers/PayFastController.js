const Order = require("../models/Order");
const PaymentRecord = require("../models/PaymentRecord");
const axios = require("axios");
const qs = require("qs");

const {
  generateSignature,
  verifySignature,
  buildPayFastURL,
} = require("../utils/Payfast");

// ====================
// PayFast Pakistan config
// ====================

const PAYFAST_BASE_URL =
  process.env.PAYFAST_BASE_URL || "https://ipg1.apps.net.pk"; // 👈 note the 1

const PAYFAST_MERCHANT_ID = process.env.PAYFAST_MERCHANT_ID; // e.g. 243483
const PAYFAST_SECURED_KEY = process.env.PAYFAST_SECURED_KEY; // from email
const PAYFAST_MERCHANT_NAME =
  process.env.PAYFAST_MERCHANT_NAME || "Call It Events";

const PAYFAST_RETURN_URL =
  process.env.PAYFAST_RETURN_URL || "http://localhost:3000/success";
const PAYFAST_CANCEL_URL =
  process.env.PAYFAST_CANCEL_URL || "http://localhost:3000/cancel";
const PAYFAST_NOTIFY_URL =
  process.env.PAYFAST_NOTIFY_URL || "http://localhost:5000/api/payfast/callback";

// STEP 1: Get Access Token from PayFast Pakistan (correct API)
exports.getAccessToken = async (req, res) => {
  try {
    const { orderId, amount } = req.body;

    if (!orderId || !amount) {
      return res.status(400).json({
        success: false,
        message: "orderId and amount are required",
      });
    }

    if (!PAYFAST_MERCHANT_ID || !PAYFAST_SECURED_KEY) {
      return res.status(500).json({
        success: false,
        message:
          "PAYFAST_MERCHANT_ID or PAYFAST_SECURED_KEY missing in environment",
      });
    }

    const numericAmount = parseInt(amount, 10);
    if (Number.isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "amount must be a positive number",
      });
    }

    // ✅ Correct PayFast Pakistan Token API endpoint (Live)
    const tokenUrl = `${PAYFAST_BASE_URL}/Ecommerce/api/Transaction/GetAccessToken`;

    // ✅ Correct fields for GetAccessToken
    const tokenRequestData = qs.stringify({
      MERCHANT_ID: PAYFAST_MERCHANT_ID,
      SECURED_KEY: PAYFAST_SECURED_KEY,
      TXNAMT: numericAmount,
      BASKET_ID: orderId,
      CURRENCY_CODE: "PKR",
    });

    console.log("Requesting PayFast ACCESS_TOKEN...");
    console.log("MERCHANT_ID:", PAYFAST_MERCHANT_ID);
    console.log("BASKET_ID:", orderId, "TXNAMT:", numericAmount);

    const tokenResponse = await axios.post(tokenUrl, tokenRequestData, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "CallITStudio/1.0", // PayFast doesn't like empty UA
      },
      timeout: 15000,
    });

    console.log("PayFast token response:", tokenResponse.data);

    // Expected: { ACCESS_TOKEN: "..." , ... }
    if (!tokenResponse.data || !tokenResponse.data.ACCESS_TOKEN) {
      console.error("PayFast error:", tokenResponse.data);
      return res.status(400).json({
        success: false,
        message: "Failed to get ACCESS_TOKEN from PayFast",
        payfast_response: tokenResponse.data,
      });
    }

    return res.status(200).json({
      success: true,
      token: tokenResponse.data.ACCESS_TOKEN,
      raw: tokenResponse.data,
      orderId,
      amount: numericAmount,
    });
  } catch (error) {
    console.error(
      "GetAccessToken error:",
      error.response?.data || error.message
    );
    return res.status(500).json({
      success: false,
      message: "Error getting PayFast token",
      error: error.response?.data || error.message,
    });
  }
};

// STEP 2: Initialize payment form with access token
exports.initializePayment = async (req, res) => {
  try {
    const { orderId, email_address, token } = req.body;

    // Validate input
    if (!orderId || !token) {
      return res.status(400).json({
        success: false,
        message: "orderId and token are required",
      });
    }

    // Find order
    const order = await Order.findOne({ orderId });
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check if already paid
    if (order.paymentStatus === "paid") {
      return res.status(400).json({
        success: false,
        message: "Order is already paid",
      });
    }

    // Amount must match what was used when calling GetAccessToken
    const numericAmount = parseInt(order.totalAmount, 10) || 0;
    if (numericAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Order totalAmount is invalid",
      });
    }

    // Generate random signature for form submission (as required by PayFast PK)
    const randomSignature =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);

    // ✅ Correct PayFast Pakistan form data for PostTransaction
    const formData = {
      // Merchant & Security (LIVE)
      MERCHANT_ID: PAYFAST_MERCHANT_ID,
      MERCHANT_NAME: PAYFAST_MERCHANT_NAME,
      TOKEN: token, // ✅ IMPORTANT: must be TOKEN, NOT ACCESS_TOKEN

      // Transaction Details
      TXNAMT: numericAmount,          // integer amount, must match GetAccessToken
      BASKET_ID: orderId,             // must match GetAccessToken
      CURRENCY_CODE: "PKR",
      PROCCODE: "00",
      ORDER_DATE: new Date().toISOString().split("T")[0], // YYYY-MM-DD
      TXNDESC: `Event Tickets - ${orderId}`,

      // Customer Information
      CUSTOMER_EMAIL_ADDRESS:
        email_address || order.userEmail || "customer@example.com",
      CUSTOMER_MOBILE_NO: order.userPhone || "+923000000000",

      // Redirect URLs
      SUCCESS_URL: PAYFAST_RETURN_URL,  // e.g. http://localhost:3000/success
      FAILURE_URL: PAYFAST_CANCEL_URL,  // e.g. http://localhost:3000/cancel
      CHECKOUT_URL: PAYFAST_NOTIFY_URL, // your backend callback URL

      // Security / Misc
      SIGNATURE: randomSignature,
      VERSION: "MERCHANT-CART-0.1",
    };

    console.log("Form data prepared for PostTransaction:", formData);

    // Create payment record
    const paymentRecord = new PaymentRecord({
      orderId: orderId,
      payfastResponse: formData,
      signatureVerified: false,
      paymentStatus: "initiated",
      customerEmail:
        email_address || order.userEmail || "customer@example.com",
    });

    await paymentRecord.save();

    // PayFast Pakistan PostTransaction endpoint (LIVE)
    const checkoutUrl = `${PAYFAST_BASE_URL}/Ecommerce/api/Transaction/PostTransaction`;

    // Return form data and checkout URL for frontend
    res.status(200).json({
      success: true,
      message: "Payment form data ready",
      orderId: orderId,
      checkoutUrl: checkoutUrl,
      formData: formData,
    });
  } catch (error) {
    console.error("Error initializing payment:", error);
    res.status(500).json({
      success: false,
      message: "Failed to initialize payment",
      error: error.message,
    });
  }
};


// READ: Get payment status for an order
exports.getPaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({ message: "Order ID is required" });
    }

    // Get order details
    const order = await Order.findOne({ orderId });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Get payment records for this order
    const payments = await PaymentRecord.find({ orderId }).sort({
      transactionTime: -1,
    });

    res.status(200).json({
      orderId: orderId,
      orderStatus: order.paymentStatus,
      amount: order.totalAmount,
      payments: payments.map((p) => ({
        id: p._id,
        status: p.paymentStatus || "initiated",
        signatureVerified: p.signatureVerified,
        transactionTime: p.transactionTime,
      })),
      lastPayment: payments[0] || null,
    });
  } catch (error) {
    console.error("Error fetching payment status:", error);
    res.status(500).json({
      message: "Failed to fetch payment status",
      error: error.message,
    });
  }
};

// READ: Get all payments
exports.getAllPayments = async (req, res) => {
  try {
    const { status, orderId } = req.query;
    let query = {};

    if (status) query.paymentStatus = status;
    if (orderId) query.orderId = orderId;

    const payments = await PaymentRecord.find(query)
      .sort({ transactionTime: -1 })
      .limit(50);

    res.status(200).json({
      total: payments.length,
      payments: payments.map((p) => ({
        id: p._id,
        orderId: p.orderId,
        status: p.paymentStatus || "initiated",
        signatureVerified: p.signatureVerified,
        transactionTime: p.transactionTime,
      })),
    });
  } catch (error) {
    console.error("Error fetching payments:", error);
    res.status(500).json({
      message: "Failed to fetch payments",
      error: error.message,
    });
  }
};

// UPDATE: PayFast callback (when customer completes payment)
// NOTE: This verifySignature is based on your old helper; you may need to
// adjust once you see actual callback payload from Pakistan IPG.
exports.payfastCallback = async (req, res) => {
  try {
    const pfData = req.body;

    // ==================== FIELD VALIDATION ====================
    // Check for required fields
    const requiredFields = [
      'm_payment_id',      // Order ID
      'pf_payment_id',     // PayFast transaction ID
      'payment_status',    // COMPLETE, PENDING, FAILED
      'signature',         // Signature for verification
      'email_address'      // Customer email
    ];

    console.log("[PAYFAST CALLBACK] 🔍 VALIDATING REQUIRED FIELDS:");
    const missingFields = [];

    requiredFields.forEach(field => {
      if (!pfData[field]) {
        console.log(`[PAYFAST CALLBACK] ❌ MISSING FIELD: ${field}`);
        missingFields.push(field);
      } else {
        console.log(`[PAYFAST CALLBACK] ✓ Field present: ${field} = ${pfData[field]}`);
      }
    });

    // If any required fields are missing, reject the callback
    if (missingFields.length > 0) {
      console.log(`[PAYFAST CALLBACK] ❌ VALIDATION FAILED - Missing fields: ${missingFields.join(', ')}`);
      return res.status(400).json({
        message: "Invalid callback data",
        missingFields: missingFields,
        error: "Required fields missing from PayFast callback"
      });
    }

    console.log("[PAYFAST CALLBACK] ✅ ALL REQUIRED FIELDS PRESENT");
    // ==================== END FIELD VALIDATION ====================

    // Verify signature (your existing helper)
    const signatureVerified = verifySignature(pfData);
    console.log("[PAYFAST CALLBACK] ✓ Signature Verified:", signatureVerified);

    // Find order
    const order = await Order.findOne({ orderId: pfData.m_payment_id });
    console.log("[PAYFAST CALLBACK] 🔍 Looking for orderId:", pfData.m_payment_id);
    if (!order) {
      console.log("[PAYFAST CALLBACK] ❌ Order not found for:", pfData.m_payment_id);
      return res.status(404).json({ message: "Order not found" });
    }
    console.log("[PAYFAST CALLBACK] ✓ Order found:", order.orderId);

    // Determine payment status
    let paymentStatus = "failed";
    if (signatureVerified && pfData.payment_status === "COMPLETE") {
      paymentStatus = "completed";
      console.log("[PAYFAST CALLBACK] ✓ Payment COMPLETED - Signature verified and status is COMPLETE");
    } else if (pfData.payment_status === "PENDING") {
      paymentStatus = "pending";
      console.log("[PAYFAST CALLBACK] ⏳ Payment PENDING");
    } else if (pfData.payment_status === "FAILED") {
      paymentStatus = "failed";
      console.log("[PAYFAST CALLBACK] ❌ Payment FAILED");
    }

    // Create/update payment record
    const existingPayment = await PaymentRecord.findOne({
      orderId: pfData.m_payment_id,
      "payfastResponse.pf_payment_id": pfData.pf_payment_id,
    });

    let paymentRecord;
    if (existingPayment) {
      console.log("[PAYFAST CALLBACK] 🔄 Updating existing payment record");
      existingPayment.payfastResponse = pfData;
      existingPayment.signatureVerified = signatureVerified;
      existingPayment.paymentStatus = paymentStatus;
      paymentRecord = await existingPayment.save();
    } else {
      console.log("[PAYFAST CALLBACK] ➕ Creating new payment record");
      paymentRecord = new PaymentRecord({
        orderId: pfData.m_payment_id,
        payfastResponse: pfData,
        signatureVerified,
        paymentStatus,
        customerEmail: pfData.email_address,
      });
      await paymentRecord.save();
    }
    console.log("[PAYFAST CALLBACK] ✓ PaymentRecord saved successfully");

    // Update order status if payment successful / failed
    if (paymentStatus === "completed") {
      console.log("[PAYFAST CALLBACK] 💾 Updating order status to PAID");
      console.log("[PAYFAST CALLBACK] 🔑 Storing Transaction ID:", pfData.pf_payment_id);
      await Order.findOneAndUpdate(
        { orderId: pfData.m_payment_id },
        {
          paymentStatus: "paid",
          transactionId: pfData.pf_payment_id,
          updatedAt: new Date(),
        },
        { new: true }
      );
      console.log("[PAYFAST CALLBACK] ✓ Order updated to PAID with Transaction ID:", pfData.pf_payment_id);
    } else if (paymentStatus === "failed") {
      console.log("[PAYFAST CALLBACK] 💾 Updating order status to FAILED");
      await Order.findOneAndUpdate(
        { orderId: pfData.m_payment_id },
        {
          paymentStatus: "failed",
          updatedAt: new Date(),
        },
        { new: true }
      );
    }

    res.status(200).json({
      message: "Payment processed successfully",
      orderId: pfData.m_payment_id,
      paymentStatus: paymentStatus,
      signatureVerified: signatureVerified,
    });
  } catch (error) {
    console.error("Error processing PayFast callback:", error);
    res.status(500).json({
      message: "Error processing payment",
      error: error.message,
    });
  }
};

// UPDATE: Retry payment for failed order (your original SA-style flow kept)
exports.retryPayment = async (req, res) => {
  try {
    const { orderId, email_address } = req.body;

    if (!orderId) {
      return res.status(400).json({ message: "Order ID is required" });
    }

    // Find order
    const order = await Order.findOne({ orderId });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if already paid
    if (order.paymentStatus === "paid") {
      return res.status(400).json({ message: "Order is already paid" });
    }

    // Update order status back to pending
    await Order.findOneAndUpdate({ orderId }, { paymentStatus: "pending" });

    // Parse full name into first and last name
    const nameParts = (order.userName || "").split(" ");
    const firstName = nameParts[0] || "Customer";
    const lastName = nameParts.slice(1).join(" ") || "User";

    // Generate new payment link (old SA PayFast style – kept as-is for now)
    const pfData = {
      merchant_id: process.env.PAYFAST_MERCHANT_ID,
      merchant_key: process.env.PAYFAST_MERCHANT_KEY,
      return_url: PAYFAST_RETURN_URL,
      cancel_url: PAYFAST_CANCEL_URL,
      notify_url: PAYFAST_NOTIFY_URL,
      name_first: firstName,
      name_last: lastName,
      email_address: email_address || "customer@example.com",
      m_payment_id: order.orderId,
      amount: order.totalAmount.toFixed(2),
      item_name: "Goonj Event Tickets - Retry",
      item_description: `Retry payment for ${order.ticketsPurchased.length} ticket(s)`,
    };

    const signature = generateSignature(pfData);
    pfData.signature = signature;
    const paymentData = buildPayFastURL(pfData);

    // Create retry payment record
    const paymentRecord = new PaymentRecord({
      orderId: orderId,
      payfastResponse: pfData,
      signatureVerified: false,
      paymentStatus: "retry",
      customerEmail: email_address || "customer@example.com",
    });

    await paymentRecord.save();

    res.status(200).json({
      message: "Payment retry link generated",
      orderId: orderId,
      amount: order.totalAmount,
      checkoutUrl: paymentData.checkoutUrl,
      formData: paymentData.formData,
    });
  } catch (error) {
    console.error("Error retrying payment:", error);
    res.status(500).json({
      message: "Failed to retry payment",
      error: error.message,
    });
  }
};

// DELETE: Cancel payment (for pending orders)
exports.cancelPayment = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({ message: "Order ID is required" });
    }

    // Find order
    const order = await Order.findOne({ orderId });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Only allow canceling pending/failed orders
    if (order.paymentStatus === "paid") {
      return res.status(400).json({ message: "Cannot cancel a paid order" });
    }

    // Update order status
    const updatedOrder = await Order.findOneAndUpdate(
      { orderId },
      { paymentStatus: "canceled" },
      { new: true }
    );

    // Mark payment records as canceled
    await PaymentRecord.updateMany(
      { orderId },
      { paymentStatus: "canceled" }
    );

    res.status(200).json({
      message: "Order payment canceled successfully",
      orderId: orderId,
      status: updatedOrder.paymentStatus,
    });
  } catch (error) {
    console.error("Error canceling payment:", error);
    res.status(500).json({
      message: "Failed to cancel payment",
      error: error.message,
    });
  }
};

// READ: Check transaction status by basket_id (from PayFast official documentation)
exports.checkTransactionStatus = async (req, res) => {
  try {
    const { basketId } = req.params;
    const { orderDate } = req.query;

    if (!basketId) {
      return res.status(400).json({
        success: false,
        message: "basketId is required",
      });
    }

    if (!orderDate) {
      return res.status(400).json({
        success: false,
        message: "orderDate is required (format: YYYY-MM-DD)",
      });
    }

    if (!PAYFAST_MERCHANT_ID || !PAYFAST_SECURED_KEY) {
      return res.status(500).json({
        success: false,
        message: "PAYFAST_MERCHANT_ID or PAYFAST_SECURED_KEY missing in environment",
      });
    }

    // Build the PayFast API URL for transaction status check
    const statusUrl = `${PAYFAST_BASE_URL}/transaction/basket_id/${basketId}?order_date=${orderDate}`;

    console.log("[PAYFAST STATUS CHECK] Checking transaction status for basketId:", basketId);
    console.log("[PAYFAST STATUS CHECK] URL:", statusUrl);

    // Make request to PayFast API
    const response = await axios.get(statusUrl, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "CallITStudio/1.0",
      },
      timeout: 15000,
    });

    console.log("[PAYFAST STATUS CHECK] Response received:", response.data);

    // Return PayFast response
    res.status(200).json({
      success: true,
      message: "Transaction status retrieved successfully",
      basketId: basketId,
      orderDate: orderDate,
      payfastResponse: response.data,
    });
  } catch (error) {
    console.error("[PAYFAST STATUS CHECK] Error:", error.message);
    return res.status(error.response?.status || 500).json({
      success: false,
      message: "Failed to check transaction status",
      error: error.response?.data || error.message,
      basketId: req.params.basketId,
    });
  }
};

// UPDATE: Update payment status from pending to completed
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "orderId is required",
      });
    }

    // Find order
    const order = await Order.findOne({ orderId });
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Update order status from pending to completed
    const updatedOrder = await Order.findOneAndUpdate(
      { orderId },
      {
        paymentStatus: "completed",
        updatedAt: new Date(),
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Order status updated to completed",
      orderId: orderId,
      paymentStatus: updatedOrder.paymentStatus,
    });
  } catch (error) {
    console.error("Error updating payment status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update order status",
      error: error.message,
    });
  }
};

// Deprecated: Old redirect endpoint (kept for backward compatibility)
exports.payfastRedirect = exports.initializePayment;
