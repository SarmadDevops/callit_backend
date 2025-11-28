const express = require("express");
const router = express.Router();
const { createOrder, getOrder } = require("../controllers/orderController.js");

// Create new order
router.post("/create", createOrder);

// Get order by orderId (optional for checking status)
router.get("/:orderId", getOrder);

module.exports = router;
