const Order = require("../models/Order");
const PaymentRecord = require("../models/PaymentRecord");

// Generate unique OrderId
const generateOrderId = () => {
  return "ORD-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
};

// POST /api/orders/create
exports.createOrder = async (req, res) => {
  try {
    const { userName, userPhone, totalAmount, ticketsPurchased } = req.body;

    if (!userName || !userPhone || !totalAmount || !ticketsPurchased || !Array.isArray(ticketsPurchased)) {
      return res.status(400).json({ message: "Invalid order data. ticketsPurchased must be an array of ticket objects" });
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

    // Return order created (payment initialization happens in separate API call)
    res.status(201).json({
      message: "Order created successfully",
      order,
      nextStep: "Call /api/payfast/initialize with this orderId to proceed with payment",
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ message: "Server error", error: error.message });
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
