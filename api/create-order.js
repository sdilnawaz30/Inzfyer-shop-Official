import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { orderAmount, customerDetails, orderId } = req.body;

  if (!orderAmount || !customerDetails) {
    return res.status(400).json({ message: 'Missing required parameters' });
  }

  const appId = process.env.VITE_CASHFREE_APP_ID;
  const secretKey = process.env.CASHFREE_SECRET_KEY;
  const env = process.env.CASHFREE_ENVIRONMENT || 'SANDBOX';
  
  const baseUrl = env === 'PRODUCTION' 
    ? 'https://api.cashfree.com/pg' 
    : 'https://sandbox.cashfree.com/pg';

  try {
    const response = await axios.post(
      `${baseUrl}/orders`,
      {
        order_amount: orderAmount,
        order_currency: 'INR',
        order_id: orderId || `ORD_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        customer_details: {
          customer_id: `CUST_${Date.now()}`,
          customer_name: customerDetails.name,
          customer_email: customerDetails.email || 'guest@inzfyer.com',
          customer_phone: customerDetails.phone,
        },
        order_meta: {
          // You could pass a return URL here if using seamless mode, but we will use the JS SDK which handles redirects internally in the modal
        }
      },
      {
        headers: {
          'x-client-id': appId,
          'x-client-secret': secretKey,
          'x-api-version': '2023-08-01', // Use the latest supported API version
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    );

    res.status(200).json({
      success: true,
      payment_session_id: response.data.payment_session_id,
      order_id: response.data.order_id
    });
  } catch (error) {
    console.error('Error creating Cashfree order:', error.response?.data || error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create payment session',
      error: error.response?.data || error.message
    });
  }
}
