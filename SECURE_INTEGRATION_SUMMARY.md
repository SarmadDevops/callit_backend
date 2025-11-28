# Secure PayFast Integration - Quick Reference

## The Problem with the OLD Way ❌
```javascript
// INSECURE - Don't do this!
const pfData = {
  merchant_id: "abc123",      // ⚠️ Exposed in frontend!
  merchant_key: "secret123",  // ⚠️ Anyone can see this!
  passphrase: "xyz789",       // ⚠️ Anyone can steal credentials!
  ...
};
// Send to frontend, generate signature on browser
```

**Why this is dangerous:**
- Your PayFast credentials are visible in browser
- Someone can intercept and copy them
- Attacker can use YOUR merchant account to accept payments into their account!

---

## The NEW Secure Way ✅

### How It Works

```
FRONTEND (Insecure)              BACKEND (Secure)           PAYFAST
   |                                 |                        |
   +-- Order Data (just tickets) --->|                        |
   |                                 | Merchant ID ✓         |
   |                                 | Merchant Key ✓        |
   |                                 | Passphrase ✓          |
   |                                 |                        |
   |<-- PayFast URL (no credentials)-+                        |
   |                                 | Generate signature    |
   +----- Redirect to PayFast -------|----------------------->|
   |                                 | (safely on backend)   |
   |<-- User enters card details ----|----- Encrypted ------->|
   |                                 |                        |
   |                           <-- Payment Callback -----------+
   |                                 |                        |
   |                                 +-- Verify Signature    |
   |                                 |   Update Order DB     |
   |<-- Check Status (simple poll)---+                        |
   |                                 |                        |
   +----- Show Success ------->  Complete!                     |
```

### Key Differences

| Old Way ❌ | New Way ✅ |
|-----------|-----------|
| Frontend builds payment form with credentials | Backend builds payment data |
| Merchant ID exposed in browser | Merchant ID stays in `.env` |
| Signature generated in browser | Signature generated on backend |
| Security risk for merchant | Secure server-to-server |
| Easy to intercept credentials | Credentials never leave server |

---

## 4 Simple API Calls

### 1. Create Order
```bash
POST /api/orders/create
Content-Type: application/json

{
  "userName": "Ali Khan",
  "userPhone": "+923001234567",
  "totalAmount": 5000,
  "ticketsPurchased": [...]
}

# Returns: orderId only (no PayFast data)
```

### 2. Get Payment Link
```bash
POST /api/orders/ORD-123/initiate-payment

# Returns: PayFast URL with signature
# (Frontend redirects user to this URL)
```

### 3. User Pays on PayFast
- User is redirected to PayFast.pk
- User enters card details securely on PayFast
- PayFast handles all card data (PCI compliant)

### 4. Check if Payment Succeeded
```bash
GET /api/payfast/ORD-123/status

# Returns: payment status (paid/pending/failed/canceled)
```

---

## Security Benefits

✅ **Credential Protection**
- Merchant ID/Key never sent to frontend
- Credentials only in `.env` file (not in git)

✅ **Signature Verification**
- All PayFast callbacks verified with MD5 hash
- Attacker can't forge payment confirmations

✅ **Data Encryption**
- HTTPS protects data in transit
- PayFast handles card encryption

✅ **Audit Trail**
- All payment records stored in database
- Can verify payments later

---

## What Your Frontend Does

```javascript
// 1. User fills ticket form
const tickets = {
  name: "Ali Khan",
  phone: "+923001234567",
  totalAmount: 5000,
  tickets: [...]
};

// 2. Send to backend to create order
const order = await createOrder(tickets);
const orderId = order.orderId;

// 3. Get payment link from backend
const payment = await initiatePayment(orderId);
const payfastUrl = payment.payfastUrl;

// 4. Redirect user (backend handled all the security!)
window.location.href = payfastUrl;

// 5. After payment, check status
const status = await checkPaymentStatus(orderId);
if (status === 'paid') {
  showSuccessPage();
}
```

---

## What Your Backend Does

```javascript
// 1. Create order (simple database insert)
const order = new Order({
  orderId: generateId(),
  userName: data.userName,
  totalAmount: data.totalAmount,
  paymentStatus: "pending"
});
await order.save();

// 2. When frontend asks for payment link:
//    - Read from process.env (secure!)
const pfData = {
  merchant_id: process.env.PAYFAST_MERCHANT_ID,    // ✓ Secure
  merchant_key: process.env.PAYFAST_MERCHANT_KEY,  // ✓ Secure
  passphrase: process.env.PAYFAST_PASSPHRASE,      // ✓ Secure
  ...
};

//    - Generate signature using secret passphrase
const signature = generateSignature(pfData);

//    - Return only the URL (no credentials)
return { payfastUrl: buildURL(pfData) };

// 3. When PayFast sends callback:
//    - Verify signature (is it really PayFast?)
if (verifySignature(callbackData)) {
  //    - Update order to "paid"
  order.paymentStatus = "paid";
  await order.save();
}
```

---

## Environment Variables (.env)

```env
# NEVER commit this file!
# NEVER expose these in frontend!

PAYFAST_MERCHANT_ID=your_merchant_id
PAYFAST_MERCHANT_KEY=your_merchant_key
PAYFAST_PASSPHRASE=your_passphrase

PAYFAST_RETURN_URL=https://yourdomain.com/payment/success
PAYFAST_CANCEL_URL=https://yourdomain.com/payment/cancel
PAYFAST_NOTIFY_URL=https://yourdomain.com/api/payfast/callback
```

---

## Common Mistakes ❌

| Mistake | Problem | Solution |
|---------|---------|----------|
| Put PayFast keys in frontend | Exposed credentials | Keep in backend `.env` |
| Skip signature verification | Accept fake payments | Always verify signatures |
| Commit `.env` to git | Keys in public repo | Add to `.gitignore` |
| Hardcode credentials | Can't change without redeploy | Use environment variables |
| Trust payment status from frontend | User can fake "paid" | Only trust backend database |

---

## Testing Checklist

- [ ] `.env` file created with real PayFast credentials
- [ ] Backend can create orders
- [ ] Backend can generate PayFast URL
- [ ] Frontend redirects to PayFast
- [ ] User can enter card details on PayFast
- [ ] PayFast sends callback to backend
- [ ] Order status changes to "paid"
- [ ] Frontend sees payment confirmation

---

## Files Modified

✅ `controllers/OrderController.js` - Added `initiatePayment` endpoint
✅ `controllers/PayFastController.js` - Removed unsafe code, added callback verification
✅ `routes/OrderRoutes.js` - Added payment initiation route
✅ `routes/PayFastRoutes.js` - Updated for secure flow
✅ `package.json` - Added `start` and `dev` scripts
✅ `.env.example` - Shows what variables to set
✅ `PAYFAST_INTEGRATION.md` - Full documentation
✅ `FRONTEND_EXAMPLE.js` - How to call from frontend

---

## Next Steps

1. **Set up `.env` file** with your PayFast credentials
2. **Test locally** with test PayFast account
3. **Deploy backend** to production server
4. **Update PAYFAST_NOTIFY_URL** to your production domain
5. **Integrate frontend** using examples provided

---

## Support

- **Full Documentation:** See `PAYFAST_INTEGRATION.md`
- **Frontend Examples:** See `FRONTEND_EXAMPLE.js`
- **PayFast Docs:** https://www.payfast.co.za/documentation

