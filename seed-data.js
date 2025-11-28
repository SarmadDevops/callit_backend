// seed-data.js - Script to populate MongoDB with sample data
const mongoose = require("mongoose");
require("dotenv").config();

const Order = require("./models/Order");
const PaymentRecord = require("./models/PaymentRecord");
const EventTicketType = require("./models/Eventtickettype");

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Clear existing data (optional - comment out to keep existing data)
    // await Order.deleteMany({});
    // await PaymentRecord.deleteMany({});
    // await EventTicketType.deleteMany({});
    // console.log("Cleared existing data");

    // 1. Seed Event Ticket Types
    const ticketTypes = [
      // Day 1
      { eventDay: 1, ticketType: "VIP", price: 500 },
      { eventDay: 1, ticketType: "Regular", price: 300 },
      { eventDay: 1, ticketType: "Student", price: 150 },

      // Day 2
      { eventDay: 2, ticketType: "VIP", price: 550 },
      { eventDay: 2, ticketType: "Regular", price: 350 },
      { eventDay: 2, ticketType: "Student", price: 175 },

      // Day 3
      { eventDay: 3, ticketType: "VIP", price: 600 },
      { eventDay: 3, ticketType: "Regular", price: 400 },
      { eventDay: 3, ticketType: "Student", price: 200 },
    ];

    await EventTicketType.insertMany(ticketTypes);
    console.log("✓ Seeded Event Ticket Types");

    // 2. Seed Sample Orders
    const orders = [
      {
        orderId: `ORD-${Date.now()}-001`,
        userName: "Ahmed Ali",
        userPhone: "+27123456789",
        ticketsPurchased: [
          {
            eventDay: 1,
            ticketType: "VIP",
            quantity: 2,
            names: ["Ahmed Ali", "Sara Khan"],
            price: 500,
          },
        ],
        totalAmount: 1000,
        paymentStatus: "pending",
        provider: "PayFast",
      },
      {
        orderId: `ORD-${Date.now()}-002`,
        userName: "Fatima Hassan",
        userPhone: "+27987654321",
        ticketsPurchased: [
          {
            eventDay: 1,
            ticketType: "Regular",
            quantity: 3,
            names: ["Fatima Hassan", "Aisha Khan", "Zainab Ali"],
            price: 300,
          },
        ],
        totalAmount: 900,
        paymentStatus: "pending",
        provider: "PayFast",
      },
      {
        orderId: `ORD-${Date.now()}-003`,
        userName: "Hassan Malik",
        userPhone: "+27555555555",
        ticketsPurchased: [
          {
            eventDay: 2,
            ticketType: "VIP",
            quantity: 1,
            names: ["Hassan Malik"],
            price: 550,
          },
          {
            eventDay: 2,
            ticketType: "Regular",
            quantity: 2,
            names: ["Ibrahim Khan", "Omar Ahmed"],
            price: 350,
          },
        ],
        totalAmount: 1250,
        paymentStatus: "pending",
        provider: "PayFast",
      },
      {
        orderId: `ORD-${Date.now()}-004`,
        userName: "Ayesha Patel",
        userPhone: "+27777777777",
        ticketsPurchased: [
          {
            eventDay: 3,
            ticketType: "Student",
            quantity: 4,
            names: ["Ayesha Patel", "Priya Singh", "Anjali Sharma", "Neha Gupta"],
            price: 200,
          },
        ],
        totalAmount: 800,
        paymentStatus: "pending",
        provider: "PayFast",
      },
    ];

    await Order.insertMany(orders);
    console.log("✓ Seeded Sample Orders");

    // 3. Seed Sample Payment Records
    const paymentRecords = [
      {
        orderId: orders[0].orderId,
        payfastResponse: {
          m_payment_id: orders[0].orderId,
          pf_payment_id: "1001",
          payment_status: "COMPLETE",
          item_name: "Goonj Event Tickets",
          amount_gross: "1000.00",
          amount_fee: "20.00",
          amount_net: "980.00",
          name_first: "Ahmed",
          email_address: "ahmed@example.com",
          merchant_id: "243483",
          signature: "test_signature_001",
        },
        signatureVerified: true,
      },
    ];

    await PaymentRecord.insertMany(paymentRecords);
    console.log("✓ Seeded Sample Payment Records");

    // Update order status to paid if payment record exists
    await Order.findOneAndUpdate(
      { orderId: orders[0].orderId },
      { paymentStatus: "paid" }
    );

    console.log("\n✓ Database seeding completed successfully!");
    console.log("\nSeeded Data Summary:");
    console.log(`- Event Ticket Types: ${ticketTypes.length}`);
    console.log(`- Sample Orders: ${orders.length}`);
    console.log(`- Payment Records: ${paymentRecords.length}`);

    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

seedDatabase();
