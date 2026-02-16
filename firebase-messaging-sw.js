// firebase-messaging-sw.js
// Service Worker untuk Push Notification Background

importScripts('https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.6.1/firebase-messaging-compat.js');

// Konfigurasi Firebase
firebase.initializeApp({
    apiKey: "AIzaSyCahZIFKFXMCokFNxCpFokNSVtKzN4llus",
    authDomain: "cedar-setup-425414-d7.firebaseapp.com",
    projectId: "cedar-setup-425414-d7",
    storageBucket: "cedar-setup-425414-d7.firebasestorage.app",
    messagingSenderId: "723545991983",
    appId: "1:723545991983:web:379548d2b425a502a60fda"
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
    console.log('[SW] Background message received:', payload);

    const notificationTitle = payload.notification?.title || 'BGT-PRO';
    const notificationBody = payload.notification?.body || 'Ada notifikasi baru!';
    const notificationIcon = '/512B.png';

    const notificationOptions = {
        body: notificationBody,
        icon: notificationIcon,
        badge: '/512B.png',
        vibrate: [200, 100, 200],
        tag: 'bgt-notification',
        requireInteraction: true,
        actions: [
            { action: 'open', title: 'Buka Aplikasi' },
            { action: 'close', title: 'Tutup' }
        ]
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
    console.log('[SW] Notification clicked:', event.action);
    
    event.notification.close();

    if (event.action === 'close') {
        return;
    }

    // Open app when clicked
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                // If app is already open, focus it
                for (const client of clientList) {
                    if (client.url.includes('branda.html') && 'focus' in client) {
                        return client.focus();
                    }
                }
                // Otherwise open new window
                if (clients.openWindow) {
                    return clients.openWindow('/branda.html');
                }
            })
    );
});
