import express from 'express';
import { addToWishlist, removeFromWishlist, getWishlist } from '../controllers/wishListController.js';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// Add a property to the wishlist (Buyer)
router.post('/add/:propertyId', authenticateToken, authorizeRoles('buyer'), addToWishlist);

// Remove a property from the wishlist (Buyer)
router.delete('/delete/:propertyId', authenticateToken, authorizeRoles('buyer'), removeFromWishlist);

// Get the user's wishlist (Buyer)
router.get('/get', authenticateToken, authorizeRoles('buyer'), getWishlist);

export default router;