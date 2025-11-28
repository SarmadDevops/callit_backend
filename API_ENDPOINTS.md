# Complete API Endpoints Reference

## Base URL
```
http://localhost:5000
https://yourdomain.com (production)
```

---

## Order Management

### POST /api/orders/create
Create a new ticket order

**Request:**
```json
{
  "userName": "string",
  "userPhone": "string",
  "totalAmount": "number",
  "ticketsPurchased": [
    {
      "eventDay": "number",
      "ticketType": "string",
      "quantity": "number",
      "names": ["string"],
      "price": "number"
    }
  ]
}
```

**Response (201):**
```json
{
  "message": "Order created successfully",
  "orderId": "ORD-1701184200000-432",
  "totalAmount": 5000,
  "userName": "Ali Khan"
}
```

**Errors:**
- 400: Invalid order data
- 500: Server error

---

### POST /api/orders/:orderId/initiate-payment
Initiate PayFast payment (get payment URL)

**Request:**
```
Empty body
```

**Response (200):**
```json
{
  "message": "Payment initiated",
  "payfastUrl": "https://www.payfast.pk/eng/process?merchant_id=..."
}
```

**Errors:**
- 404: Order not found
- 400: Order status is not "pending"
- 500: Server error

---

### GET /api/orders/:orderId
Get order details and status

**Response (200):**
```json
{
  "_id": "ObjectId",
  "orderId": "ORD-1701184200000-432",
  "userName": "Ali Khan",
  "userPhone": "+923001234567",
  "ticketsPurchased": [...],
  "totalAmount": 5000,
  "paymentStatus": "paid",
  "provider": "PayFast",
  "dateCreated": "2024-01-01T10:00:00Z"
}
```

**Payment Status Values:**
- `pending` - Order created, awaiting payment
- `paid` - Payment confirmed
- `canceled` - User canceled payment
- `failed` - Payment failed

---

## Payment Management

### POST /api/payfast/callback
PayFast callback endpoint (webhook)

⚠️ **Called by PayFast servers, not your frontend**

**What PayFast sends:**
```json
{
  "m_payment_id": "ORD-123",
  "payment_status": "COMPLETE",
  "pf_payment_id": "123456",
  "amount_gross": 5000,
  "amount_fee": 50,
  "amount_net": 4950,
  "signature": "md5hash..."
}
```

**Response (200):**
```
OK
```

**What happens:**
1. Backend verifies signature
2. If valid & payment complete, order status → "paid"
3. Payment record stored for audit

---

### GET /api/payfast/:orderId/status
Check payment status

**Response (200):**
```json
{
  "orderId": "ORD-1701184200000-432",
  "paymentStatus": "paid",
  "totalAmount": 5000
}
```

**Errors:**
- 404: Order not found
- 500: Server error

---

## Error Responses

### 400 Bad Request
```json
{
  "message": "Invalid order data"
}
```

### 404 Not Found
```json
{
  "message": "Order not found"
}
```

### 500 Server Error
```json
{
  "message": "Server error"
}
```

---

## Request/Response Headers

**Required:**
```
Content-Type: application/json
```

**Optional:**
```
Authorization: Bearer token (if implemented)
```

---

## Rate Limiting (Optional)

Currently not implemented. Add if needed:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1234567890
```

---

## Examples

### Complete Flow - cURL

**1. Create Order:**
```bash
curl -X POST http://localhost:5000/api/orders/create \
  -H "Content-Type: application/json" \
  -d '{
    "userName": "Ali Khan",
    "userPhone": "+923001234567",
    "totalAmount": 5000,
    "ticketsPurchased": [{
      "eventDay": 1,
      "ticketType": "General",
      "quantity": 2,
      "names": ["Ali Khan", "Sara Khan"],
      "price": 2500
    }]
  }'
```

**Response:**
```json
{
  "message": "Order created successfully",
  "orderId": "ORD-1701184200000-123",
  "totalAmount": 5000,
  "userName": "Ali Khan"
}
```

**2. Initiate Payment:**
```bash
curl -X POST http://localhost:5000/api/orders/ORD-1701184200000-123/initiate-payment \
  -H "Content-Type: application/json"
```

**Response:**
```json
{
  "message": "Payment initiated",
  "payfastUrl": "https://www.payfast.pk/eng/process?merchant_id=..."
}
```

**3. Redirect user to PayFast URL in browser**

**4. After payment, check status:**
```bash
curl -X GET http://localhost:5000/api/payfast/ORD-1701184200000-123/status
```

**Response:**
```json
{
  "orderId": "ORD-1701184200000-123",
  "paymentStatus": "paid",
  "totalAmount": 5000
}
```

---

## API Testing Tools

- **Postman:** Import collection from `/postman_collection.json` (if created)
- **cURL:** Examples above
- **Insomnia:** Use same requests as Postman
- **Thunder Client:** VS Code extension

---

## Security Notes

✅ **DO:**
- Always verify callback signatures
- Use HTTPS in production
- Keep credentials in `.env`
- Log payment events

❌ **DON'T:**
- Expose PayFast credentials in responses
- Skip signature verification
- Trust frontend payment status claims
- Commit `.env` to git

---

## Status Codes Summary

| Code | Meaning | Example |
|------|---------|---------|
| 200 | Success | Payment checked, order retrieved |
| 201 | Created | Order created |
| 400 | Bad Request | Missing fields, invalid data |
| 404 | Not Found | Order doesn't exist |
| 500 | Server Error | Database error, etc |

