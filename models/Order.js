const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true,
  },

  userName: {
    type: String,
    required: false,
  },

  userPhone: {
    type: String,
    required: false,
  },

 
  ticketsPurchased: [{
    eventDay: {
      type: Number,
      required: false
    },
    ticketType: {
      type: String,
      required: false
    },
    quantity: {
      type: Number,
      required: false
    },
    names: {
      type: [String],
      required: false
    },
    price: {
      type: Number,
      required: false
    }
  }],

  totalAmount: {
    type: Number,
    required: false,
  },

  paymentStatus: {
    type: String,
    enum: ["pending", "paid", "canceled", "failed"],
    default: "pending",
  },

  provider: {
    type: String,
    default: "PayFast",
  },

  transactionId: {
    type: String,
    default: null,
  },

  dateCreated: {
    type: Date,
    default: Date.now,
  },

  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Order", OrderSchema);
