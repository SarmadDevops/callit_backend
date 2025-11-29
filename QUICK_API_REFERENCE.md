# Quick API Reference - All PayFast Endpoints

## 📋 Complete List of PayFast Endpoints

### 1. Get Access Token
```http
POST /api/payfast/get-token
Content-Type: application/json

{
  "orderId": "ORD-123",
  "amount": 5000
}
```
**Returns:** `ACCESS_TOKEN` for payment initialization

---

### 2. Initialize Payment
```http
POST /api/payfast/initialize
Content-Type: application/json

{
  "orderId": "ORD-123",
  "email_address": "customer@example.com",
  "token": "ACCESS_TOKEN"
}
```
**Returns:** Checkout URL and form data to submit to PayFast

---

### 3. Get Payment Status (by Order ID)
```http
GET /api/payfast/status/ORD-123
```
**Returns:** Payment history and current status for an order

---

### 4. Get All Payments
```http
GET /api/payfast/list?status=completed&orderId=ORD-123
```
**Returns:** List of all payments with optional filters

---

### 5. Check Transaction Status by Basket ID ⭐ **NEW**
```http
GET /api/payfast/transaction-status/ORD-123?orderDate=2025-11-29
```
**Returns:** Direct transaction status from PayFast API
**Based on:** Official PayFast Pakistan documentation

---

### 6. Payment Callback (Server-to-Server)
```http
POST /api/payfast/callback
Content-Type: application/x-www-form-urlencoded

[Sent by PayFast - not called manually]
```
**Triggered by:** PayFast after user completes payment
**Actions:** Updates payment records and order status

---

### 7. Retry Payment
```http
POST /api/payfast/retry
Content-Type: application/json

{
  "orderId": "ORD-123",
  "email_address": "customer@example.com"
}
```
**Returns:** New payment form for failed order

---

### 8. Cancel Payment
```http
DELETE /api/payfast/cancel/ORD-123
```
**Returns:** Confirmation of payment cancellation
**Works for:** Pending and failed orders only

---

### 9. Legacy Redirect (Backward Compatibility)
```http
POST /api/payfast/redirect
Content-Type: application/json

{
  "orderId": "ORD-123",
  "email_address": "customer@example.com",
  "token": "ACCESS_TOKEN"
}
```
**Returns:** Same as `/initialize` (alias for compatibility)

---

## 🆕 NEW ENDPOINT DETAILS

### Check Transaction Status by Basket ID

**Endpoint:** `GET /api/payfast/transaction-status/:basketId`

**Purpose:** Query PayFast directly for transaction status using basket ID

**Parameters:**
| Name | Type | Required | Location | Example |
|------|------|----------|----------|---------|
| basketId | String | Yes | URL | ORD-1764425203940-943 |
| orderDate | String | Yes | Query | 2025-11-29 |

**Example Requests:**

Curl:
```bash
curl -X GET "http://localhost:5000/api/payfast/transaction-status/ORD-123?orderDate=2025-11-29"
```

JavaScript:
```javascript
const response = await fetch(
  `/api/payfast/transaction-status/ORD-123?orderDate=2025-11-29`
);
const data = await response.json();
```

Axios:
```javascript
axios.get(`/api/payfast/transaction-status/ORD-123`, {
  params: { orderDate: '2025-11-29' }
})
```

**Success Response:**
```json
{
  "success": true,
  "message": "Transaction status retrieved successfully",
  "basketId": "ORD-123",
  "orderDate": "2025-11-29",
  "payfastResponse": {
    // PayFast's response
  }
}
```

**Error Responses:**
```json
// Missing orderDate
{
  "success": false,
  "message": "orderDate is required (format: YYYY-MM-DD)"
}

// Invalid basketId from PayFast
{
  "success": false,
  "message": "Failed to check transaction status",
  "error": "404 - File or directory not found",
  "basketId": "ORD-123"
}
```

**Use Cases:**
1. Verify payment status on-demand
2. Reconcile local records with PayFast
3. Verify callback data authenticity
4. Customer service checks

---

## 📊 Complete Endpoint Summary

| # | Method | Endpoint | Purpose | New? |
|---|--------|----------|---------|------|
| 1 | POST | `/get-token` | Get payment token | ❌ |
| 2 | POST | `/initialize` | Start payment | ❌ |
| 3 | GET | `/status/:orderId` | Check by order ID | ❌ |
| 4 | GET | `/list` | Get all payments | ❌ |
| 5 | GET | `/transaction-status/:basketId` | Check by basket ID | ⭐ **YES** |
| 6 | POST | `/callback` | Receive payment callback | ❌ |
| 7 | POST | `/retry` | Retry failed payment | ❌ |
| 8 | DELETE | `/cancel/:orderId` | Cancel payment | ❌ |
| 9 | POST | `/redirect` | Legacy init endpoint | ❌ |

---

## 🔑 Environment Variables Required

```env
PAYFAST_BASE_URL=https://ipg1.apps.net.pk
PAYFAST_MERCHANT_ID=243483
PAYFAST_MERCHANT_KEY=dK-krJUVclVgUyE80knTvrie
PAYFAST_SECURED_KEY=dK-krJUVclVgUyE80knTvrie
PAYFAST_RETURN_URL=http://localhost:3000/success
PAYFAST_CANCEL_URL=http://localhost:3000/cancel
PAYFAST_NOTIFY_URL=http://localhost:5000/api/payfast/callback
```

---

## 📍 Base URL

```
Development: http://localhost:5000/api/payfast
Production: https://yourdomain.com/api/payfast
```

---

## 🔄 Standard Payment Flow

```
1. Frontend initiates payment
   └─ POST /api/payfast/get-token
      └─ Returns: ACCESS_TOKEN

2. Frontend initializes payment form
   └─ POST /api/payfast/initialize
      └─ Returns: Checkout URL + Form Data

3. Frontend submits form to PayFast
   └─ User completes payment on PayFast

4. PayFast redirects user + sends callback
   └─ POST /api/payfast/callback
      └─ Updates: Payment record + Order status

5. [Optional] Verify status
   └─ GET /api/payfast/transaction-status/:basketId
      └─ Returns: Direct PayFast response
```

---

## ⚡ Quick Test Commands

### Test 1: Health Check
```bash
curl http://localhost:5000/
```

### Test 2: Get Payment List
```bash
curl http://localhost:5000/api/payfast/list
```

### Test 3: Get Order Status
```bash
curl http://localhost:5000/api/payfast/status/ORD-123
```

### Test 4: Check Transaction Status (NEW)
```bash
curl "http://localhost:5000/api/payfast/transaction-status/ORD-123?orderDate=2025-11-29"
```

### Test 5: Retry Payment
```bash
curl -X POST http://localhost:5000/api/payfast/retry \
  -H "Content-Type: application/json" \
  -d '{"orderId":"ORD-123","email_address":"test@example.com"}'
```

### Test 6: Cancel Payment
```bash
curl -X DELETE http://localhost:5000/api/payfast/cancel/ORD-123
```

---

## 💡 Common Scenarios

### Scenario 1: User Completes Payment Successfully
```
1. User clicks "Proceed to Payment"
2. POST /get-token → Get token
3. POST /initialize → Get checkout URL
4. Frontend redirects to PayFast
5. User completes payment
6. PayFast redirects + sends callback
7. Order status → "paid"
✅ Done!
```

### Scenario 2: Payment Failed, User Wants to Retry
```
1. User clicks "Retry Payment"
2. POST /retry → Get new payment form
3. Frontend redirects to PayFast again
4. User completes payment
5. PayFast sends callback
6. Order status → "paid"
✅ Done!
```

### Scenario 3: Verify Payment Status Manually
```
1. Get order ID: ORD-123
2. GET /transaction-status/ORD-123?orderDate=2025-11-29
3. PayFast returns transaction details
4. Verify status in response
✅ Status confirmed!
```

### Scenario 4: Check Payment History
```
1. GET /list → Get all payments
2. GET /status/ORD-123 → Get specific order payments
3. View payment records and timestamps
✅ History retrieved!
```

---

## 🐛 Error Handling

### Common HTTP Status Codes

| Status | Meaning | Example |
|--------|---------|---------|
| 200 | Success | Payment processed |
| 400 | Bad Request | Missing parameters |
| 404 | Not Found | Order doesn't exist |
| 500 | Server Error | PayFast API down |

### Error Response Format
```json
{
  "success": false,
  "message": "Human-readable error message",
  "error": "Technical error details"
}
```

---

## 📈 Latest Updates

### Version 1.0 (2025-11-29)
- ✅ Initial PayFast integration
- ✅ Get token endpoint
- ✅ Initialize payment endpoint
- ✅ Payment callback handling
- ✅ Retry/cancel functionality
- ✅ Payment status queries

### Version 2.0 (2025-11-29)
- ✅ Transaction status by basket_id endpoint (NEW)
- ✅ Based on official PayFast documentation
- ✅ Direct PayFast API query
- ✅ On-demand status verification

---

## 🎯 Recommended Use

**For Frontend:**
- Use `/get-token` + `/initialize` for payment flow
- Use `/transaction-status/:basketId` for on-demand checks
- Use `/status/:orderId` for order-specific history

**For Backend/Admin:**
- Use `/list` for payment reports
- Use `/transaction-status/:basketId` for reconciliation
- Use `/status/:orderId` for customer service

**For Testing:**
- Use `/transaction-status` with test basket IDs
- Verify with real order IDs from database
- Use correct date format (YYYY-MM-DD)

---

## 📚 Additional Documentation

- **TRANSACTION_STATUS_API.md** - Complete endpoint documentation
- **TRANSACTION_STATUS_ADDED.md** - Implementation details
- **POSTMAN_GUIDE.md** - Postman collection guide
- **DEBUGGING_GUIDE.md** - Debugging instructions

---

## ✅ Verification Checklist

- [x] All endpoints documented
- [x] New endpoint fully tested
- [x] Error handling verified
- [x] Parameter validation working
- [x] PayFast integration confirmed
- [x] No existing code disturbed
- [x] Backend running smoothly
- [x] Database connected

---

**Last Updated:** 2025-11-29
**Backend Status:** ✅ Running
**Database Status:** ✅ Connected
**All Endpoints:** ✅ Functional
