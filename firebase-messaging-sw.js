// ============================================
// firebase-messaging-sw.js
// Service Worker untuk Push Notification
// ============================================

importScripts('https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.6.1/firebase-messaging-compat.js');

// Firebase Config
firebase.initializeApp({
    apiKey: "AIzaSyCahZIFKFXMCokFNxCpFokNSVtKzN4llus",
    authDomain: "cedar-setup-425414-d7.firebaseapp.com",
    projectId: "cedar-setup-425414-d7",
    storageBucket: "cedar-setup-425414-d7.firebasestorage.app",
    messagingSenderId: "723545991983",
    appId: "1:723545991983:web:379548d2b425a502a60fda"
});

const messaging = firebase.messaging();

// Background Message Handler
messaging.onBackgroundMessage((payload) => {
    console.log('[SW] Background message:', payload);

    const data = payload.data || {};
    const notification = payload.notification || {};

    const title = data.title || notification.title || 'BGT-PRO';
    const body = data.body || notification.body || 'Ada notifikasi baru!';
    
    // PERBAIKAN: Gunakan path relatif atau URL absolut yang pasti ada
    const icon = '512B.png'; 
    const clickUrl = data.click_url || 'branda.html';

    const options = {
        body: body,
        icon: icon,
        badge: '512B.png', // Badge kecil untuk status bar
        vibrate: [200, 100, 200],
        tag: 'bgt-notification', // Agar notifikasi lama terganti dengan baru
        requireInteraction: true, // Notifikasi tidak langsung hilang
        data: { click_url: clickUrl }
    };

    return self.registration.showNotification(title, options);
});

// Notification Click Handler
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    const clickUrl = event.notification.data?.click_url || 'branda.html';
    
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                // Jika ada window yang terbuka, fokuskan
                for (const client of clientList) {
                    if ('focus' in client) return client.focus();
                }
                // Jika tidak, buka window baru
                if (clients.openWindow) return clients.openWindow(clickUrl);
            })
    );
});

// Service Worker Lifecycle
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(clients.claim()));

