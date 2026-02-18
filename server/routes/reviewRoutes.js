const express = require('express');
const multer = require('multer');
const {
    getReviews,
    getReview,
    createReview,
    updateReview,
    deleteReview
} = require('../controllers/reviewController');

const router = express.Router();

// Configure Multer
const upload = multer({ 
    dest: 'uploads/',
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Routes
router
    .route('/')
    .get(getReviews)
    .post(upload.single('studentImage'), createReview);

router
    .route('/:id')
    .get(getReview)
    .put(upload.single('studentImage'), updateReview)
    .delete(deleteReview);

module.exports = router;
