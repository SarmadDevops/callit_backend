const express = require("express");
const router = express.Router();
const { payfastRedirect, payfastCallback } = require("../controllers/PayFastController");

// Redirect user to PayFast payment page
router.post("/redirect", payfastRedirect);

// PayFast server calls this URL after payment
router.post("/callback", payfastCallback);

module.exports = router;
