const Order = require("../models/Order");
const crypto = require("crypto");

const PaymentRecord = require("../models/PaymentRecord");
const { generateSignature, buildPayFastURL } = require("../utils/Payfast");

// Generate unique OrderId
const generateOrderId = () => {
  return "ORD-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
};

// POST /api/orders/create
exports.createOrder = async (req, res) => {
  try {
    const { userName, userPhone, totalAmount, ticketsPurchased } = req.body;

    if (!userName || !userPhone || !totalAmount || !ticketsPurchased) {
      return res.status(400).json({ message: "Invalid order data" });
    }

    // Create order in DB
    const order = new Order({
      orderId: generateOrderId(),
      userName,
      userPhone,
      ticketsPurchased,
      totalAmount,
      paymentStatus: "pending",
    });

    await order.save();

    // Prepare PayFast data
    const pfData = {
      merchant_id: process.env.PAYFAST_MERCHANT_ID,
      merchant_key: process.env.PAYFAST_MERCHANT_KEY,
      return_url: process.env.PAYFAST_RETURN_URL,
      cancel_url: process.env.PAYFAST_CANCEL_URL,
      notify_url: process.env.PAYFAST_NOTIFY_URL,
      name_first: order.userName,
      email_address: "", // optional
      m_payment_id: order.orderId,
      amount: order.totalAmount.toFixed(2),
      item_name: "Goonj Event Tickets",
    };

    // Generate signature & URL
    pfData.signature = generateSignature(pfData);
    const payfastUrl = buildPayFastURL(pfData);

    // Return order + PayFast URL
    res.status(201).json({
      message: "Order created successfully",
      order,
      payfastUrl,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/orders/:orderId
exports.getOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findOne({ orderId });

    if (!order) return res.status(404).json({ message: "Order not found" });

    res.status(200).json(order);
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ message: "Server error" });
  }
};
