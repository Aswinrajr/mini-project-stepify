const Razorpay = require('razorpay');

// Create a new instance of Razorpay
const razorpay = new Razorpay({
  key_id:process.env.RAZORPAY_ID_KEY,
  key_secret:process.env.RAZORPAY_SECRET_KEY
})

exports.createOrder = async (req, res) => {
  try {
    const { totalAmount } = req.body;
    console.log("Welcome to razorpay create order",totalAmount)

    const order = await razorpay.orders.create({
      amount: totalAmount * 100,
      currency: 'INR'
    });

    res.json(order);
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { paymentId } = req.body;
    console.log("Welcome to razorpay verify order",paymentId)

    const payment = await razorpay.payments.fetch(paymentId);
    console.log("Welcome to razorpay verify order",payment)

    if (payment.status === 'captured') {
      // Payment is successful, update order status or perform other actions
      res.json({ status: 'success' });
    } else {
      // Payment failed or not captured, handle accordingly
      res.status(400).json({ status: 'failure' });
    }
  } catch (error) {
    console.error('Error verifying Razorpay payment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
