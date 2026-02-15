// firebase-messaging-sw.js
// Service Worker untuk Firebase Cloud Messaging - Notifikasi Background

importScripts('https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.6.1/firebase-messaging-compat.js');

// Firebase Config
firebase.initializeApp({
    apiKey: "AIzaSyCahZIFKFXMCokFNxCpFokNSVtKzN4llus",
    authDomain: "cedar-setup-425414-d7.firebaseapp.com",
    databaseURL: "https://cedar-setup-425414-d7-default-rtdb.firebaseio.com",
    projectId: "cedar-setup-425414-d7",
    storageBucket: "cedar-setup-425414-d7.firebasestorage.app",
    messagingSenderId: "723545991983",
    appId: "1:723545991983:web:379548d2b425a502a60fda"
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
    console.log('📬 Background message received:', payload);

    const title = payload.notification?.title || 'BGT-PRO';
    const body = payload.notification?.body || 'Ada notifikasi baru!';
    const icon = '512B.png';
    const badge = '512B.png';

    const options = {
        body: body,
        icon: icon,
        badge: badge,
        vibrate: [200, 100, 200],
        tag: 'bgt-notification',
        requireInteraction: true,
        actions: [
            {
                action: 'open',
                title: 'Buka'
            },
            {
                action: 'close',
                title: 'Tutup'
            }
        ]
    };

    self.registration.showNotification(title, options);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
    console.log('Notification clicked:', event);

    event.notification.close();

    if (event.action === 'open' || !event.action) {
        // Open the app
        event.waitUntil(
            clients.openWindow('/branda.html')
        );
    }
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
    console.log('Notification closed:', event);
});