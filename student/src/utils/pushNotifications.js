import axios from 'axios';

const VAPID_PUBLIC_KEY = "BNQIIfmzXBYCXRUSAIOqVqg5CpX-TUH4ExSLbMgVJkBnYYpBNdqQi7-ZMEvliGSFr1nqn9-qC5SGz9jlGCO8PAI";

/**
 * Utility to convert base64 to Uint8Array for VAPID key
 */
function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

/**
 * Register Service Worker and subscribe to push
 */
export const subscribeToPush = async (studentId) => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        console.warn('Push notifications are not supported in this browser');
        return;
    }

    try {
        // 1. Register Service Worker
        const registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/'
        });

        // 2. Wait for it to be active
        await navigator.serviceWorker.ready;

        // 3. Request Permission
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
            // console.log('Notification permission denied');
            return;
        }

        // 4. Subscribe
        const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
        });

        // 5. Send to Server
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        await axios.post(`${API_URL}/api/notifications/subscribe`, {
            studentId,
            subscription,
            deviceType: navigator.userAgent
        });

        // console.log('Push subscription successful');
    } catch (error) {
        console.error('Error during push subscription:', error);
    }
};
