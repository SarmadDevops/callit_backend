# PayFast Payment Flow - Debugging Guide

## 🔴 Debugger Points Installed

Your backend now has **6 strategic debugger points** to verify the payment flow:

---

## Location 1: utils/Payfast.js

### Line 5 - generateSignature() function
```javascript
debugger; // 🔴 DEBUGGER: generateSignature function called
```
**What it checks:** 
- Is the signature generation being called?
- Are the correct payment data fields being passed?
- Is the MD5 hash being created properly?

### Line 26 - verifySignature() function  
```javascript
debugger; // 🔴 DEBUGGER: Verify signature function called
```
**What it checks:**
- Is the callback signature verification being called?
- Is the PayFast callback data arriving correctly?
- Can we extract the signature from the callback?

### Line 42 - buildPayFastURL() function
```javascript
debugger; // 🔴 DEBUGGER: buildPayFastURL function called
```
**What it checks:**
- Is the PayFast checkout URL being built?
- Are all form data fields present?
- Is the payment data ready to send?

---

## Location 2: controllers/PayFastController.js

### Line 303 - payfastCallback() START
```javascript
debugger; // 🔴 DEBUGGER: PayFast callback received - STOPS HERE
```
**What it checks:**
- Is the callback endpoint being reached?
- Is PayFast sending data back to your backend?
- Is the notify_url working correctly?

### Line 322 - Payment Status Determination
```javascript
debugger; // 🔴 DEBUGGER: Checking payment status
```
**What it checks:**
- What is the payment status from PayFast?
- Is signature verified?
- Is the status COMPLETE, PENDING, or FAILED?

### Line 336 & 364 - Database Updates
```javascript
debugger; // 🔴 DEBUGGER: Creating/updating payment record
debugger; // 🔴 DEBUGGER: Updating order status
```
**What it checks:**
- Is the payment record being saved to database?
- Is the order status being updated?
- Are the updates successful?

---

## How to Use the Debuggers

### Option 1: Chrome DevTools (Recommended)

1. **Open Chrome DevTools:**
   ```
   chrome://inspect
   ```

2. **Find the Node.js process:**
   - You should see: `node --inspect index.js`
   - Click **inspect** link

3. **When debugger hits:**
   - Execution will pause at the `debugger;` line
   - You can inspect variables
   - Step through code
   - View console logs

### Option 2: Visual Studio Code

1. **Add .vscode/launch.json:**
   ```json
   {
     "version": "0.2.0",
     "configurations": [
       {
         "type": "node",
         "request": "attach",
         "name": "Attach to Process",
         "port": 9229
       }
     ]
   }
   ```

2. **Run "Attach to Process"** from VS Code debugger

3. **Same debugging experience as Chrome**

### Option 3: Command Line (Node Inspector)

```bash
node inspect index.js
```

Then use debugger commands:
- `c` - Continue
- `n` - Next
- `s` - Step into
- `o` - Step out

---

## Testing Payment Flow with Debuggers

### Step 1: Start Backend with Debugger
```bash
# Already running!
# Backend: http://localhost:5000 (with --inspect)
# Debugger: ws://127.0.0.1:9229
```

### Step 2: Open Chrome DevTools
```
chrome://inspect → Click "inspect" on node process
```

### Step 3: Make a Payment from Frontend

Frontend Flow:
1. User selects tickets
2. Clicks "Proceed to Payment"
3. Frontend calls: `POST /api/payfast/get-token`
   - ✅ Will NOT hit debugger (backend utility)
4. Frontend calls: `POST /api/payfast/initialize`
   - ✅ **DEBUGGER 1 & 2 & 3 hit** (generateSignature, buildPayFastURL)
5. Frontend submits form to PayFast gateway
6. User completes payment on PayFast
7. PayFast redirects user & sends callback
8. Backend receives callback
   - ✅ **DEBUGGER 4, 5, 6 hit** (payfastCallback)

---

## Console Logs to Watch For

### When generateSignature is called:
```
[PAYFAST UTILS] generateSignature called with data: {
  merchant_id: "243483",
  merchant_key: "...",
  ...
}
```

### When verifySignature is called:
```
[PAYFAST UTILS] verifySignature called with data: {
  m_payment_id: "ORD-xxx",
  signature: "abc123...",
  payment_status: "COMPLETE"
}
```

### When callback is received:
```
[PAYFAST CALLBACK] 🔴 CALLBACK RECEIVED - Data: {
  m_payment_id: "ORD-xxx",
  pf_payment_id: "12345",
  payment_status: "COMPLETE",
  ...
}
[PAYFAST CALLBACK] ✓ Signature Verified: true
[PAYFAST CALLBACK] ✓ Order found: ORD-xxx
[PAYFAST CALLBACK] ✓ Payment COMPLETED
[PAYFAST CALLBACK] 📝 Creating/updating PaymentRecord
[PAYFAST CALLBACK] ✓ PaymentRecord saved successfully
[PAYFAST CALLBACK] 💾 Updating order status to PAID
[PAYFAST CALLBACK] ✓ Order updated to PAID
```

---

## Verification Checklist

### During Frontend Payment:

- [ ] Check if `generateSignature` debugger hits
  - If YES → Payment data is being sent correctly
  - If NO → Issue in frontend payment initialization

- [ ] Check if `buildPayFastURL` debugger hits
  - If YES → Checkout URL is being created
  - If NO → Issue in payment form creation

### After PayFast Redirects Back:

- [ ] Check if `payfastCallback` debugger hits
  - If YES → PayFast is sending callback to your backend ✅
  - If NO → notify_url is not working ❌

- [ ] Check if signature verification passes
  - If YES → Callback data is authentic
  - If NO → Merchant key mismatch

- [ ] Check if order is found in database
  - If YES → orderId is matching correctly
  - If NO → orderId format mismatch

- [ ] Check if payment status is "completed"
  - If YES → PayFast marked payment successful
  - If NO → Payment failed on PayFast

- [ ] Check if database updates succeed
  - If YES → Order status changed to "paid"
  - If NO → Database connection issue

---

## Common Issues & Solutions

### Issue 1: Debugger Never Hits
**Problem:** `payfastCallback` debugger not hitting

**Likely Cause:** PayFast not sending callback to your backend

**Solution:**
1. Check PAYFAST_NOTIFY_URL in .env
2. Ensure it points to: `http://localhost:5000/api/payfast/callback`
3. Check PayFast merchant settings for callback configuration
4. Verify your machine is accessible from PayFast servers

### Issue 2: Signature Verification Fails
**Problem:** Console shows `✓ Signature Verified: false`

**Likely Cause:** Merchant key mismatch

**Solution:**
1. Double-check PAYFAST_MERCHANT_KEY in .env
2. Ensure it matches PayFast dashboard
3. Verify callback signature field is included

### Issue 3: Order Not Found
**Problem:** Console shows `❌ Order not found`

**Likely Cause:** orderId format mismatch

**Solution:**
1. Check if orderId from frontend matches PayFast callback
2. Ensure m_payment_id is being sent correctly
3. Verify order exists in database before payment

### Issue 4: Order Status Still "pending" After Payment
**Problem:** Database still shows `paymentStatus: "pending"`

**Likely Cause:** Callback not being processed

**Solution:**
1. Verify debugger hit step 4 & 5
2. Check MongoDB connection working
3. Ensure PaymentRecord and Order tables are accessible

---

## Database Verification

After payment completes, verify in database:

```bash
# Check Order status
curl http://localhost:5000/api/orders/ORD-xxx
# Should show: "paymentStatus": "paid"

# Check PaymentRecord
curl http://localhost:5000/api/payfast/status/ORD-xxx
# Should show PayFast transaction details
```

---

## Disabling Debuggers (When Ready for Production)

When ready to remove debuggers, simply delete the `debugger;` lines from:
- `utils/Payfast.js` (lines 5, 26, 42)
- `controllers/PayFastController.js` (lines 303, 322, 336, 364)

Then restart without `--inspect`:
```bash
node index.js
```

---

## Summary

You now have complete visibility into the payment flow:

```
Frontend Payment Flow
       ↓
generateSignature() 🔴 DEBUGGER
       ↓
buildPayFastURL() 🔴 DEBUGGER
       ↓
Form submitted to PayFast ↓ [User completes payment]
       ↓
PayFast sends callback to notify_url
       ↓
payfastCallback() 🔴 DEBUGGER (START)
       ↓
verifySignature() 🔴 DEBUGGER
       ↓
Check payment status 🔴 DEBUGGER
       ↓
Update PaymentRecord 🔴 DEBUGGER
       ↓
Update Order status 🔴 DEBUGGER
       ↓
Order now shows "paid" ✅
```

---

## Next Steps

1. Hit "Proceed to Payment" from your frontend
2. Open Chrome DevTools: `chrome://inspect`
3. Click "inspect" on node process
4. Watch the flow through all debuggers
5. Check console logs for values
6. Verify order status in database

**Good luck debugging! 🚀**
