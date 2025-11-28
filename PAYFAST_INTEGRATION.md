# Secure PayFast Integration Guide

## Overview
This guide explains how to securely integrate PayFast payment gateway with your frontend application. **PayFast credentials (Merchant ID, Key, Passphrase) are kept secret on the backend and never exposed to the frontend.**

---

## Architecture

```
┌─────────────┐         ┌──────────────┐         ┌────────┐
│   Frontend  │────────▶│   Backend    │────────▶│ PayFast│
│             │◀────────│   (Node.js)  │◀────────│        │
└─────────────┘         └──────────────┘         └────────┘

1. Create Order
2. Initiate Payment (get PayFast URL)
3. Redirect to PayFast
4. PayFast calls callback
5. Check payment status
```

---

## API Endpoints

### 1️⃣ CREATE ORDER
**Endpoint:** `POST /api/orders/create`

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
      "names": ["Ali Khan", "Sara Khan"],
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

⚠️ **Note:** NO PayFast credentials are returned here.

---

### 2️⃣ INITIATE PAYMENT
**Endpoint:** `POST /api/orders/{orderId}/initiate-payment`

**Request:** (Empty body)
```json
{}
```

**Response:**
```json
{
  "message": "Payment initiated",
  "payfastUrl": "https://www.payfast.pk/eng/process?merchant_id=123&merchant_key=abc&..."
}
```

✅ **This endpoint:**
- Takes your `orderId` from Step 1
- Generates the PayFast URL on the **backend** (credentials stay secure)
- Returns only the payment URL to frontend
- Frontend redirects user to this URL

---

### 3️⃣ PAYFAST CALLBACK (Webhook)
**Endpoint:** `POST /api/payfast/callback`

⚠️ **This is called by PayFast servers, NOT your frontend**

**What happens:**
1. User completes payment on PayFast
2. PayFast sends POST request to your backend
3. Backend verifies the signature (ensures it's really from PayFast)
4. Backend updates order status to "paid"
5. Backend stores payment record in database

---

### 4️⃣ CHECK PAYMENT STATUS
**Endpoint:** `GET /api/payfast/{orderId}/status`

**Response:**
```json
{
  "orderId": "ORD-1701184200000-432",
  "paymentStatus": "paid",
  "totalAmount": 5000
}
```

**Payment Status values:**
- `"pending"` - Order created, awaiting payment
- `"paid"` - Payment confirmed
- `"canceled"` - User canceled payment
- `"failed"` - Payment failed

---

## Frontend Integration Example

### Step-by-Step Flow

#### Step 1: Create Order
```javascript
// User fills form with ticket details
const orderData = {
  userName: "Ali Khan",
  userPhone: "+923001234567",
  totalAmount: 5000,
  ticketsPurchased: [...]
};

// Send to backend
const response = await fetch('http://localhost:5000/api/orders/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(orderData)
});

const order = await response.json();
const orderId = order.orderId; // Save this for later
```

#### Step 2: Initiate Payment
```javascript
// Get PayFast payment URL from backend
const paymentResponse = await fetch(
  `http://localhost:5000/api/orders/${orderId}/initiate-payment`,
  { method: 'POST' }
);

const paymentData = await paymentResponse.json();
const payfastUrl = paymentData.payfastUrl;

// Redirect user to PayFast to complete payment
window.location.href = payfastUrl;
```

#### Step 3: User Completes Payment
User enters card details on PayFast and completes payment.

#### Step 4: Check if Payment Was Successful
After user returns from PayFast, check payment status:
```javascript
// Poll every 2 seconds to check if payment succeeded
const interval = setInterval(async () => {
  const statusResponse = await fetch(
    `http://localhost:5000/api/payfast/${orderId}/status`
  );

  const status = await statusResponse.json();

  if (status.paymentStatus === "paid") {
    console.log("✅ Payment successful!");
    clearInterval(interval);
    // Redirect to success page or show confirmation
    window.location.href = '/payment-success';
  } else if (status.paymentStatus === "canceled") {
    console.log("❌ Payment canceled");
    clearInterval(interval);
  }
}, 2000);
```

---

## Environment Setup

### On Your Server (.env file)

Create a `.env` file in the backend root directory:

```env
# MongoDB
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/callit_db

# Server
PORT=5000

# PayFast Credentials (Get from PayFast Dashboard)
PAYFAST_MERCHANT_ID=your_merchant_id
PAYFAST_MERCHANT_KEY=your_merchant_key
PAYFAST_PASSPHRASE=your_passphrase

# PayFast URLs
PAYFAST_RETURN_URL=https://yourdomain.com/payment/success
PAYFAST_CANCEL_URL=https://yourdomain.com/payment/cancel
PAYFAST_NOTIFY_URL=https://yourdomain.com/api/payfast/callback
```

⚠️ **IMPORTANT:**
- `.env` should be in `.gitignore` (it already is)
- Never commit `.env` file
- Keep these credentials SECRET
- Use different credentials for testing vs production

---

## Security Best Practices

### ✅ What We Do Right

1. **Backend Handles Sensitive Data**
   - PayFast merchant ID/key never sent to frontend
   - Signature generation happens on backend only

2. **Signature Verification**
   - All PayFast callbacks are verified with MD5 signature
   - Ensures data wasn't tampered with
   - Only valid payments update order status

3. **HTTPS Only**
   - All payment URLs use HTTPS
   - Credentials transmitted securely

4. **Webhook Security**
   - PayFast callback verifies signature before trusting data
   - Invalid signatures are logged but ignored

### ❌ What NOT to Do

1. ❌ Don't expose PayFast credentials in frontend code
2. ❌ Don't skip signature verification
3. ❌ Don't trust payment status without verifying callback signature
4. ❌ Don't commit `.env` file to git
5. ❌ Don't use hardcoded credentials

---

## Testing PayFast Integration

### Sandbox Mode (Recommended for Testing)

PayFast provides a sandbox/test environment:

```env
# Use test credentials
PAYFAST_MERCHANT_ID=10000100  # PayFast test ID
PAYFAST_MERCHANT_KEY=test-merchant-key
PAYFAST_PASSPHRASE=test-passphrase

# Test URLs (optional)
PAYFAST_RETURN_URL=http://localhost:3000/payment/success
PAYFAST_CANCEL_URL=http://localhost:3000/payment/cancel
PAYFAST_NOTIFY_URL=http://localhost:5000/api/payfast/callback
```

### Test Payment Flow

1. Create an order with test data
2. Click "Initiate Payment"
3. Use PayFast test card details
4. Verify payment status updates

---

## Troubleshooting

### Issue: "MONGO_URI is undefined"
**Solution:** Create `.env` file with `MONGO_URI` set

### Issue: PayFast callback not received
**Solution:**
- Check `PAYFAST_NOTIFY_URL` is correct in PayFast dashboard
- Ensure backend is publicly accessible (not localhost)
- Check firewall/network rules

### Issue: Signature verification fails
**Solution:**
- Verify `PAYFAST_PASSPHRASE` is correct
- Check PayFast payload format
- See logs for detailed error

### Issue: Payment status not updating
**Solution:**
- Check callback is being received (check logs)
- Verify signature verification passed
- Check order exists in database

---

## API Response Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Bad request (invalid data) |
| 404 | Order not found |
| 500 | Server error |

---

## Summary

| Step | Who Handles | Security |
|------|-------------|----------|
| 1. Create Order | Frontend → Backend | ✅ No credentials exposed |
| 2. Initiate Payment | Backend generates URL | ✅ Signature generated on backend |
| 3. Payment | User on PayFast | ✅ HTTPS connection |
| 4. Callback | PayFast → Backend | ✅ Signature verified |
| 5. Check Status | Frontend → Backend | ✅ Only status returned |

---

## Support

- **PayFast Docs:** https://www.payfast.co.za/documentation
- **Issues:** Check logs in console

