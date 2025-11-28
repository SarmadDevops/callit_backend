const mongoose = require("mongoose");

const PaymentRecordSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true
  },

  payfastResponse: {
    type: Object,
    required: true
  },

  signatureVerified: {
    type: Boolean,
    default: false
  },

  transactionTime: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("PaymentRecord", PaymentRecordSchema);
