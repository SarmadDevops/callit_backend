# PayFast Payment API Documentation

Complete CRUD operations for ticket payments using PayFast payment gateway.

---

## 🔄 Payment Workflow

```
1. User creates order (Orders API)
   ↓
2. Initialize payment (POST /initialize)
   ↓
3. User redirected to PayFast payment page
   ↓
4. Customer completes payment on PayFast
   ↓
5. PayFast sends callback (POST /callback)
   ↓
6. Order status updated to "paid"
   ↓
7. Customer redirected to success page
```

---

## 📋 API Endpoints

### CREATE: Initialize Payment

**Initialize a new payment for an order**

```
POST /api/payfast/initialize
```

**Request Body:**
```json
{
  "orderId": "ORD-1764344246639-726",
  "email_address": "customer@example.com"
}
```

**Response (201 Created):**
```json
{
  "message": "Payment initialized successfully",
  "orderId": "ORD-1764344246639-726",
  "amount": 1500.00,
  "payfastUrl": "https://www.payfast.pk/eng/process?merchant_id=243483&...",
  "paymentId": "629c0646d54fd745439df3e",
  "createdAt": "2025-11-28T15:35:00.000Z"
}
```

**Status Codes:**
- `201 Created` - Payment initialized successfully
- `400 Bad Request` - Order ID is required or order already paid
- `404 Not Found` - Order not found
- `500 Server Error` - Server error

---

### READ: Get Payment Status

**Get payment status for a specific order**

```
GET /api/payfast/status/:orderId
```

**Example:**
```
GET /api/payfast/status/ORD-1764344246639-726
```

**Response (200 OK):**
```json
{
  "orderId": "ORD-1764344246639-726",
  "orderStatus": "pending",
  "amount": 1500.00,
  "payments": [
    {
      "id": "629c0646d54fd745439df50",
      "status": "initiated",
      "signatureVerified": false,
      "transactionTime": "2025-11-28T15:35:00.000Z",
      "payfastId": null
    }
  ],
  "lastPayment": {
    "_id": "629c0646d54fd745439df50",
    "paymentStatus": "initiated"
  }
}
```

**Status Codes:**
- `200 OK` - Payment status retrieved
- `400 Bad Request` - Order ID is required
- `404 Not Found` - Order not found
- `500 Server Error` - Server error

---

### READ: Get All Payments

**Get all payments with optional filters**

```
GET /api/payfast/list?status=completed&orderId=ORD-123
```

**Query Parameters:**
- `status` (optional) - Filter by payment status: `initiated`, `pending`, `completed`, `failed`, `canceled`, `retry`
- `orderId` (optional) - Filter by order ID

**Example URLs:**
```
GET /api/payfast/list                           # All payments
GET /api/payfast/list?status=completed          # Only completed
GET /api/payfast/list?orderId=ORD-123           # Specific order
GET /api/payfast/list?status=completed&orderId=ORD-123
```

**Response (200 OK):**
```json
{
  "total": 15,
  "totalAmount": "22500.75",
  "payments": [
    {
      "id": "629c0646d54fd745439df50",
      "orderId": "ORD-1764344246639-726",
      "amount": "1500.00",
      "status": "completed",
      "signatureVerified": true,
      "transactionTime": "2025-11-28T15:40:00.000Z",
      "payfastId": "1234567890"
    },
    {
      "id": "629c0646d54fd745439df51",
      "orderId": "ORD-1764344246639-727",
      "amount": "2000.00",
      "status": "failed",
      "signatureVerified": false,
      "transactionTime": "2025-11-28T15:45:00.000Z",
      "payfastId": null
    }
  ]
}
```

**Status Codes:**
- `200 OK` - Payments retrieved
- `500 Server Error` - Server error

---

### UPDATE: PayFast Callback

**Handle payment completion callback from PayFast (server-to-server)**

```
POST /api/payfast/callback
```

**Request Body (sent by PayFast):**
```json
{
  "m_payment_id": "ORD-1764344246639-726",
  "pf_payment_id": "1234567890",
  "payment_status": "COMPLETE",
  "item_name": "Goonj Event Tickets",
  "amount_gross": "1500.00",
  "amount_fee": "31.50",
  "amount_net": "1468.50",
  "name_first": "Ahmed",
  "email_address": "ahmed@example.com",
  "merchant_id": "243483",
  "signature": "abc123def456..."
}
```

**Response (200 OK):**
```json
{
  "message": "Payment processed successfully",
  "orderId": "ORD-1764344246639-726",
  "paymentStatus": "completed",
  "signatureVerified": true
}
```

**Payment Status Values:**
- `completed` - Payment successful (signature verified + COMPLETE status)
- `pending` - Payment pending
- `failed` - Payment failed
- `canceled` - Payment canceled

**Note:** This endpoint is called by PayFast servers, not the frontend.

---

### UPDATE: Retry Payment

**Generate a new payment link for a failed/pending order**

```
POST /api/payfast/retry
```

**Request Body:**
```json
{
  "orderId": "ORD-1764344246639-726",
  "email_address": "customer@example.com"
}
```

**Response (200 OK):**
```json
{
  "message": "Payment retry link generated",
  "orderId": "ORD-1764344246639-726",
  "amount": 1500.00,
  "payfastUrl": "https://www.payfast.pk/eng/process?merchant_id=243483&..."
}
```

**Status Codes:**
- `200 OK` - Retry payment link generated
- `400 Bad Request` - Order ID required or order already paid
- `404 Not Found` - Order not found
- `500 Server Error` - Server error

**Use Case:** Customer's payment failed, send them this new URL to retry.

---

### DELETE: Cancel Payment

**Cancel payment for a pending or failed order**

```
DELETE /api/payfast/cancel/:orderId
```

**Example:**
```
DELETE /api/payfast/cancel/ORD-1764344246639-726
```

**Response (200 OK):**
```json
{
  "message": "Order payment canceled successfully",
  "orderId": "ORD-1764344246639-726",
  "status": "canceled"
}
```

**Status Codes:**
- `200 OK` - Payment canceled
- `400 Bad Request` - Order ID required or order already paid
- `404 Not Found` - Order not found
- `500 Server Error` - Server error

**Restrictions:**
- Cannot cancel an already paid order
- Only works for `pending` or `failed` orders

---

## 🧪 Testing Complete Payment Flow

### Step 1: Create Order
```bash
curl -X POST http://localhost:5000/api/orders/create \
  -H "Content-Type: application/json" \
  -d '{
    "userName": "Ahmed Ali",
    "userPhone": "+27123456789",
    "totalAmount": 1500.00,
    "ticketsPurchased": [{
      "eventDay": 1,
      "ticketType": "VIP",
      "quantity": 2,
      "names": ["Ahmed Ali", "Fatima Khan"],
      "price": 750.00
    }]
  }'
```

**Copy the `orderId` from response**

---

### Step 2: Initialize Payment
```bash
curl -X POST http://localhost:5000/api/payfast/initialize \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "ORD-1764344246639-726",
    "email_address": "ahmed@example.com"
  }'
```

**Get the `payfastUrl` from response and open in browser**

---

### Step 3: Check Payment Status (Before Callback)
```bash
curl http://localhost:5000/api/payfast/status/ORD-1764344246639-726
```

**Response:** Status should be `initiated`

---

### Step 4: Simulate Payment Callback
```bash
curl -X POST http://localhost:5000/api/payfast/callback \
  -H "Content-Type: application/json" \
  -d '{
    "m_payment_id": "ORD-1764344246639-726",
    "pf_payment_id": "1234567890",
    "payment_status": "COMPLETE",
    "amount_gross": "1500.00",
    "amount_fee": "31.50",
    "amount_net": "1468.50",
    "email_address": "ahmed@example.com",
    "merchant_id": "243483"
  }'
```

---

### Step 5: Check Payment Status (After Callback)
```bash
curl http://localhost:5000/api/payfast/status/ORD-1764344246639-726
```

**Response:** Status should be `completed`

---

### Step 6: Verify Order was Updated
```bash
curl http://localhost:5000/api/orders/ORD-1764344246639-726
```

**Response:** `paymentStatus` should be `paid`

---

## 💾 Database Schema

### PaymentRecord Collection

```javascript
{
  _id: ObjectId,
  orderId: String (indexed),
  payfastResponse: Object,
  signatureVerified: Boolean,
  paymentStatus: String (enum: ["initiated", "pending", "completed", "failed", "canceled", "retry"]),
  customerEmail: String,
  transactionTime: Date (indexed),
  updatedAt: Date
}
```

### Order Collection (Updated)

```javascript
{
  orderId: String (unique),
  paymentStatus: String (enum: ["pending", "paid", "canceled", "failed"]),
  dateCreated: Date,
  updatedAt: Date  // NEW
}
```

---

## 🔐 Security Features

✅ **Signature Verification** - All PayFast responses are verified with MD5 signature
✅ **Data Validation** - All inputs are validated
✅ **Order Matching** - Callback verified against database order
✅ **Payment Status Tracking** - Complete history of payment attempts
✅ **Email Logging** - Customer email recorded for communication

---

## 🚀 Postman Collection

All endpoints are included in the Postman collection. Import and test:

1. Create Order
2. Initialize Payment
3. Get Payment Status
4. Get All Payments
5. Retry Payment
6. Cancel Payment
7. Simulate Callback

---

## ⚠️ Important Notes

### Payment Status Flow

```
Order Created (pending)
    ↓
Payment Initiated (initiated)
    ↓
Customer Pays on PayFast
    ↓
Callback Received
    ↓
Payment Completed (completed) → Order Paid (paid)
OR
Payment Failed (failed) → Order Failed (failed)
```

### Callback Considerations

- PayFast calls your `/callback` endpoint server-to-server
- Signature is verified to ensure authentic PayFast request
- Order is updated only after signature verification
- Multiple payment attempts create separate records

### Error Handling

- If callback fails, PayFast will retry
- Duplicate callbacks are handled (same `pf_payment_id`)
- Failed payments can be retried with new payment link

---

## 🛠️ Troubleshooting

### Payment Link Not Working
- Check if `orderId` is valid
- Verify PayFast merchant ID and key in `.env`
- Check order `paymentStatus` is not already "paid"

### Callback Not Received
- Verify `PAYFAST_NOTIFY_URL` in `.env` is correct
- Check server is accessible from internet
- PayFast servers might be retrying (check logs)

### Signature Verification Failed
- Check PayFast merchant key is correct
- Ensure passphrase matches PayFast account settings
- Verify callback data matches expected format

---

## 📊 Example Complete Payment

**Initial Order Creation:**
- Status: `pending`
- Amount: 1500.00 PKR

**After Payment Initialized:**
- Payment Record Created
- Status: `initiated`
- PayFast URL Generated

**After Customer Pays:**
- Callback Received from PayFast
- Signature Verified
- Payment Status: `completed`
- Order Status: `paid`

**Database Records:**
- Order: `{paymentStatus: "paid"}`
- PaymentRecord: `{paymentStatus: "completed", signatureVerified: true}`

---

## 🎯 Key Features

✅ Full CRUD operations
✅ Payment retry mechanism
✅ Payment cancellation
✅ Multi-attempt tracking
✅ Signature verification
✅ Email logging
✅ Status filtering
✅ Transaction history
✅ Amount aggregation
✅ Error handling

Everything is production-ready! 🚀
