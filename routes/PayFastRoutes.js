const express = require("express");
const router = express.Router();
const {
  getAccessToken,
  initializePayment,
  getPaymentStatus,
  getAllPayments,
  payfastCallback,
  retryPayment,
  cancelPayment,
  payfastRedirect,
  checkTransactionStatus,
  updatePaymentStatus,
} = require("../controllers/PayFastController.js");

// STEP 1: Get access token from PayFast Pakistan
router.post("/get-token", getAccessToken);

// STEP 2: Initialize payment with access token
router.post("/initialize", initializePayment);

// CREATE: Alias for backward compatibility
router.post("/redirect", payfastRedirect);

// READ: Get payment status for a specific order
router.get("/status/:orderId", getPaymentStatus);

// READ: Get all payments with optional filters
router.get("/list", getAllPayments);

// UPDATE: PayFast callback (server-to-server)
router.post("/callback", payfastCallback);

// UPDATE: Update payment status from pending to completed
router.post("/update-status", updatePaymentStatus);

// UPDATE: Retry payment for a failed order
router.post("/retry", retryPayment);

// DELETE: Cancel payment for an order
router.delete("/cancel/:orderId", cancelPayment);

// READ: Check transaction status by basket_id (from PayFast official documentation)
router.get("/transaction-status/:basketId", checkTransactionStatus);

module.exports = router;
