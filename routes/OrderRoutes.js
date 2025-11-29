const express = require("express");
const router = express.Router();
const { createOrder, getOrder, getAllOrders } = require("../controllers/OrderController.js");

// Create new order
router.post("/create", createOrder);

// Get all orders with pagination
router.get("/", getAllOrders);

// Get order by orderId (optional for checking status)
router.get("/:orderId", getOrder);

module.exports = router;
