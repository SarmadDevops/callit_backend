/**
 * FRONTEND EXAMPLE - PayFast Payment Integration
 * This shows how your React/Vue/HTML frontend should interact with the backend
 */

// ============================================
// STEP 1: CREATE ORDER
// ============================================

async function createOrder(ticketData) {
  try {
    const response = await fetch('http://localhost:5000/api/orders/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userName: ticketData.name,
        userPhone: ticketData.phone,
        totalAmount: ticketData.totalPrice,
        ticketsPurchased: ticketData.tickets, // Array of {eventDay, ticketType, quantity, names, price}
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create order');
    }

    const order = await response.json();
    console.log('✅ Order created:', order);

    return order.orderId; // Save this ID for next step
  } catch (error) {
    console.error('❌ Error creating order:', error);
    return null;
  }
}

// ============================================
// STEP 2: INITIATE PAYMENT
// ============================================

async function initiatePayment(orderId) {
  try {
    const response = await fetch(
      `http://localhost:5000/api/orders/${orderId}/initiate-payment`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to initiate payment');
    }

    const paymentData = await response.json();
    console.log('✅ Payment initiated:', paymentData);

    // IMPORTANT: Redirect user to PayFast payment page
    // PayFast handles card collection securely
    return paymentData.payfastUrl;
  } catch (error) {
    console.error('❌ Error initiating payment:', error);
    return null;
  }
}

// ============================================
// STEP 3: CHECK PAYMENT STATUS
// ============================================

async function checkPaymentStatus(orderId) {
  try {
    const response = await fetch(
      `http://localhost:5000/api/payfast/${orderId}/status`
    );

    if (!response.ok) {
      throw new Error('Failed to check status');
    }

    const status = await response.json();
    console.log('Payment status:', status);

    return status.paymentStatus; // "paid", "pending", "canceled", "failed"
  } catch (error) {
    console.error('❌ Error checking payment status:', error);
    return null;
  }
}

// ============================================
// FULL FLOW - How to use all functions
// ============================================

async function completePaymentFlow(ticketData) {
  console.log('Starting payment flow...');

  // Step 1: Create order
  const orderId = await createOrder(ticketData);
  if (!orderId) {
    console.error('Could not create order');
    return;
  }

  // Step 2: Get PayFast payment URL
  const payfastUrl = await initiatePayment(orderId);
  if (!payfastUrl) {
    console.error('Could not initiate payment');
    return;
  }

  // Step 3: Redirect user to PayFast
  console.log('Redirecting to PayFast...');
  window.location.href = payfastUrl;

  // After user completes payment, they return to PAYFAST_RETURN_URL
  // That page should check payment status
}

// ============================================
// POLL FOR PAYMENT CONFIRMATION (After Return)
// ============================================

function pollPaymentStatus(orderId, maxAttempts = 30) {
  let attempts = 0;

  const interval = setInterval(async () => {
    attempts++;
    console.log(`Checking payment status (attempt ${attempts}/${maxAttempts})...`);

    const status = await checkPaymentStatus(orderId);

    if (status === 'paid') {
      console.log('✅ Payment successful!');
      clearInterval(interval);
      showSuccessMessage();
      // Redirect to order confirmation page
      window.location.href = '/order-confirmation?orderId=' + orderId;
    } else if (status === 'canceled' || status === 'failed') {
      console.log('❌ Payment failed or canceled');
      clearInterval(interval);
      showErrorMessage(status);
    } else if (attempts >= maxAttempts) {
      console.log('⏱️ Timeout waiting for payment confirmation');
      clearInterval(interval);
      showTimeoutMessage();
    }
  }, 2000); // Check every 2 seconds
}

// ============================================
// REACT EXAMPLE
// ============================================

/*
import React, { useState, useEffect } from 'react';

function PaymentPage() {
  const [orderId, setOrderId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [ticketData, setTicketData] = useState({
    name: 'Ali Khan',
    phone: '+923001234567',
    totalPrice: 5000,
    tickets: [
      {
        eventDay: 1,
        ticketType: 'General',
        quantity: 2,
        names: ['Ali Khan', 'Sara Khan'],
        price: 2500,
      },
    ],
  });

  const handlePayment = async () => {
    setLoading(true);

    // Step 1: Create order
    const order = await createOrder(ticketData);
    if (order) {
      setOrderId(order);

      // Step 2: Initiate payment
      const payfastUrl = await initiatePayment(order);
      if (payfastUrl) {
        // Step 3: Redirect to PayFast
        window.location.href = payfastUrl;
      }
    }

    setLoading(false);
  };

  // Check payment status when user returns
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const returnedOrderId = params.get('orderId');

    if (returnedOrderId) {
      pollPaymentStatus(returnedOrderId);
    }
  }, []);

  return (
    <div>
      <h1>Complete Your Payment</h1>
      <button onClick={handlePayment} disabled={loading}>
        {loading ? 'Processing...' : 'Pay Now'}
      </button>
    </div>
  );
}

export default PaymentPage;
*/

// ============================================
// HTML/VANILLA JS EXAMPLE
// ============================================

/*
<!DOCTYPE html>
<html>
<head>
  <title>Payment</title>
</head>
<body>
  <h1>Complete Your Payment</h1>
  <button onclick="handlePayment()">Pay Now</button>

  <script>
    async function handlePayment() {
      const ticketData = {
        name: 'Ali Khan',
        phone: '+923001234567',
        totalPrice: 5000,
        tickets: [...]
      };

      const orderId = await createOrder(ticketData);
      const payfastUrl = await initiatePayment(orderId);
      window.location.href = payfastUrl;
    }

    // After user returns from PayFast
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get('orderId');
    if (orderId) {
      pollPaymentStatus(orderId);
    }
  </script>
</body>
</html>
*/

// ============================================
// HELPER FUNCTIONS
// ============================================

function showSuccessMessage() {
  alert('✅ Payment successful!');
  // Update UI, show order confirmation, etc.
}

function showErrorMessage(reason) {
  alert(`❌ Payment ${reason}`);
  // Show error UI, allow user to retry
}

function showTimeoutMessage() {
  alert('⏱️ Timeout checking payment. Please check your order status manually.');
  // Show manual check option
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    createOrder,
    initiatePayment,
    checkPaymentStatus,
    completePaymentFlow,
    pollPaymentStatus,
  };
}
