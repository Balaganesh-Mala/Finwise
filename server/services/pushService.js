const webpush = require('web-push');
const PushSubscription = require('../models/PushSubscription');
const dotenv = require('dotenv');

dotenv.config();

// Configure web-push
webpush.setVapidDetails(
    process.env.VAPID_EMAIL || 'mailto:info@finwisecareers.com',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
);

/**
 * Send a push notification to a specific student's registered devices
 * @param {string} studentId - The ID of the student
 * @param {Object} payload - Notification data (title, body, icon, url)
 */
const sendPushToStudent = async (studentId, payload) => {
    try {
        const subscriptions = await PushSubscription.find({ studentId });
        
        if (!subscriptions || subscriptions.length === 0) {
            // console.log(`No push subscriptions found for student: ${studentId}`);
            return;
        }

        const notificationPayload = JSON.stringify({
            notification: {
                title: payload.title || 'Notification from Finwise',
                body: payload.body || '',
                icon: payload.icon || '/logo192.png',
                data: {
                    url: payload.url || '/'
                }
            }
        });

        const pushPromises = subscriptions.map(async (sub) => {
            try {
                await webpush.sendNotification(sub.subscription, notificationPayload);
            } catch (error) {
                // If subscription has expired or is invalid, remove it
                if (error.statusCode === 404 || error.statusCode === 410) {
                    // console.log(`Subscription expired for student ${studentId}. Removing...`);
                    await PushSubscription.deleteOne({ _id: sub._id });
                } else {
                    console.error(`Error sending push to student ${studentId}:`, error);
                }
            }
        });

        await Promise.all(pushPromises);
    } catch (error) {
        console.error('Error in sendPushToStudent service:', error);
    }
};

module.exports = {
    sendPushToStudent
};
