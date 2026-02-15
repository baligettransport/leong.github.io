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

// ============================================
// HANDLE BACKGROUND MESSAGES
// ============================================
messaging.onBackgroundMessage((payload) => {
    console.log('📬 Background message received:', payload);

    const title = payload.notification?.title || 'BGT-PRO';
    const body = payload.notification?.body || 'Ada notifikasi baru!';
    const icon = payload.notification?.icon || '512B.png';
    const badge = payload.notification?.badge || '512B.png';
    const image = payload.notification?.image || '';
    const type = payload.data?.type || 'general';
    const url = payload.data?.url || '/branda.html';

    // Opsi notifikasi
    const options = {
        body: body,
        icon: icon,
        badge: badge,
        image: image,
        vibrate: [200, 100, 200, 100, 200], // Pola getar
        tag: `bgt-${type}-${Date.now()}`, // Tag unik agar tidak replace
        renotify: true, // Notifikasi ulang jika ada tag sama
        requireInteraction: true, // Tetap sampai user klik
        timestamp: Date.now(),
        
        // Aksi tombol
        actions: [
            {
                action: 'open',
                title: '🔍 Buka',
                icon: '/icons/open.png'
            },
            {
                action: 'dismiss',
                title: '✓ Tutup'
            }
        ],
        
        // Data tambahan
        data: {
            url: url,
            type: type,
            timestamp: Date.now()
        }
    };

    // Tampilkan notifikasi
    self.registration.showNotification(title, options);
    
    // Log untuk debugging
    console.log('📬 Notification shown:', { title, body, type });
});

// ============================================
// HANDLE NOTIFICATION CLICK
// ============================================
self.addEventListener('notificationclick', (event) => {
    console.log('📱 Notification clicked:', event);

    // Tutup notifikasi
    event.notification.close();

    const action = event.action;
    const data = event.notification.data || {};
    const url = data.url || '/branda.html';

    if (action === 'dismiss') {
        // User klik tutup
        console.log('User dismissed notification');
        return;
    }

    // Buka atau fokus ke app
    event.waitUntil(
        clients.matchAll({ 
            type: 'window', 
            includeUncontrolled: true 
        }).then((clientList) => {
            // Cari window yang sudah terbuka
            for (const client of clientList) {
                if (client.url.includes('branda.html') || client.url.includes(self.location.origin)) {
                    // Fokus ke window yang ada
                    return client.focus().then(() => {
                        // Kirim pesan ke window untuk refresh data
                        client.postMessage({
                            type: 'NOTIFICATION_CLICKED',
                            data: data
                        });
                    });
                }
            }
            
            // Tidak ada window yang terbuka, buka baru
            return clients.openWindow(url);
        })
    );
});

// ============================================
// HANDLE NOTIFICATION CLOSE
// ============================================
self.addEventListener('notificationclose', (event) => {
    console.log('📱 Notification closed:', event);
    
    // Log analytics jika perlu
    const data = event.notification.data || {};
    console.log('Notification dismissed:', {
        type: data.type,
        timestamp: data.timestamp
    });
});

// ============================================
// HANDLE PUSH EVENTS (Fallback)
// ============================================
self.addEventListener('push', (event) => {
    console.log('📬 Push event received:', event);
    
    if (!event.data) {
        console.log('Push event has no data');
        return;
    }

    try {
        const data = event.data.json();
        console.log('Push data:', data);
        
        // Jika tidak ada notification, buat default
        if (!data.notification) {
            const title = 'BGT-PRO';
            const options = {
                body: 'Ada notifikasi baru!',
                icon: '512B.png',
                badge: '512B.png',
                vibrate: [200, 100, 200],
                tag: 'bgt-notification',
                requireInteraction: true
            };
            
            event.waitUntil(
                self.registration.showNotification(title, options)
            );
        }
    } catch (e) {
        console.error('Error parsing push data:', e);
    }
});

// ============================================
// SERVICE WORKER INSTALL
// ============================================
self.addEventListener('install', (event) => {
    console.log('✅ Service Worker installed');
    self.skipWaiting(); // Aktifkan segera
});

// ============================================
// SERVICE WORKER ACTIVATE
// ============================================
self.addEventListener('activate', (event) => {
    console.log('✅ Service Worker activated');
    
    event.waitUntil(
        clients.claim() // Ambil kontrol semua clients
    );
});

// ============================================
// MESSAGE FROM CLIENT
// ============================================
self.addEventListener('message', (event) => {
    console.log('📩 Message from client:', event.data);
    
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
