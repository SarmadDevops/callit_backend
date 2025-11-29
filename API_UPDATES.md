# API Updates - Get All Orders Endpoint

## New Endpoint Added

### GET /api/orders
**Description:** Retrieve all orders with pagination support and optional filtering

**Method:** GET

**Base URL:** http://localhost:5000

**Endpoint:** `/api/orders`

**Query Parameters:**
- `page` (optional, default: 1) - Page number for pagination
- `limit` (optional, default: 10) - Number of orders per page
- `paymentStatus` (optional) - Filter by payment status (pending|paid|canceled|failed)

**Example Requests:**

1. Get first page with 10 orders per page:
```
GET http://localhost:5000/api/orders?page=1&limit=10
```

2. Get all paid orders:
```
GET http://localhost:5000/api/orders?paymentStatus=paid
```

3. Get pending orders with custom limit:
```
GET http://localhost:5000/api/orders?page=1&limit=20&paymentStatus=pending
```

**Response Format:**
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
      "orderId": "ORD-1764415913847-001",
      "userName": "Ahmed Ali",
      "userPhone": "+27123456789",
      "ticketsPurchased": [...],
      "totalAmount": 1000,
      "paymentStatus": "paid",
      "provider": "PayFast",
      "dateCreated": "2025-11-29T11:31:53.851Z",
      "updatedAt": "2025-11-29T11:31:53.851Z"
    }
  ]
}
```

**Pagination Info Included:**
- `currentPage` - Current page number
- `limit` - Number of orders per page
- `total` - Total number of orders matching the filter
- `totalPages` - Total number of pages
- `hasNextPage` - Boolean indicating if there's a next page
- `hasPrevPage` - Boolean indicating if there's a previous page

## Testing in Postman

The updated `Postman_Collection_Latest.json` includes the new endpoint:
- Import the collection in Postman
- Navigate to "Orders" → "Get All Orders (with Pagination)"
- Use the query parameters to test different scenarios

## Existing Endpoints (No Changes)

All existing endpoints continue to work as before:

1. **POST /api/orders/create** - Create new order
2. **GET /api/orders/:orderId** - Get order by ID
3. **PayFast endpoints** - All payment-related endpoints unchanged

## Implementation Details

**File Changes:**
1. `controllers/OrderController.js` - Added `getAllOrders` function
2. `routes/OrderRoutes.js` - Added new route with proper ordering
3. `Postman_Collection_Latest.json` - Updated with new endpoint

**Key Features:**
- ✅ Pagination support with configurable page and limit
- ✅ Optional filtering by payment status
- ✅ Sorted by newest first (dateCreated: -1)
- ✅ Returns comprehensive pagination metadata
- ✅ No disruption to existing endpoints
- ✅ Error handling with meaningful messages

## Migration Notes

- The GET /api/orders endpoint was added BEFORE the GET /api/orders/:orderId route in the Express router
- This is intentional to avoid conflict where `:orderId` would catch any request path
- Order of routes ensures pagination endpoint is matched first
