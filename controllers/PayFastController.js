const Order = require("../models/Order");
const PaymentRecord = require("../models/PaymentRecord");
const { verifySignature } = require("../utils/Payfast");

// STEP 3: PayFast callback - Verify payment and update order
exports.payfastCallback = async (req, res) => {
  try {
    const pfData = req.body;

    // Verify signature to ensure request came from PayFast (CRITICAL for security)
    const signatureVerified = verifySignature(pfData);

    // Store payment record for audit trail
    const payment = new PaymentRecord({
      orderId: pfData.m_payment_id,
      payfastResponse: pfData,
      signatureVerified,
    });

    await payment.save();

    // Only update order if signature is valid AND payment is complete
    if (signatureVerified && pfData.payment_status === "COMPLETE") {
      await Order.findOneAndUpdate(
        { orderId: pfData.m_payment_id },
        { paymentStatus: "paid" }
      );
      console.log("Payment confirmed for order:", pfData.m_payment_id);
    } else if (!signatureVerified) {
      console.error("Invalid signature for order:", pfData.m_payment_id);
    }

    // Always respond OK to PayFast (they expect HTTP 200)
    res.status(200).send("OK");
  } catch (error) {
    console.error("Error in PayFast callback:", error);
    res.status(500).send("Error");
  }
};

// STEP 4: Check payment status (frontend polls this to verify payment)
exports.checkPaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findOne({ orderId });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({
      orderId: order.orderId,
      paymentStatus: order.paymentStatus,
      totalAmount: order.totalAmount,
    });
  } catch (error) {
    console.error("Error checking payment status:", error);
    res.status(500).json({ message: "Server error" });
  }
};
