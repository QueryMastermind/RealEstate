import Wishlist from '../model/wishList.js';
import Property from '../model/property.js';

// Add a property to the wishlist
export const addToWishlist = async (req, res) => {
    try {
        const { propertyId } = req.params;
        const userId = req.user.id; // User ID from authenticated user

        // Check if the property exists
        const property = await Property.findById(propertyId);
        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }

        // Check if the property is already in the user's wishlist
        const existingWishlistItem = await Wishlist.findOne({ user: userId, property: propertyId });
        if (existingWishlistItem) {
            return res.status(400).json({ message: 'Property already in wishlist' });
        }

        // Add the property to the wishlist
        const newWishlistItem = new Wishlist({
            user: userId,
            property: propertyId
        });

        await newWishlistItem.save();

        res.status(201).json({ message: 'Property added to wishlist', wishlistItem: newWishlistItem });
    } catch (error) {
        res.status(500).json({ message: 'Error adding to wishlist', error: error.message });
    }
};

// Remove a property from the wishlist
export const removeFromWishlist = async (req, res) => {
    try {
        const { propertyId } = req.params;
        const userId = req.user.id; // User ID from authenticated user

        // Find and delete the wishlist item
        const deletedWishlistItem = await Wishlist.findOneAndDelete({ user: userId, property: propertyId });

        if (!deletedWishlistItem) {
            return res.status(404).json({ message: 'Property not found in wishlist' });
        }

        res.status(200).json({ message: 'Property removed from wishlist', wishlistItem: deletedWishlistItem });
    } catch (error) {
        res.status(500).json({ message: 'Error removing from wishlist', error: error.message });
    }
};

// Get the user's wishlist
export const getWishlist = async (req, res) => {
    try {
        const userId = req.user.id; // User ID from authenticated user

        // Fetch the user's wishlist with populated property details
        const wishlist = await Wishlist.find({ user: userId })
            .populate({
                path: 'property',
                select: 'name images price address type bedrooms bathrooms size status' // Select only essential fields
            });

        res.status(200).json({ wishlist });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching wishlist', error: error.message });
    }
};