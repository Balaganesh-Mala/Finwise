/* eslint-disable no-restricted-globals */
self.addEventListener('push', function(event) {
    if (event.data) {
        const data = event.data.json();
        const options = {
            body: data.notification.body,
            icon: data.notification.icon || '/logo.jpeg',
            badge: '/logo.jpeg',
            data: {
                url: data.notification.data.url
            },
            vibrate: [100, 50, 100],
            actions: [
                { action: 'open', title: 'Join Now' }
            ]
        };

        event.waitUntil(
            self.registration.showNotification(data.notification.title, options)
        );
    }
});

self.addEventListener('notificationclick', function(event) {
    event.notification.close();

    const urlToOpen = event.notification.data.url;

    event.waitUntil(
        // eslint-disable-next-line no-undef
        clients.matchAll({
            type: 'window',
            includeUncontrolled: true
        }).then(function(windowClients) {
            // Check if there is already a window open and focus it
            for (let i = 0; i < windowClients.length; i++) {
                let client = windowClients[i];
                if (client.url === urlToOpen && 'focus' in client) {
                    return client.focus();
                }
            }
            // If not, open a new window
            // eslint-disable-next-line no-undef
            if (clients.openWindow) {
                // eslint-disable-next-line no-undef
                return clients.openWindow(urlToOpen);
            }
        })
    );
});
