const mongoose = require("mongoose");

const PaymentRecordSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    index: true
  },

  payfastResponse: {
    type: Object,
    required: true
  },

  signatureVerified: {
    type: Boolean,
    default: false
  },

  paymentStatus: {
    type: String,
    enum: ["initiated", "pending", "completed", "failed", "canceled", "retry"],
    default: "initiated"
  },

  customerEmail: {
    type: String,
    default: "customer@example.com"
  },

  transactionTime: {
    type: Date,
    default: Date.now,
    index: true
  },

  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update updatedAt before saving
PaymentRecordSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  if (typeof next === "function") {
    next();
  }
  return;
});

module.exports = mongoose.model("PaymentRecord", PaymentRecordSchema);
