# 🔒 Secure PayFast Integration - Complete Guide

## Overview

This backend now has **secure PayFast payment integration**. Your PayFast credentials are **never exposed** to the frontend - they stay safe on the backend server.

---

## 📋 Quick Start (5 minutes)

### 1. Setup Environment
```bash
cp .env.example .env
```

Then edit `.env` and add your PayFast credentials:
```env
PAYFAST_MERCHANT_ID=your_merchant_id
PAYFAST_MERCHANT_KEY=your_merchant_key
PAYFAST_PASSPHRASE=your_passphrase
PAYFAST_RETURN_URL=https://yourdomain.com/payment/success
PAYFAST_CANCEL_URL=https://yourdomain.com/payment/cancel
PAYFAST_NOTIFY_URL=https://yourdomain.com/api/payfast/callback
```

### 2. Start Server
```bash
npm start
```

### 3. Test Endpoints
```bash
# Create order
curl -X POST http://localhost:5000/api/orders/create \
  -H "Content-Type: application/json" \
  -d '{
    "userName": "Ali",
    "userPhone": "+923001234567",
    "totalAmount": 5000,
    "ticketsPurchased": [{"eventDay": 1, "ticketType": "General", "quantity": 1, "names": ["Ali"], "price": 5000}]
  }'

# Get payment URL
curl -X POST http://localhost:5000/api/orders/ORD-xxxxx/initiate-payment

# Check status
curl -X GET http://localhost:5000/api/payfast/ORD-xxxxx/status
```

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| **PAYFAST_INTEGRATION.md** | Complete integration guide with examples |
| **SECURE_INTEGRATION_SUMMARY.md** | Quick reference comparing old vs new |
| **FRONTEND_EXAMPLE.js** | Copy-paste ready frontend code |
| **API_ENDPOINTS.md** | Full API reference with cURL examples |
| **IMPLEMENTATION_CHECKLIST.md** | Step-by-step setup and testing guide |
| **PAYMENT_FLOW_DIAGRAM.txt** | Visual flow diagrams |
| **CHANGES_SUMMARY.txt** | What was changed and why |

---

## 🔐 Security Highlights

### What Changed

**BEFORE (Insecure ❌):**
```javascript
// Credentials exposed in frontend!
const pfData = {
  merchant_id: "secret123",    // ⚠️ Anyone can see this!
  merchant_key: "key456",      // ⚠️ Stolen credentials!
  signature: generateSignature() // ⚠️ Faked in browser!
};
```

**AFTER (Secure ✅):**
```javascript
// Credentials stay on backend!
// Frontend only gets payment URL
const payfastUrl = "https://www.payfast.pk/...";
// No credentials exposed!
```

### Key Features

✅ **Credentials in .env** - Never in code or responses
✅ **Backend signature generation** - Can't be faked in browser
✅ **Webhook signature verification** - Ensures payments are real
✅ **Audit trail** - All payments logged and verified
✅ **HTTPS support** - Encryption in transit

---

## 🔄 Payment Flow

```
1. User Creates Order
   └─ Frontend: POST /api/orders/create
      └─ Response: orderId (no credentials)

2. Get Payment Link
   └─ Frontend: POST /api/orders/:orderId/initiate-payment
      └─ Backend: Generates signature securely
      └─ Response: payfastUrl (safe to use)

3. User Pays
   └─ Frontend: Redirect to PayFast
   └─ User: Enters card details on PayFast
   └─ PayFast: Processes payment

4. Payment Confirmed
   └─ PayFast: Sends webhook callback
   └─ Backend: Verifies signature
   └─ Backend: Updates order status to "paid"

5. Check Status
   └─ Frontend: GET /api/payfast/:orderId/status
   └─ Response: payment status
```

---

## 🛠️ API Endpoints

### POST /api/orders/create
Create a ticket order

**Request:**
```json
{
  "userName": "Ali Khan",
  "userPhone": "+923001234567",
  "totalAmount": 5000,
  "ticketsPurchased": [
    {
      "eventDay": 1,
      "ticketType": "General",
      "quantity": 2,
      "names": ["Ali", "Sara"],
      "price": 2500
    }
  ]
}
```

**Response:**
```json
{
  "message": "Order created successfully",
  "orderId": "ORD-1701184200000-432",
  "totalAmount": 5000,
  "userName": "Ali Khan"
}
```

---

### POST /api/orders/:orderId/initiate-payment
Get PayFast payment URL

**Request:** (empty body)

**Response:**
```json
{
  "message": "Payment initiated",
  "payfastUrl": "https://www.payfast.pk/eng/process?merchant_id=..."
}
```

⚠️ **Important:** The payfastUrl contains the signature generated on the backend. Frontend just uses it - doesn't create it!

---

### POST /api/payfast/callback
Webhook from PayFast (called by PayFast, not your frontend)

**What happens:**
1. PayFast sends payment confirmation
2. Backend verifies the MD5 signature
3. If valid and payment complete, order status → "paid"
4. Payment record stored for audit

---

### GET /api/payfast/:orderId/status
Check if payment succeeded

**Response:**
```json
{
  "orderId": "ORD-1701184200000-432",
  "paymentStatus": "paid",
  "totalAmount": 5000
}
```

**Status values:**
- `pending` - Waiting for payment
- `paid` - Payment confirmed
- `canceled` - User canceled
- `failed` - Payment failed

---

## 💻 Frontend Implementation

See **FRONTEND_EXAMPLE.js** for complete examples!

### React Example:
```javascript
import React, { useState } from 'react';

function PaymentPage() {
  const [orderId, setOrderId] = useState(null);

  const handlePayment = async () => {
    // 1. Create order
    const orderRes = await fetch('/api/orders/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ticketData)
    });
    const order = await orderRes.json();
    setOrderId(order.orderId);

    // 2. Get payment URL
    const payRes = await fetch(
      `/api/orders/${order.orderId}/initiate-payment`,
      { method: 'POST' }
    );
    const payData = await payRes.json();

    // 3. Redirect to PayFast
    window.location.href = payData.payfastUrl;
  };

  return (
    <button onClick={handlePayment}>
      Pay Now
    </button>
  );
}
```

---

## 📖 Which File to Read?

| Question | File |
|----------|------|
| I want a quick overview | SECURE_INTEGRATION_SUMMARY.md |
| I need complete details | PAYFAST_INTEGRATION.md |
| I want code examples | FRONTEND_EXAMPLE.js |
| I need API documentation | API_ENDPOINTS.md |
| I'm setting up from scratch | IMPLEMENTATION_CHECKLIST.md |
| I want visual diagrams | PAYMENT_FLOW_DIAGRAM.txt |
| What changed? | CHANGES_SUMMARY.txt |

---

## ⚙️ Configuration Files

### .env (Create this from .env.example)
```env
# MongoDB
MONGO_URI=mongodb+srv://...

# PayFast Credentials (Keep Secret!)
PAYFAST_MERCHANT_ID=your_id
PAYFAST_MERCHANT_KEY=your_key
PAYFAST_PASSPHRASE=your_passphrase

# URLs
PAYFAST_RETURN_URL=https://yourdomain.com/payment/success
PAYFAST_CANCEL_URL=https://yourdomain.com/payment/cancel
PAYFAST_NOTIFY_URL=https://yourdomain.com/api/payfast/callback
```

---

## 🧪 Testing Checklist

- [ ] Create `.env` file with PayFast credentials
- [ ] Run `npm start`
- [ ] Create test order (check orderId returned)
- [ ] Get payment URL (check no credentials in response)
- [ ] Verify DevTools shows NO merchant ID/key
- [ ] Complete payment on PayFast
- [ ] Check order status updates to "paid"
- [ ] Verify PaymentRecord created in database

---

## 🚀 Production Deployment

1. **Get real PayFast credentials**
   - Contact PayFast Support
   - Set up business account

2. **Update `.env` for production**
   ```env
   PAYFAST_MERCHANT_ID=real_id
   PAYFAST_MERCHANT_KEY=real_key
   PAYFAST_PASSPHRASE=real_passphrase
   PAYFAST_NOTIFY_URL=https://yourdomain.com/api/payfast/callback
   ```

3. **Enable HTTPS**
   - All payment URLs must use HTTPS
   - Get SSL certificate

4. **Update PayFast Dashboard**
   - Set notification URL to your production domain
   - Test webhook

5. **Deploy backend**
   - Use Heroku, AWS, Railway, or similar
   - Set environment variables on platform
   - Don't commit `.env` file

---

## 🐛 Troubleshooting

### "PAYFAST_MERCHANT_ID is undefined"
**Solution:** Create `.env` file with credentials

### "Cannot POST /api/orders/create"
**Solution:** Server not running. Run `npm start`

### PayFast callback not received
**Solution:** Check notification URL in PayFast dashboard

### Signature verification fails
**Solution:** Check PAYFAST_PASSPHRASE is correct

### See more issues?
**Check:** IMPLEMENTATION_CHECKLIST.md → Troubleshooting section

---

## 📞 Support

- **PayFast Docs:** https://www.payfast.co.za/documentation
- **Questions?** Check the documentation files above
- **Code examples:** FRONTEND_EXAMPLE.js

---

## 📦 Files Modified

✅ `controllers/OrderController.js` - Added secure payment initiation
✅ `controllers/PayFastController.js` - Improved security
✅ `routes/OrderRoutes.js` - Added new endpoints
✅ `routes/PayFastRoutes.js` - Updated routes
✅ `package.json` - Added start script
✅ `.env.example` - Complete configuration

---

## 🎯 Next Steps

1. **Read** one of the documentation files
2. **Create** `.env` file with your credentials
3. **Test** locally with cURL commands
4. **Integrate** frontend using FRONTEND_EXAMPLE.js
5. **Deploy** to production

---

## ✨ Summary

Your PayFast integration is now:
- **Secure** - Credentials never exposed
- **Verified** - All payments verified with signatures
- **Audited** - All transactions logged
- **Production-ready** - Follows security best practices

Happy integrating! 🎉

