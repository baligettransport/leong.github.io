// ============================================
// sw.js
// Service Worker Utama (Gabungan Location + Notifikasi)
// ============================================

// 1. Konfigurasi Cache
const CACHE_NAME = 'bgt-pro-cache-v1';
// PERBAIKAN: Path disesuaikan dengan manifest.json
const urlsToCache = [
    '/leong.github.io/',
    '/leong.github.io/index.html',
    '/leong.github.io/branda.html',
    '/leong.github.io/pengaturan.html',
    '/leong.github.io/manifest.json',
    '/leong.github.io/512B.png'
];

// Event Install
self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Opened cache');
                return Promise.all(
                    urlsToCache.map(url => {
                        return fetch(url).then(response => {
                            if (response.ok) return cache.put(url, response);
                        }).catch(err => console.log('Gagal cache: ' + url));
                    })
                );
            })
    );
});

// Event Activate
self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim()); // Penting untuk background tracking
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Event Fetch
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                return response || fetch(event.request);
            })
    );
});

// ============================================
// 2. Integrasi Firebase Messaging
// ============================================

importScripts('https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.6.1/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "AIzaSyCahZIFKFXMCokFNxCpFokNSVtKzN4llus",
    authDomain: "cedar-setup-425414-d7.firebaseapp.com",
    projectId: "cedar-setup-425414-d7",
    storageBucket: "cedar-setup-425414-d7.firebasestorage.app",
    messagingSenderId: "723545991983",
    appId: "1:723545991983:web:379548d2b425a502a60fda"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('[SW] Background message:', payload);

    const data = payload.data || {};
    const notification = payload.notification || {};

    const title = data.title || notification.title || 'BGT-PRO';
    const body = data.body || notification.body || 'Ada notifikasi baru!';
    
    // PERBAIKAN: Path ikon disamakan dengan manifest
    const icon = '/leong.github.io/512B.png'; 
    const clickUrl = data.click_url || '/leong.github.io/branda.html';

    const options = {
        body: body,
        icon: icon,
        badge: icon,
        vibrate: [200, 100, 200],
        tag: 'bgt-notification',
        requireInteraction: true,
        data: { click_url: clickUrl }
    };

    return self.registration.showNotification(title, options);
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const clickUrl = event.notification.data?.click_url || '/leong.github.io/branda.html';
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                for (const client of client) {
                    if ('focus' in client) return client.focus();
                }
                if (clients.openWindow) return clients.openWindow(clickUrl);
            })
    );
});
