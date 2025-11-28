const express = require("express");
const router = express.Router();
const { createOrder, getOrder, initiatePayment } = require("../controllers/OrderController.js");

// STEP 1: Create new order (frontend sends ticket data)
router.post("/create", createOrder);

// STEP 2: Initiate payment (backend generates PayFast URL securely)
router.post("/:orderId/initiate-payment", initiatePayment);

// Get order status
router.get("/:orderId", getOrder);

module.exports = router;
