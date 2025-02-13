import express from 'express';
import {createProperty, approveProperty, deleteProperty, updateProperty,getPropertys,getPropertyById} from '../controllers/property.controller.js';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware.js';
import upload from '../config/multer.js';

const router = express.Router();

// Create a Property (Seller)
router.post('/addProperty', authenticateToken, authorizeRoles('seller'),upload.array('pictures'), createProperty);

// Approve a Property (Admin)
router.patch('/approveProperty/:id', authenticateToken, authorizeRoles('admin'), approveProperty);

// Delete a Property (Admin or Seller)
router.delete('/deleteProperty/:id', authenticateToken, authorizeRoles('admin', 'seller'), deleteProperty);

// Update a Property (Seller)
router.put('/updateProperty/:id', authenticateToken, authorizeRoles('seller'),upload.array('pictures'), updateProperty);

router.get('/getProperty', getPropertys);
router.get('/getProperty/:id', getPropertyById);

export default router;
