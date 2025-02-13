import Property from '../model/property.js'; // Import the Property model
import User from '../model/user.js'; // Import the User model
import cloudinary from '../config/cloudinary.js';

// Create a Property (Seller)
export const createProperty = async (req, res) => {
    try {
        const { 
            name, type, address, size, bedrooms, bathrooms, price, 
            managementCompany, managementFee, leaseTerms, maintenanceSchedule, 
            serviceContracts, financialReports, contactInfo 
        } = req.body;
        const sellerId = req.user.id;

        // Check user role
        const user = await User.findById(sellerId);
        if (!user || user.role !== 'seller') {
            return res.status(403).json({ message: 'Only sellers can create properties' });
        }

        // Upload images to Cloudinary
        let uploadedImages = [];
        try {
            const files = req.files;
            if (!files || files.length === 0) {
                return res.status(400).json({ message: 'At least one image is required' });
            }

            uploadedImages = await Promise.all(
                files.map(async (file) => {
                    try {
                        const result = await cloudinary.uploader.upload(
                            `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
                            { folder: 'properties' }
                        );
                        return { url: result.secure_url, public_id: result.public_id };
                    } catch (err) {
                        console.error(`Failed to upload image: ${file.originalname}`, err);
                        return null;
                    }
                })
            );

            // Filter out any failed uploads
            uploadedImages = uploadedImages.filter((img) => img !== null);
            if (uploadedImages.length === 0) {
                return res.status(500).json({ message: 'Error uploading images' });
            }
        } catch (err) {
            console.error('Error handling image uploads:', err);
            return res.status(500).json({ message: 'Image upload failed' });
        }

        // Create new property
        try {
            const newProperty = new Property({
                name, type, address, size, bedrooms, bathrooms, price,
                status: 'Pending',
                seller: sellerId,
                managementCompany, managementFee, leaseTerms, maintenanceSchedule,
                serviceContracts, financialReports, contactInfo,
                pictures: uploadedImages
            });

            await newProperty.save();
            res.status(201).json({ message: 'Property created successfully', property: newProperty });
        } catch (err) {
            console.error('Error saving property:', err);
            return res.status(500).json({ message: 'Error saving property' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error creating property', error: error.message });
    }
};


// Approve a Property (Admin)
export const approveProperty = async (req, res) => {
    try {
        const { id } = req.params; // Property ID
        const adminId = req.user.id; // Admin ID from authenticated user

        // Check if the user is an admin
        const user = await User.findById(adminId);
        if (user.role !== 'admin') {
            return res.status(403).json({ message: 'Only admins can approve properties' });
        }

        // Find the property and update its status to "Approved"
        const property = await Property.findByIdAndUpdate(
            id,
            { status: 'Approved' },
            { new: true }
        );

        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }

        res.status(200).json({ message: 'Property approved successfully', property });
    } catch (error) {
        res.status(500).json({ message: 'Error approving property', error: error.message });
    }
};

// Delete a Property (Admin or Seller)
export const deleteProperty = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const user = await User.findById(userId);

        const property = await Property.findById(id);
        if (!property) return res.status(404).json({ message: 'Property not found' });

        // Authorization check
        if (user.role !== 'admin' && property.seller.toString() !== userId) {
            return res.status(403).json({ message: 'Unauthorized to delete this property' });
        }

        // Delete images from Cloudinary
        if (property.pictures.length > 0) {
            await Promise.all(
                property.pictures.map(async (image) => {
                    try {
                        if (image?.public_id) {
                            await cloudinary.uploader.destroy(image.public_id);
                        }
                    } catch (err) {
                        console.error(`Failed to delete image: ${image?.public_id}`, err);
                    }
                })
            );
        }

        // Forcefully delete the property even if images fail to delete
        await Property.findByIdAndDelete(id);
        res.status(200).json({ message: 'Property deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting property', error: error.message });
    }
};


// Update a Property (Seller)
export const updateProperty = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const updates = req.body;
        const files = req.files;

        const property = await Property.findById(id);
        if (!property) return res.status(404).json({ message: 'Property not found' });

        // Authorization check
        if (property.seller.toString() !== userId) {
            return res.status(403).json({ message: 'Unauthorized to update this property' });
        }

        // Handle image updates safely
        if (files && files.length > 0) {
            try {
                // Delete old images
                if (property.pictures.length > 0) {
                    await Promise.all(
                        property.pictures.map(async (image) => {
                            try {
                                if (image?.public_id) {
                                    await cloudinary.uploader.destroy(image.public_id);
                                }
                            } catch (err) {
                                console.error(`Failed to delete image: ${image?.public_id}`, err);
                            }
                        })
                    );
                }

                // Upload new images
                const uploadedImages = await Promise.all(
                    files.map(async (file) => {
                        try {
                            const result = await cloudinary.uploader.upload(
                                `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
                                { folder: 'properties' }
                            );
                            return { url: result.secure_url, public_id: result.public_id };
                        } catch (err) {
                            console.error(`Failed to upload image: ${file.originalname}`, err);
                            return null;
                        }
                    })
                );

                // Filter out any failed uploads
                updates.pictures = uploadedImages.filter((img) => img !== null);
            } catch (err) {
                console.error('Error handling image updates:', err);
            }
        }

        // Update property
        const updatedProperty = await Property.findByIdAndUpdate(
            id,
            { ...updates, updatedAt: Date.now() },
            { new: true }
        );

        res.status(200).json({ message: 'Property updated successfully', property: updatedProperty });
    } catch (error) {
        res.status(500).json({ message: 'Error updating property', error: error.message });
    }
};


// Get All Properties with Filtering, Sorting, and Pagination (Buyer, Seller, Admin)
export const getPropertys = async (req, res) => {
    try {
        // Extract query parameters
        const { 
            page = 1, 
            limit = 10, 
            sortBy = 'createdAt', 
            sortOrder = 'desc', 
            minPrice, 
            maxPrice, 
            type, 
            bedrooms, 
            bathrooms, 
            status,
            city, // Filter by city
            state, // Filter by state
            country, // Filter by country
            minSize, // Filter by minimum size
            maxSize // Filter by maximum size
        } = req.query;

        // Build the filter object
        const filter = {};
        if (minPrice) filter.price = { $gte: Number(minPrice) };
        if (maxPrice) filter.price = { ...filter.price, $lte: Number(maxPrice) };
        if (type) filter.type = type;
        if (bedrooms) filter.bedrooms = { $gte: Number(bedrooms) };
        if (bathrooms) filter.bathrooms = { $gte: Number(bathrooms) };
        if (status) filter.status = status;
        if (city) filter['address.city'] = city; // Filter by city
        if (state) filter['address.state'] = state; // Filter by state
        if (country) filter['address.country'] = country; // Filter by country
        if (minSize) filter.size = { $gte: Number(minSize) };
        if (maxSize) filter.size = { ...filter.size, $lte: Number(maxSize) };

        // Build the sort object
        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

        // Calculate pagination
        const skip = (page - 1) * limit;

        // Fetch properties with filtering, sorting, and pagination
        const properties = await Property.find(filter)
            .populate('seller', 'name email') // Populate seller details
            .sort(sort)
            .skip(skip)
            .limit(Number(limit));

        // Get the total count of properties (for pagination)
        const totalProperties = await Property.countDocuments(filter);

        // Format the response for the frontend landing page
        const formattedProperties = properties.map(property => ({
            _id: property._id,
            name: property.name,
            price: property.price,
            location: `${property.address.city}, ${property.address.state}, ${property.address.country}`,
            type: property.type,
            bedrooms: property.bedrooms,
            bathrooms: property.bathrooms,
            size: property.size,
            images: property.pictures, // Array of image URLs
            status: property.status
        }));

        res.status(200).json({
            totalProperties,
            currentPage: page,
            totalPages: Math.ceil(totalProperties / limit),
            properties: formattedProperties
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching properties', error: error.message });
    }
};

// Get Property by ID (Buyer, Seller, Admin)
export const getPropertyById = async (req, res) => {
    try {
        const { id } = req.params; // Property ID
        const property = await Property.findById(id).populate('seller', 'name email'); // Populate seller details

        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }

        res.status(200).json({ property });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching property', error: error.message });
    }
};