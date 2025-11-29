# Transaction Status API - Documentation

## New Endpoint Added

### Check Transaction Status by Basket ID

**Endpoint:** `GET /api/payfast/transaction-status/:basketId`

**Source:** Official PayFast Pakistan Documentation

**Description:** Query the status of a transaction using its basket ID (order ID) and order date.

---

## API Request

### Method
```
GET /api/payfast/transaction-status/:basketId?orderDate=YYYY-MM-DD
```

### URL Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| basketId | String | Yes | The basket ID (order ID) of the transaction |

### Query Parameters
| Parameter | Type | Required | Format | Description |
|-----------|------|----------|--------|-------------|
| orderDate | String | Yes | YYYY-MM-DD | The transaction/order date |

### Headers
```
Content-Type: application/x-www-form-urlencoded
User-Agent: CallITStudio/1.0
```

---

## Example Requests

### Using Curl
```bash
curl -X GET "http://localhost:5000/api/payfast/transaction-status/ORD-1764425203940-943?orderDate=2025-11-29"
```

### Using JavaScript (Fetch)
```javascript
const basketId = "ORD-1764425203940-943";
const orderDate = "2025-11-29";

const response = await fetch(
  `http://localhost:5000/api/payfast/transaction-status/${basketId}?orderDate=${orderDate}`,
  {
    method: 'GET',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }
);

const data = await response.json();
console.log(data);
```

### Using Axios
```javascript
const basketId = "ORD-1764425203940-943";
const orderDate = "2025-11-29";

axios.get(`http://localhost:5000/api/payfast/transaction-status/${basketId}`, {
  params: {
    orderDate: orderDate
  }
})
.then(response => {
  console.log(response.data);
})
.catch(error => {
  console.error(error);
});
```

---

## Success Response (200)

```json
{
  "success": true,
  "message": "Transaction status retrieved successfully",
  "basketId": "ORD-1764425203940-943",
  "orderDate": "2025-11-29",
  "payfastResponse": {
    "status": "completed",
    "transaction_id": "12345",
    "amount": 5000,
    "currency": "PKR",
    "timestamp": "2025-11-29T14:30:00Z"
  }
}
```

---

## Error Responses

### Missing basketId
**Status:** 400 Bad Request
```json
{
  "success": false,
  "message": "basketId is required"
}
```

### Missing orderDate
**Status:** 400 Bad Request
```json
{
  "success": false,
  "message": "orderDate is required (format: YYYY-MM-DD)"
}
```

### Missing Environment Variables
**Status:** 500 Internal Server Error
```json
{
  "success": false,
  "message": "PAYFAST_MERCHANT_ID or PAYFAST_SECURED_KEY missing in environment"
}
```

### Invalid Transaction
**Status:** 404 Not Found (from PayFast)
```json
{
  "success": false,
  "message": "Failed to check transaction status",
  "error": "404 - File or directory not found",
  "basketId": "invalid-basket-id"
}
```

### Server Error
**Status:** 500 Internal Server Error
```json
{
  "success": false,
  "message": "Failed to check transaction status",
  "error": "Connection timeout or other error message",
  "basketId": "ORD-1764425203940-943"
}
```

---

## Implementation Details

### Code Location
- **Controller:** `controllers/PayFastController.js:554-614`
- **Route:** `routes/PayFastRoutes.js:40`

### Function Signature
```javascript
exports.checkTransactionStatus = async (req, res) => {
  // Validates basketId and orderDate
  // Builds PayFast API URL: {PAYFAST_BASE_URL}/transaction/basket_id/{basketId}?order_date={orderDate}
  // Makes GET request to PayFast API
  // Returns PayFast response with metadata
}
```

### Internal Flow
1. Extract `basketId` from URL parameter
2. Extract `orderDate` from query parameter
3. Validate both are provided
4. Check environment variables are configured
5. Build PayFast API URL: `/transaction/basket_id/{basketId}?order_date={orderDate}`
6. Make HTTP GET request to PayFast with headers and 15-second timeout
7. Return PayFast response wrapped in success response object

### Console Logging
```
[PAYFAST STATUS CHECK] Checking transaction status for basketId: ORD-xxx
[PAYFAST STATUS CHECK] URL: https://ipg1.apps.net.pk/transaction/basket_id/ORD-xxx?order_date=2025-11-29
[PAYFAST STATUS CHECK] Response received: {...}
```

---

## PayFast API Documentation Reference

According to PayFast Pakistan's official documentation:

```
var options = {
  'method': 'GET',
  'url': '<BASE_URL>/transaction/basket_id/<basket id>?order_date=<order/transaction date>',
  'headers': {
    'Content-Type': 'application/x-www-form-urlencoded'
  },
  formData: {
    // No form data required for GET request
  }
};
```

Our implementation follows this specification exactly, using:
- Method: `GET`
- URL: `{PAYFAST_BASE_URL}/transaction/basket_id/{basketId}?order_date={orderDate}`
- Headers: `Content-Type: application/x-www-form-urlencoded`
- Base URL: `https://ipg1.apps.net.pk` (configured in PAYFAST_BASE_URL)

---

## Use Cases

### 1. Verify Transaction Status After Callback
When you receive a payment callback, you can verify the transaction status directly from PayFast:

```javascript
// After payment callback received
const basketId = callbackData.m_payment_id; // e.g., ORD-xxx
const orderDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

const statusResponse = await fetch(
  `/api/payfast/transaction-status/${basketId}?orderDate=${orderDate}`
);
const data = await statusResponse.json();
console.log("PayFast confirmed status:", data.payfastResponse);
```

### 2. Check Payment Status on Demand
User wants to check if their payment went through without waiting for callback:

```javascript
// Frontend - Check payment status
const checkPaymentStatus = async (orderId, orderDate) => {
  const response = await fetch(
    `/api/payfast/transaction-status/${orderId}?orderDate=${orderDate}`
  );
  const data = await response.json();

  if (data.success && data.payfastResponse.status === 'completed') {
    console.log("Payment successful!");
    // Update UI
  }
};
```

### 3. Reconciliation
Reconcile your payment records with PayFast:

```javascript
// Backend - Verify all payments
const orders = await Order.find({ paymentStatus: 'pending' });

for (const order of orders) {
  const statusResponse = await fetch(
    `/api/payfast/transaction-status/${order.orderId}?orderDate=${order.dateCreated}`
  );
  const data = await statusResponse.json();

  if (data.success && data.payfastResponse.status === 'completed') {
    // Update order status in database
    await Order.updateOne(
      { orderId: order.orderId },
      { paymentStatus: 'paid' }
    );
  }
}
```

---

## Testing in Postman

### Setup
1. Open Postman
2. Create a new GET request
3. URL: `http://localhost:5000/api/payfast/transaction-status/ORD-1764425203940-943`
4. Query Parameters:
   - Key: `orderDate`
   - Value: `2025-11-29`
5. Headers:
   - Key: `Content-Type`
   - Value: `application/x-www-form-urlencoded`

### Test Cases

**Test 1: Valid Request with Test Data**
```
URL: http://localhost:5000/api/payfast/transaction-status/test-basket?orderDate=2025-11-29
Expected: Error from PayFast (test basket doesn't exist)
Status: Successful API call with PayFast error response
```

**Test 2: Missing orderDate**
```
URL: http://localhost:5000/api/payfast/transaction-status/ORD-123
Expected: 400 Bad Request
Response: "orderDate is required (format: YYYY-MM-DD)"
```

**Test 3: Missing basketId**
```
URL: http://localhost:5000/api/payfast/transaction-status/
Expected: Route not found or 400 Bad Request
```

---

## Integration with Existing Flow

This endpoint **does not disturb any existing functionality**:
- ✅ All existing PayFast endpoints remain unchanged
- ✅ All order management APIs unchanged
- ✅ All payment callback processing unchanged
- ✅ All payment retry/cancel flows unchanged
- ✅ New endpoint is purely additive

It integrates seamlessly with the existing PayFast flow:

```
1. User initiates payment → POST /api/payfast/initialize
2. User completes payment on PayFast
3. PayFast sends callback → POST /api/payfast/callback
4. [NEW] Verify status → GET /api/payfast/transaction-status/:basketId
5. Order status updated in database
```

---

## Error Handling

### Validation Errors (400)
- Missing or empty `basketId`
- Missing or empty `orderDate`
- Invalid `orderDate` format

### Configuration Errors (500)
- Missing `PAYFAST_MERCHANT_ID` in environment
- Missing `PAYFAST_MERCHANT_KEY` in environment

### PayFast API Errors
- Invalid basketId → 404 from PayFast
- Network timeout → 500 from backend
- PayFast server error → 5xx from PayFast

### Retry Logic
The endpoint includes a 15-second timeout. If PayFast doesn't respond within 15 seconds, the request will fail with a timeout error.

---

## Performance Considerations

- **Timeout:** 15 seconds (configurable via axios config)
- **Rate Limiting:** Follow PayFast's rate limits (not enforced at backend level)
- **Caching:** No caching implemented (always fetches fresh data from PayFast)
- **Logging:** Console logs for debugging (can be disabled in production)

---

## Security Notes

- ✅ No sensitive data exposed in response
- ✅ Uses configured PayFast merchant credentials
- ✅ HTTPS to PayFast (in production)
- ✅ No direct PayFast API keys in response
- ✅ Error messages don't leak sensitive information

---

## Date Format

**Required Format:** `YYYY-MM-DD`

**Examples:**
- `2025-11-29` ✅ Correct
- `11-29-2025` ❌ Wrong format
- `2025/11/29` ❌ Wrong format
- `29-11-2025` ❌ Wrong format

---

## Summary

| Feature | Status |
|---------|--------|
| Endpoint Created | ✅ |
| Route Added | ✅ |
| Documentation | ✅ |
| Error Handling | ✅ |
| Logging | ✅ |
| Testing | ✅ |
| Production Ready | ✅ |
| No Existing Code Disturbed | ✅ |

---

**Date Created:** 2025-11-29
**API Version:** 1.0
**Status:** Active and Ready for Use
