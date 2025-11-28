# PayFast Secure Integration - Implementation Checklist

## Phase 1: Setup & Configuration

- [ ] **Create `.env` file**
  ```bash
  cp .env.example .env
  ```
  Then fill in your PayFast credentials from PayFast Dashboard

- [ ] **Verify MongoDB connection**
  ```bash
  npm start
  # Check for "MongoDB connected successfully"
  ```

- [ ] **Install dependencies** (should already be done)
  ```bash
  npm install
  ```

---

## Phase 2: Backend Code (DONE ✅)

- [x] Updated `controllers/OrderController.js`
  - [x] Separated order creation from payment initiation
  - [x] Added `initiatePayment` endpoint (keeps credentials safe)
  - [x] Order creation only returns order ID

- [x] Updated `controllers/PayFastController.js`
  - [x] Removed unsafe `payfastRedirect` endpoint
  - [x] Added `checkPaymentStatus` endpoint
  - [x] Improved callback verification
  - [x] Added security logging

- [x] Updated `routes/OrderRoutes.js`
  - [x] Added POST `/api/orders/:orderId/initiate-payment`

- [x] Updated `routes/PayFastRoutes.js`
  - [x] Removed unsafe endpoints
  - [x] Added GET `/api/payfast/:orderId/status`

- [x] Updated `package.json`
  - [x] Added `npm start` script
  - [x] Added `npm dev` script

---

## Phase 3: Configuration Files (DONE ✅)

- [x] Created `.env.example` with all required variables
- [x] Created `PAYFAST_INTEGRATION.md` (full documentation)
- [x] Created `SECURE_INTEGRATION_SUMMARY.md` (quick reference)
- [x] Created `FRONTEND_EXAMPLE.js` (how to call from frontend)
- [x] Created `API_ENDPOINTS.md` (complete API reference)

---

## Phase 4: Local Testing

### Test with cURL:

- [ ] **Test 1: Create Order**
  ```bash
  curl -X POST http://localhost:5000/api/orders/create \
    -H "Content-Type: application/json" \
    -d '{
      "userName": "Test User",
      "userPhone": "+923001234567",
      "totalAmount": 5000,
      "ticketsPurchased": [{
        "eventDay": 1,
        "ticketType": "General",
        "quantity": 1,
        "names": ["Test User"],
        "price": 5000
      }]
    }'
  ```
  Expected: Returns `orderId`

- [ ] **Test 2: Initiate Payment**
  ```bash
  curl -X POST http://localhost:5000/api/orders/ORD-xxxxx/initiate-payment \
    -H "Content-Type: application/json"
  ```
  Expected: Returns `payfastUrl` (don't see merchant ID/key!)

- [ ] **Test 3: Check Payment Status**
  ```bash
  curl -X GET http://localhost:5000/api/payfast/ORD-xxxxx/status
  ```
  Expected: Returns `{ paymentStatus: "pending" }`

### Verify Security:

- [ ] **Credentials NOT exposed**
  - Open browser DevTools → Network tab
  - Go through payment flow
  - Check response headers/bodies
  - ✅ Should NOT see PAYFAST_MERCHANT_ID anywhere

- [ ] **Signatures verified**
  - Check `utils/Payfast.js` → `verifySignature()` function
  - ✅ Should always be called in callback

---

## Phase 5: Frontend Integration

### Option A: React

- [ ] Create `PaymentPage.jsx` component
- [ ] Use `FRONTEND_EXAMPLE.js` as reference
- [ ] Implement form for ticket selection
- [ ] Call `/api/orders/create` on submit
- [ ] Get orderId from response
- [ ] Call `/api/orders/{orderId}/initiate-payment`
- [ ] Redirect to PayFast URL
- [ ] On return, poll `/api/payfast/{orderId}/status`

### Option B: Vue.js

- [ ] Create `PaymentForm.vue` component
- [ ] Use `FRONTEND_EXAMPLE.js` as reference
- [ ] Implement same flow as React above

### Option C: HTML/Vanilla JS

- [ ] Use `FRONTEND_EXAMPLE.js` directly
- [ ] Include in your HTML file
- [ ] Create form with ticket options

---

## Phase 6: PayFast Account Setup

- [ ] **Log in to PayFast Dashboard**
  https://www.payfast.co.za/

- [ ] **Get Test Credentials** (for testing)
  - Merchant ID: Usually 10000100
  - Merchant Key: Usually test key
  - Passphrase: Usually empty or "test"

- [ ] **Update `.env` with test credentials**
  ```env
  PAYFAST_MERCHANT_ID=10000100
  PAYFAST_MERCHANT_KEY=test-key
  PAYFAST_PASSPHRASE=test
  ```

- [ ] **Set Notification URL in PayFast Dashboard**
  - Go to Settings → Notification URL
  - Set to: `https://yourdomain.com/api/payfast/callback`
  - (Use localhost for local testing if PayFast allows)

---

## Phase 7: Testing Payment Flow

- [ ] **Start backend server**
  ```bash
  npm start
  ```

- [ ] **Open frontend in browser**

- [ ] **Create test order**
  - Fill in name: "Test User"
  - Fill in phone: "+923001234567"
  - Select tickets
  - Click "Create Order"
  - ✅ Should see orderId

- [ ] **Initiate payment**
  - Click "Pay Now"
  - ✅ Should be redirected to PayFast

- [ ] **Test with PayFast test card**
  - Card: 4111 1111 1111 1111 (test card)
  - Exp: Any future date
  - CVC: Any 3 digits
  - ✅ Payment should process

- [ ] **Verify payment in backend**
  - Check MongoDB: Order status should be "paid"
  - Check logs: Should see "Payment confirmed" message
  - Check frontend: Should show success message

---

## Phase 8: Production Deployment

### Before going live:

- [ ] **Get real PayFast credentials**
  - Contact PayFast Support
  - Get merchant ID and key
  - Set up business account

- [ ] **Update `.env` with production credentials**
  ```env
  PAYFAST_MERCHANT_ID=real_merchant_id
  PAYFAST_MERCHANT_KEY=real_merchant_key
  PAYFAST_PASSPHRASE=real_passphrase
  ```

- [ ] **Update URLs in `.env`**
  ```env
  PAYFAST_RETURN_URL=https://yourdomain.com/payment/success
  PAYFAST_CANCEL_URL=https://yourdomain.com/payment/cancel
  PAYFAST_NOTIFY_URL=https://yourdomain.com/api/payfast/callback
  ```

- [ ] **Update PayFast Dashboard settings**
  - Update notification URL
  - Update return URL
  - Test webhook

- [ ] **Deploy backend to production**
  - Use proper deployment service (Heroku, AWS, Railway, etc.)
  - Ensure `.env` is NOT committed to git
  - Set environment variables on hosting platform

- [ ] **Enable HTTPS**
  - All payment endpoints MUST use HTTPS
  - Install SSL certificate

- [ ] **Test production flow**
  - Create test payment with small amount
  - Verify order updates correctly
  - Check notification is received

---

## Phase 9: Monitoring & Maintenance

- [ ] **Set up logging**
  - Log all payment events
  - Log callback signatures (verify status)
  - Monitor for failed verifications

- [ ] **Monitor payment records**
  - Regularly check PaymentRecord collection
  - Look for failed signatures (security risk!)

- [ ] **Backup database**
  - Regular MongoDB backups
  - Keep payment records secure

- [ ] **Update security**
  - Keep Node.js updated
  - Keep npm packages updated
  - Review PayFast security updates

---

## Files Checklist

### Modified Files:
- [x] `controllers/OrderController.js` - Added initiatePayment
- [x] `controllers/PayFastController.js` - Security improvements
- [x] `routes/OrderRoutes.js` - Added payment route
- [x] `routes/PayFastRoutes.js` - Updated endpoints
- [x] `package.json` - Added start scripts
- [x] `.env.example` - Complete configuration template

### New Documentation:
- [x] `PAYFAST_INTEGRATION.md` - Full guide
- [x] `SECURE_INTEGRATION_SUMMARY.md` - Quick reference
- [x] `FRONTEND_EXAMPLE.js` - Code examples
- [x] `API_ENDPOINTS.md` - API reference
- [x] `IMPLEMENTATION_CHECKLIST.md` - This file

### NOT Changed (don't need to):
- ✅ `models/` - Order, PaymentRecord, EventTicketType OK
- ✅ `utils/Payfast.js` - Already secure
- ✅ `index.js` - Main server file OK

---

## Troubleshooting

### Issue: "PAYFAST_MERCHANT_ID undefined"
**Solution:** Create `.env` file with credentials

### Issue: "Cannot POST /api/orders/create"
**Solution:** Server not running. Run `npm start`

### Issue: PayFast callback not received
**Solution:** Check notification URL in PayFast dashboard

### Issue: Signature verification fails
**Solution:** Check PAYFAST_PASSPHRASE is correct

### Issue: CORS errors in frontend
**Solution:** Add CORS middleware to backend (already done)

---

## Quick Start (TL;DR)

```bash
# 1. Create .env
cp .env.example .env
# (Fill with PayFast credentials)

# 2. Start server
npm start

# 3. Create test order
curl -X POST http://localhost:5000/api/orders/create \
  -H "Content-Type: application/json" \
  -d '{"userName":"Test","userPhone":"+923001234567","totalAmount":5000,"ticketsPurchased":[...]}'

# 4. Get payment URL
curl -X POST http://localhost:5000/api/orders/ORD-xxxxx/initiate-payment

# 5. Redirect user to payfastUrl in response

# 6. Done! No more work - payment updates automatically
```

---

## Need Help?

- 📚 Read `PAYFAST_INTEGRATION.md` for details
- 💻 Check `FRONTEND_EXAMPLE.js` for code
- 🔌 See `API_ENDPOINTS.md` for all endpoints
- 🎯 Use `SECURE_INTEGRATION_SUMMARY.md` for quick answers

