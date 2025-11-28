const Order = require("../models/Order");
const PaymentRecord = require("../models/PaymentRecord");

const {
  generateSignature,
  verifySignature,
  buildPayFastURL,
} = require("../utils/Payfast");

exports.payfastRedirect = async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findOne({ orderId });

    if (!order) return res.status(404).json({ message: "Order not found" });

    const pfData = {
      merchant_id: process.env.PAYFAST_MERCHANT_ID,
      merchant_key: process.env.PAYFAST_MERCHANT_KEY,
      return_url: process.env.PAYFAST_RETURN_URL,
      cancel_url: process.env.PAYFAST_CANCEL_URL,
      notify_url: process.env.PAYFAST_NOTIFY_URL,
      name_first: order.userName,
      email_address: "",
      m_payment_id: order.orderId,
      amount: order.totalAmount.toFixed(2),
      item_name: "Goonj Event Tickets",
    };

    // Create signature
    const signature = generateSignature(pfData);
    pfData.signature = signature;

    // Build URL using utils
    const payfastUrl = buildPayFastURL(pfData);

    res.status(200).json({ payfastUrl });
  } catch (error) {
    console.error("Error generating PayFast URL:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.payfastCallback = async (req, res) => {
  try {
    const pfData = req.body;

    const signatureVerified = verifySignature(pfData);

    const payment = new PaymentRecord({
      orderId: pfData.m_payment_id,
      payfastResponse: pfData,
      signatureVerified,
    });

    await payment.save();

    if (signatureVerified && pfData.payment_status === "COMPLETE") {
      await Order.findOneAndUpdate(
        { orderId: pfData.m_payment_id },
        { paymentStatus: "paid" }
      );
    }

    res.status(200).send("OK");
  } catch (error) {
    console.error("Error in PayFast callback:", error);
    res.status(500).send("Error");
  }
};
