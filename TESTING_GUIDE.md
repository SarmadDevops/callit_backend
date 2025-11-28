# 🧪 Complete Testing Guide - PayFast Integration

## Phase 1: Setup Environment (5 minutes)

### Step 1: Create .env File

```bash
cp .env.example .env
```

Open `.env` and add PayFast test credentials:

```env
# MongoDB Connection (you already have this)
MONGO_URI=mongodb+srv://your_user:your_password@cluster.mongodb.net/callit_db

# Server Port
PORT=5000

# PayFast TEST Credentials (Use these for testing)
PAYFAST_MERCHANT_ID=10000100
PAYFAST_MERCHANT_KEY=mk5p2pn4oe8rs
PAYFAST_PASSPHRASE=test

# URLs (for local testing)
PAYFAST_RETURN_URL=http://localhost:3000/payment/success
PAYFAST_CANCEL_URL=http://localhost:3000/payment/cancel
PAYFAST_NOTIFY_URL=http://localhost:5000/api/payfast/callback
```

✅ **Save the file**

---

## Phase 2: Start the Server (2 minutes)

### Step 2: Terminal 1 - Start Backend

```bash
npm start
```

You should see:
```
> callit_new_web_backend@1.0.0 start
> node index.js

Server running on port 5000
```

If you see MongoDB error, check your `MONGO_URI` in `.env`

---

## Phase 3: Test API Endpoints (10 minutes)

### Step 3: Open Another Terminal or Use Postman/cURL

You'll test 4 endpoints in order:

---

## TEST 1: Create Order ✅

**What it does:** Creates a new ticket order

**Method:** POST
**URL:** `http://localhost:5000/api/orders/create`
**Headers:**
```
Content-Type: application/json
```

**Body (copy exactly):**
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

### Using cURL:
```bash
curl -X POST http://localhost:5000/api/orders/create \
  -H "Content-Type: application/json" \
  -d '{
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
  }'
```

### Expected Response:
```json
{
  "message": "Order created successfully",
  "orderId": "ORD-1701184200000-432",
  "totalAmount": 5000,
  "userName": "Ali Khan"
}
```

### ✅ Verification:
- [ ] Response status is 201
- [ ] `orderId` is returned (format: ORD-xxxxx-xxx)
- [ ] NO PayFast credentials in response
- [ ] NO merchant_id visible
- [ ] NO merchant_key visible

**⚠️ IMPORTANT:** Save the `orderId` from response for TEST 2!

---

## TEST 2: Initiate Payment (Get Payment URL)

**What it does:** Backend generates PayFast payment URL securely

**Method:** POST
**URL:** `http://localhost:5000/api/orders/ORD-xxxxx-xxx/initiate-payment`
(Replace `ORD-xxxxx-xxx` with the orderId from TEST 1)

**Body:** Empty (no data needed)

### Using cURL:
```bash
curl -X POST http://localhost:5000/api/orders/ORD-1701184200000-432/initiate-payment \
  -H "Content-Type: application/json"
```

### Expected Response:
```json
{
  "message": "Payment initiated",
  "payfastUrl": "https://www.payfast.pk/eng/process?merchant_id=10000100&merchant_key=mk5p2pn4oe8rs&..."
}
```

### ✅ Verification:
- [ ] Response status is 200
- [ ] `payfastUrl` is returned
- [ ] URL starts with `https://www.payfast.pk/`
- [ ] URL contains signature parameter
- [ ] ⚠️ IMPORTANT: Even though URL contains credentials, they're generated securely on backend!

**⚠️ IMPORTANT:** Copy the `payfastUrl` for testing payment!

---

## TEST 3: Test Payment Status (Before Payment)

**What it does:** Check order status before payment

**Method:** GET
**URL:** `http://localhost:5000/api/payfast/ORD-xxxxx-xxx/status`
(Replace with your orderId)

### Using cURL:
```bash
curl -X GET http://localhost:5000/api/payfast/ORD-1701184200000-432/status
```

### Expected Response:
```json
{
  "orderId": "ORD-1701184200000-432",
  "paymentStatus": "pending",
  "totalAmount": 5000
}
```

### ✅ Verification:
- [ ] Response status is 200
- [ ] `paymentStatus` is "pending"
- [ ] `orderId` matches what you sent
- [ ] `totalAmount` is correct

---

## Phase 4: Security Verification (Important!)

Before proceeding, verify your credentials are NOT exposed:

### Step 4: Check Browser Network

If you're going to test with a frontend:

1. Open browser DevTools (F12)
2. Go to "Network" tab
3. Make requests to your API
4. Check each response:
   - ✅ Should see `orderId`
   - ✅ Should see `payfastUrl`
   - ✅ Should NOT see `PAYFAST_MERCHANT_ID`
   - ✅ Should NOT see `PAYFAST_MERCHANT_KEY`
   - ✅ Should NOT see `PAYFAST_PASSPHRASE`

### Terminal Check:
Look at your `.env` file:
- ✅ Credentials are HERE
- ✅ Check that they're NOT in your code files

```bash
# These should return nothing (credentials not in code)
grep -r "PAYFAST_MERCHANT_ID" controllers/
grep -r "PAYFAST_MERCHANT_KEY" controllers/
```

---

## Phase 5: Test with Frontend (Optional but Recommended)

### Step 5: Create Simple Test HTML File

Create a file called `test-payment.html`:

```html
<!DOCTYPE html>
<html>
<head>
  <title>PayFast Payment Test</title>
  <style>
    body { font-family: Arial; margin: 20px; }
    button { padding: 10px 20px; font-size: 16px; margin: 10px 0; }
    .success { color: green; }
    .error { color: red; }
    #output { border: 1px solid #ccc; padding: 10px; margin-top: 20px; }
  </style>
</head>
<body>
  <h1>PayFast Integration Test</h1>

  <h2>Step 1: Create Order</h2>
  <button onclick="createOrder()">Create Test Order</button>

  <h2>Step 2: Get Payment URL</h2>
  <button onclick="initiatePayment()" id="payBtn" disabled>Get Payment Link</button>

  <h2>Step 3: Go to PayFast</h2>
  <button onclick="goToPayFast()" id="payFastBtn" disabled>Open PayFast Payment</button>

  <h2>Step 4: Check Status</h2>
  <button onclick="checkStatus()">Check Payment Status</button>

  <div id="output"></div>

  <script>
    let currentOrderId = null;
    let payfastUrl = null;

    function log(message) {
      document.getElementById('output').innerHTML += message + '<br>';
    }

    function createOrder() {
      log('Creating order...');

      fetch('http://localhost:5000/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userName: 'Test User',
          userPhone: '+923001234567',
          totalAmount: 5000,
          ticketsPurchased: [{
            eventDay: 1,
            ticketType: 'General',
            quantity: 1,
            names: ['Test User'],
            price: 5000
          }]
        })
      })
      .then(r => r.json())
      .then(data => {
        currentOrderId = data.orderId;
        log('<span class="success">✅ Order Created: ' + currentOrderId + '</span>');
        document.getElementById('payBtn').disabled = false;
      })
      .catch(e => log('<span class="error">❌ Error: ' + e.message + '</span>'));
    }

    function initiatePayment() {
      log('Getting payment URL...');

      fetch('http://localhost:5000/api/orders/' + currentOrderId + '/initiate-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      .then(r => r.json())
      .then(data => {
        payfastUrl = data.payfastUrl;
        log('<span class="success">✅ Payment URL Generated</span>');
        log('URL (first 100 chars): ' + payfastUrl.substring(0, 100) + '...');
        document.getElementById('payFastBtn').disabled = false;
      })
      .catch(e => log('<span class="error">❌ Error: ' + e.message + '</span>'));
    }

    function goToPayFast() {
      log('Redirecting to PayFast...');
      window.location.href = payfastUrl;
    }

    function checkStatus() {
      if (!currentOrderId) {
        log('<span class="error">Create order first!</span>');
        return;
      }

      fetch('http://localhost:5000/api/payfast/' + currentOrderId + '/status')
      .then(r => r.json())
      .then(data => {
        log('<span class="success">✅ Order ID: ' + data.orderId + '</span>');
        log('Payment Status: <strong>' + data.paymentStatus + '</strong>');
        log('Total Amount: ' + data.totalAmount);
      })
      .catch(e => log('<span class="error">❌ Error: ' + e.message + '</span>'));
    }
  </script>
</body>
</html>
```

### Step 6: Open the Test File

1. Save as `test-payment.html` in your project folder
2. Open in browser: `file:///path/to/test-payment.html`
3. Click buttons in order:
   - Create Test Order
   - Get Payment Link
   - Check Payment Status

---

## Phase 6: Test Full Payment Flow

### Step 7: Actually Pay (Optional - PayFast Test Card)

If you got a valid `payfastUrl`:

1. Click "Open PayFast Payment"
2. You'll be redirected to PayFast
3. Use PayFast test card:
   - **Card Number:** 4111 1111 1111 1111
   - **Expiry:** Any future date (e.g., 12/25)
   - **CVC:** Any 3 digits (e.g., 123)

4. Complete the payment

### Expected Behavior:

**If payment is successful:**
1. PayFast redirects you to `PAYFAST_RETURN_URL`
2. Your backend receives webhook callback at `/api/payfast/callback`
3. Order status changes from "pending" to "paid"
4. Payment is recorded in database

**To verify:**
```bash
curl -X GET http://localhost:5000/api/payfast/ORD-xxxxx/status
```

Should now show:
```json
{
  "paymentStatus": "paid"
}
```

---

## Phase 7: Advanced Testing (Database Check)

### Step 8: Check MongoDB

Connect to MongoDB and verify:

```javascript
// Check if order exists
db.orders.findOne({ orderId: "ORD-xxxxx" })
// Should show:
// {
//   orderId: "ORD-...",
//   userName: "Ali Khan",
//   paymentStatus: "paid",    // ← Changed from "pending"
//   ...
// }

// Check payment record
db.paymentrecords.find()
// Should show callback data from PayFast
```

---

## Phase 8: Security Testing

### Step 9: Verify Signature Verification

Edit your backend to test signature verification failure:

In `controllers/PayFastController.js`, temporarily log what happens:

```javascript
const signatureVerified = verifySignature(pfData);
console.log('Signature verified:', signatureVerified);
// If false, payment is rejected ✅
```

Test this by:
1. Capturing a real callback
2. Modifying the amount
3. Sending it to `/api/payfast/callback`
4. It should be REJECTED (signature won't match)

---

## Testing Checklist

### Local Testing
- [ ] Server starts without errors
- [ ] MongoDB connects successfully
- [ ] TEST 1: Create order returns orderId
- [ ] TEST 2: Get payment URL returns valid URL
- [ ] TEST 3: Check status shows "pending"
- [ ] Credentials NOT visible in responses
- [ ] Credentials NOT visible in DevTools

### Frontend Testing
- [ ] Create order button works
- [ ] Get payment link button works
- [ ] Check status button works
- [ ] No errors in browser console
- [ ] API calls visible in Network tab

### Security Testing
- [ ] No PAYFAST_MERCHANT_ID in responses
- [ ] No PAYFAST_MERCHANT_KEY in responses
- [ ] No PAYFAST_PASSPHRASE in responses
- [ ] Signatures verified on backend
- [ ] Fake payments are rejected

### Payment Testing (Optional)
- [ ] PayFast payment goes through
- [ ] Order status changes to "paid"
- [ ] Payment appears in database
- [ ] Callback is received
- [ ] Email confirmation sent (if configured)

---

## Troubleshooting During Testing

### Issue: Server won't start
```bash
# Check logs
npm start
# Look for errors about MongoDB or ports
```
**Solution:**
- Check `.env` MONGO_URI is correct
- Check port 5000 is not in use
- Check MongoDB is running

---

### Issue: CORS Error in Browser
```
Access to XMLHttpRequest blocked by CORS policy
```
**Solution:**
- CORS is already configured
- Make sure backend is running
- Check network tab for actual error

---

### Issue: "Order not found"
**Solution:**
- Make sure orderId from TEST 1 is correct
- Make sure you're using exact orderId in TEST 2 & 3
- Copy/paste the orderId

---

### Issue: Payment URL is invalid
**Solution:**
- Check PAYFAST_MERCHANT_ID is set
- Check PAYFAST_MERCHANT_KEY is set
- Check PAYFAST_PASSPHRASE is set
- Restart server after changing .env

---

### Issue: PayFast callback not received
**Solution:**
- Check PAYFAST_NOTIFY_URL in .env is correct
- For local testing, use `http://localhost:5000/api/payfast/callback`
- PayFast test environment may not send real callbacks
- Check logs for errors

---

## Quick Test Commands

### Test 1: Create Order
```bash
curl -X POST http://localhost:5000/api/orders/create \
  -H "Content-Type: application/json" \
  -d '{"userName":"Test","userPhone":"+923001234567","totalAmount":5000,"ticketsPurchased":[{"eventDay":1,"ticketType":"General","quantity":1,"names":["Test"],"price":5000}]}'
```

### Test 2: Get Payment URL
```bash
curl -X POST http://localhost:5000/api/orders/ORD-YOUR-ID/initiate-payment
```

### Test 3: Check Status
```bash
curl -X GET http://localhost:5000/api/payfast/ORD-YOUR-ID/status
```

---

## Summary

✅ **Phase 1:** Setup .env (2 min)
✅ **Phase 2:** Start server (1 min)
✅ **Phase 3:** Test 3 API endpoints (5 min)
✅ **Phase 4:** Verify security (3 min)
✅ **Phase 5:** Frontend test (5 min)
✅ **Phase 6:** Full payment flow (10 min optional)
✅ **Phase 7:** Database verification (5 min)
✅ **Phase 8:** Security testing (10 min)

**Total Time:** ~30 minutes

After this, you'll know:
- ✅ Backend is working
- ✅ API endpoints are responding
- ✅ Credentials are secure
- ✅ Payments can be processed
- ✅ System is production-ready

---

## Next Steps After Testing

1. ✅ Backend is tested locally
2. → Deploy to production
3. → Update PayFast dashboard with production URLs
4. → Test with real PayFast credentials
5. → Go live!

Happy testing! 🎉
