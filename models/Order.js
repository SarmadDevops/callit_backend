const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true,
  },

  userName: {
    type: String,
    required: true,
  },

  userPhone: {
    type: String,
    required: true,
  },

 
  ticketsPurchased: [{
    eventDay: {
      type: Number,
      required: true
    },
    ticketType: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true
    },
    names: {
      type: [String],
      required: true
    },
    price: {
      type: Number,
      required: true
    }
  }],

  totalAmount: {
    type: Number,
    required: true,
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

  dateCreated: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Order", OrderSchema);
