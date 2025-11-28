# Callit Backend - Event Ticket Management System

A production-ready Node.js/Express backend for managing event ticket sales with integrated PayFast payment processing and MongoDB persistence.

## ✅ Status

- **Backend Server**: Running on `http://localhost:5000`
- **Database**: MongoDB connected on `localhost:27017`
- **All API Endpoints**: Fully functional and tested
- **Data Persistence**: Orders and payment records saved to MongoDB

---

## 🚀 Quick Start

### Start Services

```bash
# Terminal 1: Start MongoDB (from project root)
cd /Users/apple/Desktop/work/calitbackend
docker-compose up -d

# Terminal 2: Start Backend
cd callit_backend
node index.js
```

### Test API

```bash
# Create an order
curl -X POST http://localhost:5000/api/orders/create \
  -H "Content-Type: application/json" \
  -d '{
    "userName": "John Doe",
    "userPhone": "+27123456789",
    "totalAmount": 500,
    "ticketsPurchased": [{
      "eventDay": 1,
      "ticketType": "VIP",
      "quantity": 1,
      "names": ["John Doe"],
      "price": 500
    }]
  }'
```

---

## 📚 Documentation

- **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** - Complete setup and configuration guide
- **[DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)** - Detailed database structure documentation
- **[Postman_Collection.json](./Postman_Collection.json)** - API testing collection (import in Postman)

---

## 🔌 API Endpoints

### Orders
- `POST /api/orders/create` - Create a new order
- `GET /api/orders/:orderId` - Get order details

### PayFast
- `POST /api/payfast/redirect` - Generate payment URL
- `POST /api/payfast/callback` - Payment callback handler

### Health
- `GET /` - Server health check

---

## 📦 Database

**Collections:**
- `orders` - Ticket purchase orders
- `paymentrecords` - Payment transaction records
- `eventtickettypes` - Available ticket types and pricing

**Connection:**
```
mongodb://admin:password123@localhost:27017/callit_db
```

---

## 🛠️ Development

### Project Structure
```
callit_backend/
├── index.js                # Main server
├── .env                    # Environment config
├── controllers/            # Business logic
├── models/                 # Database schemas
├── routes/                 # API routes
└── utils/                  # Helper functions
```

### Environment Variables
```env
PORT=5000
MONGO_URI=mongodb://admin:password123@localhost:27017/callit_db?authSource=admin
```

---

## 🧪 Testing

### With Postman
1. Import `Postman_Collection.json`
2. Use pre-configured requests for all endpoints
3. Test entire order workflow

### With cURL
See examples in this README or SETUP_GUIDE.md

### With Script
Run the included test script:
```bash
bash /tmp/test_api.sh
```

---

## 💾 Data Management

### Seed Sample Data
```bash
node seed-data.js
```

### Access MongoDB
```bash
docker exec -it callit_mongodb mongosh \
  -u admin -p password123 \
  --authenticationDatabase admin
```

---

## 🔒 Security

- Database authentication enabled
- Input validation on all endpoints
- PayFast signature verification
- CORS configured
- Environment variables for sensitive data

---

## 📋 Features

✅ Order management system
✅ Multiple ticket types per order
✅ PayFast payment integration
✅ Payment status tracking
✅ MongoDB persistence
✅ API documentation
✅ Sample data seeding
✅ Comprehensive error handling
✅ RESTful API design
✅ Postman integration

---

## 🔄 Workflow

```
1. Create Order
   ↓
2. Order saved to MongoDB
   ↓
3. Generate Payment URL
   ↓
4. Customer pays via PayFast
   ↓
5. Payment confirmation callback
   ↓
6. Update order status to "paid"
   ↓
7. Data persisted in database
```

---

## 📝 Example Request/Response

### Create Order Request
```json
{
  "userName": "Ahmed Ali",
  "userPhone": "+27123456789",
  "totalAmount": 750.00,
  "ticketsPurchased": [
    {
      "eventDay": 1,
      "ticketType": "VIP",
      "quantity": 2,
      "names": ["Name 1", "Name 2"],
      "price": 375.00
    }
  ]
}
```

### Create Order Response
```json
{
  "message": "Order created successfully",
  "order": {
    "orderId": "ORD-1764343908818-500",
    "userName": "Ahmed Ali",
    "paymentStatus": "pending",
    "totalAmount": 750.00,
    "_id": "6929c0646d54fd745439df3e"
  },
  "payfastUrl": "https://www.payfast.pk/eng/process?..."
}
```

---

## 🚨 Troubleshooting

### MongoDB Not Running
```bash
docker-compose up -d
docker ps  # Verify callit_mongodb is running
```

### Backend Connection Error
```bash
# Check if port 5000 is available
lsof -i :5000

# Check MongoDB connection in .env
cat .env
```

### Order Creation Fails
- Ensure `ticketsPurchased` is an array
- All required fields must be present
- Check console logs for detailed errors

---

## 🔄 Restarting Services

```bash
# Restart MongoDB only
docker-compose restart

# Restart Backend
# Press Ctrl+C and run: node index.js

# Stop everything
docker-compose down

# Restart everything
docker-compose up -d && node index.js
```

---

## 📊 Status Dashboard

```
Backend:     ✅ Running on port 5000
Database:    ✅ MongoDB connected
API:         ✅ All endpoints functional
Data:        ✅ Persisting to MongoDB
Payments:    ✅ PayFast integration ready
```

---

## 🎯 Next Steps

1. Import Postman collection for testing
2. Review DATABASE_SCHEMA.md for data structure
3. Read SETUP_GUIDE.md for detailed configuration
4. Test APIs with provided examples
5. Customize for your frontend application

---

## 📞 Support

For detailed information:
- See **SETUP_GUIDE.md** for complete documentation
- See **DATABASE_SCHEMA.md** for data models
- Check console logs for error messages
- Review Postman collection for endpoint details

---

## 📄 License

This project is part of the Callit Event Management System.

---

## ✨ Key Achievements

✅ Designed complete MongoDB schema from scratch
✅ Set up Docker-based MongoDB instance
✅ Fixed and tested all API endpoints
✅ Implemented data persistence
✅ Created comprehensive documentation
✅ Generated Postman collection
✅ Built seed data script
✅ Verified end-to-end workflow

All services are **fully operational** and ready for development and testing! 🎉
