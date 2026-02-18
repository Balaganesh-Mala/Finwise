const Review = require('../models/Review');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');

// Helper: Upload to cloud
const uploadToCloudinary = async (filePath, folder) => {
    try {
        const result = await cloudinary.uploader.upload(filePath, {
            folder: folder,
            resource_type: 'image',
            use_filename: true,
            unique_filename: true
        });
        fs.unlinkSync(filePath);
        return result;
    } catch (err) {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        throw err;
    }
};

// @desc    Get all reviews
// @route   GET /api/reviews
// @access  Public (can filter by approved)
exports.getReviews = async (req, res, next) => {
    try {
        let query;
        const reqQuery = { ...req.query };
        const removeFields = ['select', 'sort', 'page', 'limit'];
        removeFields.forEach(param => delete reqQuery[param]);

        let queryStr = JSON.stringify(reqQuery);
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

        query = Review.find(JSON.parse(queryStr));

        if (req.query.sort) {
            const sortBy = req.query.sort.split(',').join(' ');
            query = query.sort(sortBy);
        } else {
            query = query.sort('-createdAt');
        }

        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 100;
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const total = await Review.countDocuments();

        query = query.skip(startIndex).limit(limit);
        const reviews = await query;

        const pagination = {};
        if (endIndex < total) {
            pagination.next = { page: page + 1, limit };
        }
        if (startIndex > 0) {
            pagination.prev = { page: page - 1, limit };
        }

        res.status(200).json({
            success: true,
            count: reviews.length,
            pagination,
            data: reviews
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Get single review
// @route   GET /api/reviews/:id
// @access  Public
exports.getReview = async (req, res, next) => {
    try {
        const review = await Review.findById(req.params.id);
        if (!review) {
            return res.status(404).json({ success: false, error: 'Review not found' });
        }
        res.status(200).json({ success: true, data: review });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Create new review
// @route   POST /api/reviews
// @access  Private (Admin)
exports.createReview = async (req, res, next) => {
    try {
        let reviewData = { ...req.body };

        if (req.file) {
            try {
                const result = await uploadToCloudinary(req.file.path, 'reviews');
                reviewData.studentImage = result.secure_url;
                reviewData.imagePublicId = result.public_id;
            } catch (err) {
                console.error("Cloudinary Upload Error:", err);
                return res.status(500).json({ success: false, error: 'Image upload failed' });
            }
        }

        const review = await Review.create(reviewData);

        res.status(201).json({
            success: true,
            data: review
        });
    } catch (err) {
        console.error(err);
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(val => val.message);
            return res.status(400).json({ success: false, error: messages });
        }
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private (Admin)
exports.updateReview = async (req, res, next) => {
    try {
        let review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({ success: false, error: 'Review not found' });
        }

        let reviewData = { ...req.body };

        if (req.file) {
            // Delete old image if exists
            if (review.imagePublicId) {
                try {
                    await cloudinary.uploader.destroy(review.imagePublicId);
                } catch (err) {
                    console.error("Cloudinary Delete Error:", err);
                }
            }

            // Upload new image
            try {
                const result = await uploadToCloudinary(req.file.path, 'reviews');
                reviewData.studentImage = result.secure_url;
                reviewData.imagePublicId = result.public_id;
            } catch (err) {
                return res.status(500).json({ success: false, error: 'Image upload failed' });
            }
        }

        review = await Review.findByIdAndUpdate(req.params.id, reviewData, {
            new: true,
            runValidators: true
        });

        res.status(200).json({ success: true, data: review });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private (Admin)
exports.deleteReview = async (req, res, next) => {
    try {
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({ success: false, error: 'Review not found' });
        }

        if (review.imagePublicId) {
            try {
                await cloudinary.uploader.destroy(review.imagePublicId);
            } catch (err) {
                console.error("Cloudinary Delete Error:", err);
            }
        }

        await review.deleteOne();

        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
