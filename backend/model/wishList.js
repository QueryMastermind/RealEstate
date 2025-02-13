import mongoose from 'mongoose';

const wishlistSchema = new mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    }, // Reference to the User model
    property: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Property', 
        required: true 
    }, // Reference to the Property model
    addedAt: { 
        type: Date, 
        default: Date.now 
    } // Timestamp for when the property was added to the wishlist
});

export default mongoose.model('Wishlist', wishlistSchema);