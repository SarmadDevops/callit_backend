// index.js (Backend)
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose"); // <-- Import mongoose
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// --- Middlewares ---
app.use(cors());
app.use(bodyParser.json());

// --- Import routes ---
const orderRoutes = require("./routes/orderRoutes");
const payfastRoutes = require("./routes/payFastRoutes"); 

// --- MongoDB connection ---
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB connected successfully"))
.catch(err => console.error(" MongoDB connection error:", err));

// --- Use routes ---
app.use("/api/orders", orderRoutes);
app.use("/api/payfast", payfastRoutes);

// --- Test endpoint ---
app.get("/", (req, res) => res.send("Backend is running"));

// --- Start server ---
app.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
});
