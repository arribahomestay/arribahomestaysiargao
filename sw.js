// Service Worker for Arriba Homestay PWA
const CACHE_NAME = 'arriba-homestay-v1.0.3';
const urlsToCache = [
  '/',
  '/index.html',
  '/about.html',
  '/rooms.html',
  '/gallery.html',
  '/booking.html',
  '/admin.html',
  '/css/main.css',
  '/css/home.css',
  '/css/about.css',
  '/css/rooms.css',
  '/css/gallery.css',
  '/css/booking.css',
  '/css/admin.css',
  '/css/admin-mobile.css',
  '/css/calendar.css',
  '/css/loading-screen.css',
  '/js/main.js',
  '/js/home.js',
  '/js/about.js',
  '/js/about-carousel.js',
  '/js/rooms.js',
  '/js/gallery.js',
  '/js/booking.js',
  '/js/booking-calendar.js',
  '/js/admin.js',
  '/js/notifications.js',
  '/js/firebase-auth.js',
  '/js/loading-screen.js',
  '/images/logo.png',
  '/images/hero.png',
  '/images/gallery/1.jpg',
  '/images/gallery/2.jpg',
  '/images/gallery/3.jpg',
  '/images/gallery/4.jpg',
  '/images/gallery/5.jpg',
  '/images/gallery/6.jpg',
  '/images/gallery/7.jpg',
  '/images/gallery/8.jpg',
  '/images/gallery/9.jpg'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching files');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('Service Worker: Installation complete');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Installation failed', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker: Activation complete');
      return self.clients.claim();
    })
  );
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        if (response) {
          console.log('Service Worker: Serving from cache', event.request.url);
          return response;
        }
        
        console.log('Service Worker: Fetching from network', event.request.url);
        return fetch(event.request).then((response) => {
          // Check if we received a valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });

          return response;
        }).catch(() => {
          // Return offline page for navigation requests
          if (event.request.destination === 'document') {
            return caches.match('/index.html');
          }
        });
      })
  );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync', event.tag);
  
  if (event.tag === 'booking-sync') {
    event.waitUntil(syncBookings());
  }
});

// Push notification event
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'New update from Arriba Homestay!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View Rooms',
        icon: '/icons/checkmark.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/xmark.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Arriba Homestay', options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked');
  
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/rooms.html')
    );
  } else if (event.action === 'close') {
    // Just close the notification
  } else {
    // Default action - open the app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Helper function for syncing bookings
async function syncBookings() {
  try {
    // Get offline bookings from IndexedDB
    const offlineBookings = await getOfflineBookings();
    
    for (const booking of offlineBookings) {
      try {
        // Try to sync each booking
        await fetch('/api/bookings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(booking)
        });
        
        // Remove from offline storage if successful
        await removeOfflineBooking(booking.id);
        console.log('Service Worker: Booking synced successfully', booking.id);
      } catch (error) {
        console.error('Service Worker: Failed to sync booking', booking.id, error);
      }
    }
  } catch (error) {
    console.error('Service Worker: Background sync failed', error);
  }
}

// Helper functions for offline storage (simplified)
async function getOfflineBookings() {
  // This would typically use IndexedDB
  // For now, return empty array
  return [];
}

async function removeOfflineBooking(bookingId) {
  // This would typically use IndexedDB
  // For now, just log
  console.log('Service Worker: Removing offline booking', bookingId);
}
