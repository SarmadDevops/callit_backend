# Postman Collection Guide - v2.1

## Import Instructions

1. Open Postman
2. Click **Import** button (top-left corner)
3. Select the file: `Postman_Collection_v2.1.json`
4. Collection will be imported with all endpoints ready to test

## Collection Overview

**Total Endpoints:** 13

### 1. Health Check
- **GET** `/` - Verify backend is running

### 2. Orders (5 Endpoints - NEW PAGINATION ADDED)
- **POST** `/api/orders/create` - Create new order
- **GET** `/api/orders` - Get all orders with pagination (NEW)
- **GET** `/api/orders?paymentStatus=pending` - Get pending orders (NEW)
- **GET** `/api/orders?paymentStatus=paid` - Get paid orders (NEW)
- **GET** `/api/orders?paymentStatus=failed` - Get failed orders (NEW)
- **GET** `/api/orders/:orderId` - Get single order by ID

### 3. PayFast Payment Flow (2 Endpoints)
- **POST** `/api/payfast/get-token` - Get access token
- **POST** `/api/payfast/initialize` - Initialize payment

### 4. PayFast Legacy Support (1 Endpoint)
- **POST** `/api/payfast/redirect` - Backward compatible endpoint

### 5. PayFast Payment Management (5 Endpoints)
- **GET** `/api/payfast/status/:orderId` - Check payment status
- **GET** `/api/payfast/list` - Get all payments
- **POST** `/api/payfast/retry` - Retry failed payment
- **DELETE** `/api/payfast/cancel/:orderId` - Cancel payment
- **POST** `/api/payfast/callback` - Payment callback (IPN)

## Testing the New Endpoints

### Test 1: Get All Orders (No Filter)
```
GET http://localhost:5000/api/orders?page=1&limit=10
```
**Expected Response:** All orders with pagination info

### Test 2: Get Pending Orders Only
```
GET http://localhost:5000/api/orders?page=1&limit=10&paymentStatus=pending
```
**Expected Response:** Only pending orders

### Test 3: Get Paid Orders Only
```
GET http://localhost:5000/api/orders?page=1&limit=10&paymentStatus=paid
```
**Expected Response:** Only paid orders

### Test 4: Custom Pagination
```
GET http://localhost:5000/api/orders?page=2&limit=5
```
**Expected Response:** 5 orders from page 2

## Query Parameters Reference

### For GET /api/orders endpoint:

| Parameter | Type | Default | Required | Description |
|-----------|------|---------|----------|-------------|
| page | Integer | 1 | No | Page number for pagination |
| limit | Integer | 10 | No | Orders per page (max recommended: 50) |
| paymentStatus | String | - | No | Filter by status: pending\|paid\|failed\|canceled |

## Response Format

### Success Response (200)
```json
{
  "message": "Orders fetched successfully",
  "pagination": {
    "currentPage": 1,
    "limit": 10,
    "total": 4,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPrevPage": false
  },
  "orders": [
    {
      "_id": "...",
      "orderId": "ORD-xxx",
      "userName": "Customer Name",
      "userPhone": "+xxx",
      "ticketsPurchased": [...],
      "totalAmount": 1000,
      "paymentStatus": "pending",
      "dateCreated": "2025-11-29T..."
    }
  ]
}
```

## Tips for Using Postman

1. **Store Order IDs:** Copy the `orderId` from create order response and paste in other requests
2. **Use Variables:** Set `{{orderId}}` and `{{access_token}}` variables for reuse
3. **Test Flow:**
   - Create Order → Copy orderId
   - Get specific order with that ID
   - Get all orders to verify pagination
   - Filter by status to confirm filtering works
4. **Pagination Testing:**
   - Try different page numbers
   - Try different limit values
   - Observe hasNextPage and hasPrevPage flags

## Collection Versions

- **v2.0.0** - Initial collection with PayFast integration
- **v2.1.0** - Added Get All Orders with pagination (CURRENT)

## Files in Project

- `Postman_Collection_v2.1.json` - Latest collection (IMPORT THIS)
- `Postman_Collection_Latest.json` - Previous version
- `Postman_Collection.json` - Original version

**Recommendation:** Always use the latest version (v2.1)
