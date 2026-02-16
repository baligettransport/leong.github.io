// ============================================
// firebase-messaging-sw.js
// Service Worker untuk Push Notification Background
// ============================================

importScripts('https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.6.1/firebase-messaging-compat.js');

// ============================================
// KONFIGURASI FIREBASE
// ============================================
firebase.initializeApp({
    apiKey: "AIzaSyCahZIFKFXMCokFNxCpFokNSVtKzN4llus",
    authDomain: "cedar-setup-425414-d7.firebaseapp.com",
    projectId: "cedar-setup-425414-d7",
    storageBucket: "cedar-setup-425414-d7.firebasestorage.app",
    messagingSenderId: "723545991983",
    appId: "1:723545991983:web:379548d2b425a502a60fda"
});

const messaging = firebase.messaging();

// ============================================
// BACKGROUND MESSAGE HANDLER
// ============================================
messaging.onBackgroundMessage((payload) => {
    console.log('[SW] 📬 Background message received:', payload);

    const data = payload.data || {};
    const notification = payload.notification || {};

    const title = data.title || notification.title || 'BGT-PRO';
    const body = data.body || notification.body || 'Ada notifikasi baru!';
    const icon = data.icon || './512B.png';
    const image = data.image || notification.image || null;
    const clickUrl = data.click_url || data.url || './branda.html';
    const tag = data.tag || 'bgt-notification';

    const options = {
        body: body,
        icon: icon,
        badge: './512B.png',
        image: image,
        vibrate: [200, 100, 200, 100, 200],
        tag: tag + '-' + Date.now(),
        renotify: true,
        requireInteraction: true,
        silent: false,
        data: {
            click_url: clickUrl,
            timestamp: Date.now()
        },
        actions: [
            { 
                action: 'open', 
                title: '📝 Buka Aplikasi'
            },
            { 
                action: 'close', 
                title: '❌ Tutup'
            }
        ]
    };

    return self.registration.showNotification(title, options);
});

// ============================================
// NOTIFICATION CLICK HANDLER
// ============================================
self.addEventListener('notificationclick', (event) => {
    console.log('[SW] 👆 Notification clicked:', event.action);
    
    event.notification.close();

    if (event.action === 'close') {
        return;
    }

    const clickUrl = event.notification.data?.click_url || './branda.html';

    event.waitUntil(
        clients.matchAll({ 
            type: 'window', 
            includeUncontrolled: true 
        })
        .then((clientList) => {
            for (const client of clientList) {
                if ('focus' in client) {
                    client.postMessage({
                        type: 'NOTIFICATION_CLICKED',
                        url: clickUrl
                    });
                    return client.focus();
                }
            }
            
            if (clients.openWindow) {
                return clients.openWindow(clickUrl);
            }
        })
    );
});

// ============================================
// PUSH EVENT HANDLER (Fallback)
// ============================================
self.addEventListener('push', (event) => {
    console.log('[SW] 📨 Push event received');
    
    if (!event.data) {
        console.log('[SW] No data in push event');
        return;
    }

    try {
        const payload = event.data.json();
        console.log('[SW] Push payload:', payload);
        
        if (payload.data || payload.notification) {
            return;
        }
        
        const title = 'BGT-PRO';
        const options = {
            body: 'Anda memiliki notifikasi baru',
            icon: './512B.png',
            badge: './512B.png',
            vibrate: [200, 100, 200]
        };
        
        event.waitUntil(
            self.registration.showNotification(title, options)
        );
        
    } catch (error) {
        console.error('[SW] Error parsing push data:', error);
    }
});

// ============================================
// SERVICE WORKER LIFECYCLE
// ============================================
self.addEventListener('install', (event) => {
    console.log('[SW] ✅ Service Worker installing...');
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    console.log('[SW] ✅ Service Worker activating...');
    event.waitUntil(clients.claim());
});

// ============================================
// MESSAGE FROM CLIENT
// ============================================
self.addEventListener('message', (event) => {
    console.log('[SW] 📩 Message from client:', event.data);
    
    if (event.data && event.data.type === 'TEST_NOTIFICATION') {
        const { title, body } = event.data;
        self.registration.showNotification(title || 'Test', {
            body: body || 'Test notification',
            icon: './512B.png',
            badge: './512B.png',
            vibrate: [200, 100, 200]
        });
    }
});

console.log('[SW] 🚀 Service Worker loaded');
