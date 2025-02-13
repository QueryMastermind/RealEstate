import Order from '../model/orderModel.js';
import Property from '../model/property.js';
import razorpayInstance from '../config/razorpay.js';
import {calculateAdminMargin} from '../utils/calAdminMargin.js';

export const createOrder = async (req, res) => {
  try {
    const { propertyId } = req.body;
    const userId = req.user.id;

    // Fetch property details
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Calculate admin margin (e.g., 5% of property price)
    const adminMargin = calculateAdminMargin(property.price)
    const totalAmount = property.price + adminMargin;

    // Create Razorpay order
    const razorpayOrder = await razorpayInstance.orders.create({
      amount: totalAmount * 100, // Razorpay expects amount in paise (INR)
      currency: 'INR',
      receipt: `order_${Date.now()}`,
    });

    // Save order to database
    const order = new Order({
      razorpayOrderId: razorpayOrder.id,
      user: userId,
      property: propertyId,
      amount: totalAmount,
      adminMargin,
    });
    await order.save();

    res.status(201).json({
      message: 'Order created',
      order: razorpayOrder,
      key: process.env.RAZORPAY_KEY_ID, // Frontend needs this to initialize Razorpay
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating order', error: error.message });
  }
};

export const verifyPayment = async (req, res) => {
    try {
      const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;
  
      // Verify the signature
      const generatedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');
  
      if (generatedSignature !== razorpay_signature) {
        return res.status(400).json({ message: 'Invalid signature' });
      }
  
      // Update order status in database
      const order = await Order.findOneAndUpdate(
        { razorpayOrderId: razorpay_order_id },
        { 
          paymentId: razorpay_payment_id,
          status: 'paid',
        },
        { new: true }
      );
  
      // Send confirmation email to user (optional)
      // ...
  
      res.status(200).json({ message: 'Payment verified successfully', order });
    } catch (error) {
      res.status(500).json({ message: 'Error verifying payment', error: error.message });
    }
  };

  export const getOrders = async (req, res) => {
    try {
      const userId = req.user.id;
      const orders = await Order.find({ user: userId })
        .populate('property', 'name price')
        .populate('user', 'name email');
  
      res.status(200).json({ orders });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching orders', error: error.message });
    }
  };
  
  export const getOrderById = async (req, res) => {
    try {
      const { id } = req.params;
      const order = await Order.findById(id)
        .populate('property', 'name price')
        .populate('user', 'name email');
  
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
  
      res.status(200).json({ order });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching order', error: error.message });
    }
  };