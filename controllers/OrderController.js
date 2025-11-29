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

// GET /api/orders/
exports.getAllOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const paymentStatus = req.query.paymentStatus;

    // Build filter query
    let query = {};
    if (paymentStatus) {
      query.paymentStatus = paymentStatus;
    }

    // Get total count for pagination
    const total = await Order.countDocuments(query);

    // Fetch orders with pagination
    const orders = await Order.find(query)
      .sort({ dateCreated: -1 })
      .skip(skip)
      .limit(limit);

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.status(200).json({
      message: "Orders fetched successfully",
      pagination: {
        currentPage: page,
        limit: limit,
        total: total,
        totalPages: totalPages,
        hasNextPage: hasNextPage,
        hasPrevPage: hasPrevPage,
      },
      orders: orders,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
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
