# Callit Backend - MongoDB Database Schema

## Overview
This document describes the MongoDB collections and their structure used in the Callit Backend for event ticket management and payment processing.

---

## Collections

### 1. **Orders Collection**
Stores ticket purchase orders for events.

**Collection Name:** `orders`

**Schema:**
```javascript
{
  _id: ObjectId,                    // MongoDB auto-generated ID
  orderId: String,                  // Unique order identifier (e.g., "ORD-1764343908818-500")
  userName: String,                 // Customer name
  userPhone: String,                // Customer phone number
  ticketsPurchased: [
    {
      eventDay: Number,             // Day of the event (1, 2, 3, etc.)
      ticketType: String,           // Type of ticket (VIP, Regular, Student, etc.)
      quantity: Number,             // Number of tickets of this type
      names: [String],              // Names of ticket holders
      price: Number,                // Price per ticket
      _id: ObjectId                 // Sub-document ID
    }
  ],
  totalAmount: Number,              // Total amount to be paid
  paymentStatus: String,            // Status: "pending", "paid", "canceled", "failed"
  provider: String,                 // Payment provider (default: "PayFast")
  dateCreated: Date,                // Order creation timestamp
  __v: Number                       // Mongoose version key
}
```

**Indexes:**
- `orderId` (unique)

**Sample Document:**
```json
{
  "_id": "6929c0646d54fd745439df3e",
  "orderId": "ORD-1764343908818-500",
  "userName": "Ahmed Ali",
  "userPhone": "+27123456789",
  "ticketsPurchased": [
    {
      "eventDay": 1,
      "ticketType": "VIP",
      "quantity": 2,
      "names": ["John Doe", "Jane Smith"],
      "price": 375,
      "_id": "6929c0646d54fd745439df3f"
    }
  ],
  "totalAmount": 750,
  "paymentStatus": "pending",
  "provider": "PayFast",
  "dateCreated": "2025-11-28T15:31:48.826Z",
  "__v": 0
}
```

---

### 2. **PaymentRecords Collection**
Stores payment transaction records and callbacks from PayFast.

**Collection Name:** `paymentrecords`

**Schema:**
```javascript
{
  _id: ObjectId,                    // MongoDB auto-generated ID
  orderId: String,                  // Reference to Order (required)
  payfastResponse: Object,          // Full PayFast API response
  signatureVerified: Boolean,       // Whether PayFast signature was valid
  transactionTime: Date             // When the payment was processed
}
```

**Sample Document:**
```json
{
  "_id": "6929c0646d54fd745439df50",
  "orderId": "ORD-1764343908818-500",
  "payfastResponse": {
    "m_payment_id": "ORD-1764343908818-500",
    "pf_payment_id": "1234567890",
    "payment_status": "COMPLETE",
    "item_name": "Goonj Event Tickets",
    "amount_gross": "750.00",
    "amount_fee": "15.75",
    "amount_net": "734.25",
    "name_first": "Ahmed",
    "email_address": "ahmed@example.com",
    "merchant_id": "243483",
    "signature": "test_signature"
  },
  "signatureVerified": true,
  "transactionTime": "2025-11-28T15:35:00.000Z"
}
```

---

### 3. **EventTicketTypes Collection**
Stores available ticket types and pricing for events.

**Collection Name:** `eventtickettypes`

**Schema:**
```javascript
{
  _id: ObjectId,                    // MongoDB auto-generated ID
  eventDay: Number,                 // Day of the event
  ticketType: String,               // Type of ticket (VIP, Regular, etc.)
  price: Number                     // Price of this ticket type
}
```

**Sample Document:**
```json
{
  "_id": "6929c0646d54fd745439df60",
  "eventDay": 1,
  "ticketType": "VIP",
  "price": 375
}
```

---

## Database Connection

**Database Name:** `callit_db`

**Connection String:**
```
mongodb://admin:password123@localhost:27017/callit_db?authSource=admin
```

**Credentials:**
- Username: `admin`
- Password: `password123`
- Auth Database: `admin`

---

## Data Relationships

```
Orders (1) -----> (Many) PaymentRecords
  ↓
  └─> ticketsPurchased references EventTicketTypes
```

### Relationships:
- **Orders → PaymentRecords**: One order can have multiple payment attempts
- **Orders → EventTicketTypes**: Order references ticket types by eventDay and ticketType

---

## Indexes

### Orders Collection
```javascript
db.orders.createIndex({ orderId: 1 }, { unique: true })
```

### PaymentRecords Collection
```javascript
db.paymentrecords.createIndex({ orderId: 1 })
db.paymentrecords.createIndex({ transactionTime: 1 })
```

---

## Common Queries

### Get all orders
```javascript
db.orders.find({})
```

### Find order by orderId
```javascript
db.orders.findOne({ orderId: "ORD-1764343908818-500" })
```

### Find pending orders
```javascript
db.orders.find({ paymentStatus: "pending" })
```

### Find paid orders
```javascript
db.orders.find({ paymentStatus: "paid" })
```

### Get payment records for an order
```javascript
db.paymentrecords.find({ orderId: "ORD-1764343908818-500" })
```

### Find all ticket types for a specific day
```javascript
db.eventtickettypes.find({ eventDay: 1 })
```

### Get total revenue from paid orders
```javascript
db.orders.aggregate([
  { $match: { paymentStatus: "paid" } },
  { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" } } }
])
```

### Get orders by date range
```javascript
db.orders.find({
  dateCreated: {
    $gte: ISODate("2025-11-01"),
    $lte: ISODate("2025-11-30")
  }
})
```

---

## Migration Notes

If you had data from your office laptop's MongoDB:

1. **Export from office laptop:**
   ```bash
   mongodump --out=/path/to/backup
   ```

2. **Import to local Docker MongoDB:**
   ```bash
   mongorestore --uri="mongodb://admin:password123@localhost:27017/callit_db?authSource=admin" /path/to/backup
   ```

---

## Maintenance

### Backup Local Data
```bash
docker exec callit_mongodb mongodump --username admin --password password123 --authenticationDatabase admin --out=/data/backup
```

### Access MongoDB Shell
```bash
docker exec -it callit_mongodb mongosh -u admin -p password123 --authenticationDatabase admin
```

### Drop all collections (CAUTION!)
```bash
docker exec -it callit_mongodb mongosh -u admin -p password123 --authenticationDatabase admin --eval "db.dropDatabase()"
```

---

## Data Validation Rules

### Orders
- `orderId`: Must be unique, auto-generated
- `userName`: Required, string
- `userPhone`: Required, string format
- `totalAmount`: Required, positive number
- `ticketsPurchased`: Required, array of valid ticket objects
- `paymentStatus`: Enum: ["pending", "paid", "canceled", "failed"]

### PaymentRecords
- `orderId`: Required, must reference existing order
- `payfastResponse`: Required, object from PayFast API
- `signatureVerified`: Boolean, default false

### EventTicketTypes
- `eventDay`: Required, positive integer
- `ticketType`: Required, string
- `price`: Required, positive number
