import express from 'express';
import { createOrder, verifyPayment, getOrders, getOrderById } from '../controllers/paymentController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/create-order', authenticateToken, createOrder); // Create Razorpay order
router.post('/verify-payment', authenticateToken, verifyPayment); // Verify payment webhook
router.get('/', authenticateToken, getOrders); // Get all orders for a user
router.get('/:id', authenticateToken, getOrderById); // Get order by ID

export default router;