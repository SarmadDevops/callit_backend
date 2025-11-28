const express = require("express");
const router = express.Router();
const { payfastCallback, checkPaymentStatus } = require("../controllers/PayFastController.js");

// STEP 3: PayFast sends payment callback here (webhook)
router.post("/callback", payfastCallback);

// STEP 4: Frontend checks if payment was completed
router.get("/:orderId/status", checkPaymentStatus);

module.exports = router;
