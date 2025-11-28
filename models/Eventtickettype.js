const mongoose = require("mongoose");

const EventTicketTypeSchema = new mongoose.Schema({
  eventDay: {
    type: Number,
    required: true
  },
  ticketType: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  }
});

module.exports = mongoose.model("EventTicketType", EventTicketTypeSchema);
