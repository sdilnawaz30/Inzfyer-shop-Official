import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { orderId } = req.body;

  if (!orderId) {
    return res.status(400).json({ message: 'Missing order_id' });
  }

  const appId = process.env.VITE_CASHFREE_APP_ID;
  const secretKey = process.env.CASHFREE_SECRET_KEY;
  const env = process.env.CASHFREE_ENVIRONMENT || 'SANDBOX';
  
  const baseUrl = env === 'PRODUCTION' 
    ? 'https://api.cashfree.com/pg' 
    : 'https://sandbox.cashfree.com/pg';

  try {
    const response = await axios.get(
      `${baseUrl}/orders/${orderId}/payments`,
      {
        headers: {
          'x-client-id': appId,
          'x-client-secret': secretKey,
          'x-api-version': '2023-08-01',
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    );

    // The response is an array of payments for this order
    const payments = response.data;
    
    // Find if there's any SUCCESS payment
    const successfulPayment = payments.find(p => p.payment_status === 'SUCCESS');

    if (successfulPayment) {
      res.status(200).json({
        success: true,
        payment: successfulPayment,
        message: 'Payment verified successfully'
      });
    } else {
      // Find latest pending or failed status
      const latestPayment = payments[payments.length - 1];
      res.status(200).json({
        success: false,
        payment: latestPayment,
        message: 'Payment not successful'
      });
    }

  } catch (error) {
    console.error('Error verifying Cashfree payment:', error.response?.data || error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to verify payment',
      error: error.response?.data || error.message
    });
  }
}
