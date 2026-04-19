const mongoose = require('mongoose');

const pushSubscriptionSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true,
        index: true
    },
    subscription: {
        endpoint: { type: String, required: true },
        expirationTime: { type: Number, default: null },
        keys: {
            p256dh: { type: String, required: true },
            auth: { type: String, required: true }
        }
    },
    deviceType: {
        type: String, // e.g., "Chrome on Windows", "Safari on iOS"
        default: 'unknown'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// A student can have multiple devices/subscriptions
pushSubscriptionSchema.index({ studentId: 1, 'subscription.endpoint': 1 }, { unique: true });

module.exports = mongoose.model('PushSubscription', pushSubscriptionSchema);
