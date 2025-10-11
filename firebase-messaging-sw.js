// Firebase Cloud Messaging Service Worker
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDdF5kC7-fLx-KbPN-oj7bzef6ZzuR4FkU",
    authDomain: "arribahomestay-7f961.firebaseapp.com",
    projectId: "arribahomestay-7f961",
    storageBucket: "arribahomestay-7f961.firebasestorage.app",
    messagingSenderId: "614486684423",
    appId: "1:614486684423:web:5eaed45cbca3b41cf9cba2",
    measurementId: "G-2GDZFPQ5X5"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase Cloud Messaging
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
    console.log('Received background message:', payload);
    
    const notificationTitle = payload.notification?.title || 'ARRIBA HOMESTAY';
    const notificationOptions = {
        body: payload.notification?.body || 'You have a new notification',
        icon: '/images/logo.png',
        badge: '/images/logo.png',
        tag: 'booking-notification',
        requireInteraction: true,
        actions: [
            {
                action: 'view',
                title: 'View Booking',
                icon: '/images/logo.png'
            },
            {
                action: 'dismiss',
                title: 'Dismiss',
                icon: '/images/logo.png'
            }
        ],
        data: payload.data
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
    console.log('Notification clicked:', event);
    
    event.notification.close();
    
    if (event.action === 'view') {
        // Open admin dashboard
        event.waitUntil(
            clients.openWindow('/admin.html')
        );
    } else if (event.action === 'dismiss') {
        // Just close the notification
        return;
    } else {
        // Default action - open admin dashboard
        event.waitUntil(
            clients.openWindow('/admin.html')
        );
    }
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
    console.log('Notification closed:', event);
});
