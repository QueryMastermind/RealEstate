import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  razorpayOrderId: { type: String, required: true }, // Razorpay order ID
  paymentId: { type: String }, // Razorpay payment ID (captured after success)
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  property: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Property', 
    required: true 
  },
  amount: { type: Number, required: true }, // Total amount paid by buyer
  adminMargin: { type: Number, required: true }, // Admin fee (e.g., 5% of property price)
  status: { 
    type: String, 
    enum: ['created', 'paid', 'failed'], 
    default: 'created' 
  },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Order', orderSchema);