// Notification Management System

class NotificationManager {
    constructor() {
        this.isSupported = 'Notification' in window;
        this.permission = this.isSupported ? Notification.permission : 'denied';
        this.messaging = null;
        this.token = null;
    }

    // Initialize notifications
    async initialize() {
        if (!this.isSupported) {
            console.log('Notifications not supported');
            return false;
        }

        try {
            // Register service worker
            const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
            console.log('Service Worker registered:', registration);

            // Initialize Firebase Messaging
            if (window.messaging) {
                this.messaging = window.messaging;
                try {
                    await this.setupMessaging();
                } catch (error) {
                    console.log('Messaging setup failed (permission may be blocked):', error.message);
                    // Continue without messaging if permission is blocked
                }
            }

            return true;
        } catch (error) {
            console.error('Error initializing notifications:', error);
            return false;
        }
    }

    // Setup Firebase Messaging
    async setupMessaging() {
        try {
            // Check notification permission first
            if (Notification.permission === 'denied' || Notification.permission === 'default') {
                console.log('Notification permission not granted, skipping messaging setup');
                return;
            }
            
            // Get FCM token
            this.token = await window.getToken(this.messaging, {
                vapidKey: 'BJEO1q8EhzZBXVIX1HvPUoNIVL_uyayQbtKdBsw1eM_g9fVaYLotN59Wsp1ePWtrdai5FL0KT9zM3JqKuDsN914'
            });

            if (this.token) {
                console.log('FCM Token:', this.token);
                // Store token for sending notifications
                localStorage.setItem('fcmToken', this.token);
                
                // Listen for foreground messages
                window.onMessage(this.messaging, (payload) => {
                    console.log('Foreground message received:', payload);
                    this.showInAppNotification(payload);
                });
            } else {
                console.log('No FCM token available - permission may be blocked');
            }
        } catch (error) {
            console.error('Error setting up messaging:', error);
            // Don't throw error for permission issues
            if (error.code === 'messaging/permission-blocked' || 
                error.code === 'messaging/permission-denied') {
                console.log('Notification permission blocked or denied, skipping messaging setup');
                return;
            }
            // For other errors, log but don't throw to prevent app crashes
            console.log('Messaging setup failed, continuing without push notifications');
            return;
        }
    }

    // Request notification permission
    async requestPermission() {
        if (!this.isSupported) {
            return 'denied';
        }

        try {
            const permission = await Notification.requestPermission();
            this.permission = permission;
            
            if (permission === 'granted') {
                console.log('Notification permission granted');
                await this.initialize();
                return 'granted';
            } else {
                console.log('Notification permission denied');
                return 'denied';
            }
        } catch (error) {
            console.error('Error requesting permission:', error);
            return 'denied';
        }
    }

    // Show in-app notification
    showInAppNotification(payload) {
        const notification = document.createElement('div');
        notification.className = 'in-app-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon">
                    <img src="images/logo.png" alt="ARRIBA HOMESTAY">
                </div>
                <div class="notification-text">
                    <h4>${payload.notification?.title || 'New Booking'}</h4>
                    <p>${payload.notification?.body || 'You have a new booking request'}</p>
                </div>
                <button class="notification-close">&times;</button>
            </div>
        `;

        // Add to page
        document.body.appendChild(notification);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);

        // Close button functionality
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.remove();
        });

        // Click to view booking
        notification.addEventListener('click', () => {
            if (payload.data?.bookingId) {
                window.location.href = `admin.html#booking-${payload.data.bookingId}`;
            } else {
                window.location.href = 'admin.html';
            }
            notification.remove();
        });
    }

    // Send test notification (for admin)
    async sendTestNotification() {
        if (!this.token) {
            console.log('No FCM token available');
            return false;
        }

        try {
            const response = await fetch('https://fcm.googleapis.com/fcm/send', {
                method: 'POST',
                headers: {
                    'Authorization': 'key=YOUR_SERVER_KEY',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    to: this.token,
                    notification: {
                        title: 'ARRIBA HOMESTAY',
                        body: 'Test notification - Admin logged in successfully!',
                        icon: '/images/logo.png'
                    },
                    data: {
                        type: 'test',
                        timestamp: Date.now().toString()
                    }
                })
            });

            if (response.ok) {
                console.log('Test notification sent successfully');
                return true;
            } else {
                console.error('Failed to send test notification');
                return false;
            }
        } catch (error) {
            console.error('Error sending test notification:', error);
            return false;
        }
    }

    // Check if notifications are enabled
    isEnabled() {
        return this.permission === 'granted' && this.token !== null;
    }

    // Get notification status
    getStatus() {
        return {
            supported: this.isSupported,
            permission: this.permission,
            token: this.token,
            enabled: this.isEnabled()
        };
    }
}

// Global notification manager instance
window.notificationManager = new NotificationManager();

// Initialize notifications when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    // Check if user is admin (you can modify this logic)
    const isAdmin = localStorage.getItem('isAdmin') === 'true' || 
                   window.location.pathname.includes('admin.html');
    
    if (isAdmin) {
        console.log('Admin detected, initializing notifications...');
        await window.notificationManager.initialize();
        
        // Initialize notification bell icon
        initializeNotificationBell();
        
        // Update notification status display
        updateNotificationStatus();
    }
});

// Initialize notification bell icon functionality
function initializeNotificationBell() {
    const notificationBtn = document.getElementById('adminNotificationBtn');
    const notificationBadge = document.getElementById('notificationBadge');
    const notificationDropdown = document.getElementById('notificationDropdown');
    
    if (!notificationBtn || !notificationBadge) return;
    
    // Update notification status
    updateNotificationStatus();
    
    // Initialize notification dropdown
    initializeNotificationDropdown();
    
    // Handle notification button click
    notificationBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleNotificationDropdown();
    });
    
    // Listen for new notifications
    if (window.notificationManager) {
        // Simulate notification count (in real app, this would come from your backend)
        let notificationCount = 0;
        
        // Function to add notification
        window.addNotification = function(notificationData) {
            if (notificationData) {
                addNotificationToList(notificationData);
            } else {
                // Default test notification
                addNotificationToList({
                    title: 'Test Notification',
                    message: 'This is a test notification from ARRIBA HOMESTAY',
                    type: 'general',
                    icon: 'booking'
                });
            }
        };
        
        // Function to add booking notification (for external use)
        window.addBookingNotification = function(bookingData, bookingId) {
            return addBookingNotification(bookingData, bookingId);
        };
        
        // Function to add payment notification
        window.addPaymentNotification = function(paymentData, bookingId) {
            const notification = {
                id: `payment_${bookingId}_${Date.now()}`,
                title: 'Payment Received',
                message: `Payment of ₱${paymentData.amount || '0'} has been received for booking #${bookingId}`,
                time: new Date(),
                read: false,
                type: 'payment',
                icon: 'payment',
                bookingId: bookingId,
                paymentData: paymentData
            };
            
            notifications.unshift(notification);
            saveNotificationsToStorage();
            renderNotifications();
            updateNotificationBadge();
            
            return notification;
        };
        
        // Function to clear notifications
        window.clearNotifications = function() {
            notificationCount = 0;
            updateNotificationBadge(notificationCount);
        };
        
        // Request permission button functionality
        const requestPermissionBtn = document.getElementById('requestPermissionBtn');
        if (requestPermissionBtn) {
            requestPermissionBtn.addEventListener('click', async () => {
                console.log('Requesting notification permission...');
                const permission = await window.notificationManager.requestPermission();
                
                if (permission === 'granted') {
                    alert('Notification permission granted! You will now receive booking notifications.');
                    // Reinitialize notifications with new permission
                    await window.notificationManager.initialize();
                    updateNotificationStatus();
                } else {
                    alert('Notification permission denied. You can enable it later in your browser settings.');
                }
            });
        }
        
        // Reset permission button functionality
        const resetPermissionBtn = document.getElementById('resetPermissionBtn');
        if (resetPermissionBtn) {
            resetPermissionBtn.addEventListener('click', () => {
                const isChrome = navigator.userAgent.includes('Chrome');
                const isFirefox = navigator.userAgent.includes('Firefox');
                const isSafari = navigator.userAgent.includes('Safari') && !navigator.userAgent.includes('Chrome');
                const isEdge = navigator.userAgent.includes('Edg');
                
                let instructions = '';
                
                if (isChrome || isEdge) {
                    instructions = `Chrome/Edge - Reset Notification Permission:

Method 1 (Quick):
1. Click the lock icon in your browser's address bar
2. Click "Site settings" or "Permissions"
3. Find "Notifications" and change it to "Allow"
4. Refresh this page

Method 2 (Settings):
1. Go to: chrome://settings/content/notifications
2. Find "127.0.0.1:5500" in the list
3. Change it from "Block" to "Allow"
4. Refresh this page`;
                } else if (isFirefox) {
                    instructions = `Firefox - Reset Notification Permission:

1. Click the shield icon in your browser's address bar
2. Click "Permissions"
3. Find "Notifications" and change it to "Allow"
4. Refresh this page

Or go to: about:preferences#privacy
Find "Notifications" and manage permissions`;
                } else if (isSafari) {
                    instructions = `Safari - Reset Notification Permission:

1. Go to Safari menu > Preferences > Websites
2. Click "Notifications" in the sidebar
3. Find "127.0.0.1:5500" and change it to "Allow"
4. Refresh this page`;
                } else {
                    instructions = `Reset Notification Permission:

1. Look for a lock, shield, or info icon in your browser's address bar
2. Click it and look for "Site settings" or "Permissions"
3. Find "Notifications" and change it to "Allow"
4. Refresh this page`;
                }
                
                alert(instructions);
            });
        }
        
        // Test notification button functionality
        const testBtn = document.getElementById('testNotificationBtn');
        if (testBtn) {
            testBtn.addEventListener('click', () => {
                window.addNotification();
                
                // Show test notification
                if (window.notificationManager) {
                    window.notificationManager.showInAppNotification({
                        notification: {
                            title: 'Test Notification',
                            body: 'This is a test notification from ARRIBA HOMESTAY'
                        },
                        data: {
                            type: 'test',
                            timestamp: Date.now().toString()
                        }
                    });
                }
            });
        }
    }
}

// Update notification status display
function updateNotificationStatus() {
    const statusElement = document.getElementById('notificationStatus');
    if (!statusElement) return;
    
    const indicator = statusElement.querySelector('.status-indicator');
    const text = statusElement.querySelector('.status-text');
    
    if (Notification.permission === 'granted') {
        indicator.style.backgroundColor = '#27ae60';
        text.textContent = 'Notifications enabled - You will receive booking alerts';
    } else if (Notification.permission === 'denied') {
        indicator.style.backgroundColor = '#e74c3c';
        text.textContent = 'Notifications blocked - Enable in browser settings';
    } else {
        indicator.style.backgroundColor = '#f39c12';
        text.textContent = 'Click "Request Permission" to enable notifications';
    }
}

// Update notification badge
function updateNotificationBadge(count) {
    const notificationBadge = document.getElementById('notificationBadge');
    if (!notificationBadge) return;
    
    // If no count provided, calculate unread count
    if (count === undefined) {
        count = notifications.filter(n => !n.read).length;
    }
    
    if (count > 0) {
        notificationBadge.textContent = count > 99 ? '99+' : count.toString();
        notificationBadge.style.display = 'flex';
        notificationBadge.classList.add('animate');
        
        // Remove animation class after animation completes
        setTimeout(() => {
            notificationBadge.classList.remove('animate');
        }, 600);
    } else {
        notificationBadge.style.display = 'none';
    }
}

// Update notification status display
function updateNotificationStatus() {
    const statusIndicator = document.querySelector('.status-indicator');
    const statusText = document.querySelector('.status-text');
    
    if (!statusIndicator || !statusText) return;
    
    if (window.notificationManager) {
        const status = window.notificationManager.getStatus();
        
        if (status.enabled) {
            statusIndicator.classList.add('enabled');
            statusIndicator.classList.remove('disabled');
            statusText.textContent = 'Notifications enabled';
        } else {
            statusIndicator.classList.add('disabled');
            statusIndicator.classList.remove('enabled');
            statusText.textContent = 'Notifications disabled';
        }
    }
}

// Notification Dropdown Functionality
let notifications = [];
let currentFilter = 'all';

// Initialize notification dropdown
function initializeNotificationDropdown() {
    const dropdown = document.getElementById('notificationDropdown');
    if (!dropdown) return;
    
    // Add sample notifications
    console.log('Initializing real notifications...');
    initializeRealNotifications();
    
    // Handle tab switching
    const tabBtns = dropdown.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.tab;
            renderNotifications();
        });
    });
    
    // Handle mark all read
    const markAllReadBtn = document.getElementById('markAllReadBtn');
    if (markAllReadBtn) {
        markAllReadBtn.addEventListener('click', () => {
            notifications.forEach(notification => {
                notification.read = true;
            });
            renderNotifications();
            updateNotificationBadge();
        });
    }
    
    // Handle clear all
    const clearAllBtn = document.getElementById('clearAllBtn');
    if (clearAllBtn) {
        clearAllBtn.addEventListener('click', () => {
            notifications = [];
            renderNotifications();
            updateNotificationBadge();
        });
    }
    
    // Handle view all notifications
    const viewAllBtn = document.getElementById('viewAllNotificationsBtn');
    if (viewAllBtn) {
        viewAllBtn.addEventListener('click', () => {
            // Scroll to settings tab
            const settingsTab = document.querySelector('[data-tab="settings"]');
            if (settingsTab) {
                settingsTab.click();
                closeNotificationDropdown();
            }
        });
    }
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        const dropdown = document.getElementById('notificationDropdown');
        const notificationBtn = document.getElementById('adminNotificationBtn');
        const container = document.querySelector('.notification-dropdown-container');
        
        if (!dropdown || !notificationBtn) return;
        
        // Check if click is outside dropdown and notification button
        if (!dropdown.contains(e.target) && !notificationBtn.contains(e.target)) {
            closeNotificationDropdown();
        }
    });
    
    // Handle backdrop click for mobile
    document.addEventListener('click', (e) => {
        const container = document.querySelector('.notification-dropdown-container');
        if (container && container.classList.contains('show')) {
            // Check if click is on the backdrop (mobile)
            const rect = container.getBoundingClientRect();
            const isClickOnBackdrop = e.clientX < rect.left || 
                                   e.clientX > rect.right || 
                                   e.clientY < rect.top || 
                                   e.clientY > rect.bottom;
            
            if (isClickOnBackdrop) {
                closeNotificationDropdown();
            }
        }
    });
}

// Toggle notification dropdown
function toggleNotificationDropdown() {
    const dropdown = document.getElementById('notificationDropdown');
    if (!dropdown) return;
    
    if (dropdown.classList.contains('show')) {
        closeNotificationDropdown();
    } else {
        openNotificationDropdown();
    }
}

// Open notification dropdown
function openNotificationDropdown() {
    const dropdown = document.getElementById('notificationDropdown');
    const container = document.querySelector('.notification-dropdown-container');
    if (!dropdown) return;
    
    dropdown.classList.add('show');
    if (container) {
        container.classList.add('show');
    }
    renderNotifications();
}

// Close notification dropdown
function closeNotificationDropdown() {
    const dropdown = document.getElementById('notificationDropdown');
    const container = document.querySelector('.notification-dropdown-container');
    if (!dropdown) return;
    
    dropdown.classList.remove('show');
    if (container) {
        container.classList.remove('show');
    }
}

// Initialize real notifications from Firebase
function initializeRealNotifications() {
    console.log('=== Initializing Real Notifications ===');
    
    // Load existing notifications from localStorage
    console.log('Loading notifications from storage...');
    loadNotificationsFromStorage();
    
    // Set up Firebase listeners for real-time booking notifications
    console.log('Setting up Firebase listeners...');
    setupFirebaseListeners();
    
    // Set up periodic checks for booking reminders
    console.log('Setting up booking reminders...');
    setupBookingReminders();
    
    console.log('Real notifications initialization complete');
}

// Load notifications from localStorage
function loadNotificationsFromStorage() {
    const storedNotifications = localStorage.getItem('arriba_notifications');
    if (storedNotifications) {
        try {
            notifications = JSON.parse(storedNotifications);
            // Update timestamps to Date objects
            notifications.forEach(notification => {
                notification.time = new Date(notification.time);
            });
        } catch (error) {
            console.error('Error loading notifications from storage:', error);
            notifications = [];
        }
    } else {
        notifications = [];
    }
}

// Save notifications to localStorage
function saveNotificationsToStorage() {
    try {
        localStorage.setItem('arriba_notifications', JSON.stringify(notifications));
    } catch (error) {
        console.error('Error saving notifications to storage:', error);
    }
}

// Set up Firebase listeners for real-time notifications
function setupFirebaseListeners() {
    console.log('Setting up Firebase listeners...');
    console.log('window.db:', window.db);
    console.log('window.collection:', window.collection);
    console.log('window.onSnapshot:', window.onSnapshot);
    
    if (!window.db || !window.collection || !window.onSnapshot) {
        console.log('Firebase not available, skipping real-time listeners');
        console.log('Missing:', {
            db: !window.db,
            collection: !window.collection,
            onSnapshot: !window.onSnapshot
        });
        return;
    }
    
    try {
        console.log('Setting up bookings listener...');
        // Listen for new bookings
        const bookingsRef = window.collection(window.db, 'bookings');
        const unsubscribeBookings = window.onSnapshot(bookingsRef, (snapshot) => {
            console.log('Bookings snapshot received:', snapshot.size, 'documents');
            snapshot.docChanges().forEach((change) => {
                console.log('Booking change detected:', change.type, change.doc.id);
                if (change.type === 'added') {
                    const bookingData = change.doc.data();
                    console.log('New booking added:', bookingData);
                    addBookingNotification(bookingData, change.doc.id);
                } else if (change.type === 'modified') {
                    const bookingData = change.doc.data();
                    console.log('Booking modified:', bookingData);
                    updateBookingNotification(bookingData, change.doc.id);
                }
            });
        });
        
        // Store unsubscribe function for cleanup
        window.unsubscribeBookings = unsubscribeBookings;
        console.log('Firebase listeners set up successfully');
        
    } catch (error) {
        console.error('Error setting up Firebase listeners:', error);
    }
}

// Set up booking reminders
function setupBookingReminders() {
    // Check for check-in reminders every hour
    setInterval(() => {
        checkForCheckInReminders();
    }, 60 * 60 * 1000); // 1 hour
    
    // Check for check-out reminders every hour
    setInterval(() => {
        checkForCheckOutReminders();
    }, 60 * 60 * 1000); // 1 hour
}

// Add booking notification
function addBookingNotification(bookingData, bookingId) {
    console.log('Adding booking notification for:', bookingId, bookingData);
    
    const notification = {
        id: `booking_${bookingId}`,
        title: 'New Booking Request',
        message: `${bookingData.guestName || 'Guest'} has requested a booking for ${bookingData.guests || 1} guest(s) from ${formatDate(bookingData.checkIn)} to ${formatDate(bookingData.checkOut)}`,
        time: new Date(),
        read: false,
        type: 'booking',
        icon: 'booking',
        bookingId: bookingId,
        bookingData: bookingData
    };
    
    console.log('Created notification:', notification);
    
    notifications.unshift(notification);
    saveNotificationsToStorage();
    renderNotifications();
    updateNotificationBadge();
    
    console.log('Notification added to list, total notifications:', notifications.length);
    
    // Show in-app notification
    if (window.notificationManager) {
        console.log('Showing in-app notification...');
        window.notificationManager.showInAppNotification({
            notification: {
                title: notification.title,
                body: notification.message
            },
            data: {
                bookingId: bookingId,
                type: 'booking'
            }
        });
    } else {
        console.log('Notification manager not available');
    }
    
    console.log('Booking notification added successfully');
    return notification;
}

// Update booking notification
function updateBookingNotification(bookingData, bookingId) {
    const existingNotification = notifications.find(n => n.id === `booking_${bookingId}`);
    
    if (existingNotification) {
        // Update existing notification
        existingNotification.message = `${bookingData.guestName || 'Guest'} booking updated - Status: ${bookingData.status || 'pending'}`;
        existingNotification.time = new Date();
        existingNotification.read = false;
        existingNotification.bookingData = bookingData;
        
        saveNotificationsToStorage();
        renderNotifications();
        updateNotificationBadge();
    } else {
        // Create new notification for update
        addBookingNotification(bookingData, bookingId);
    }
}

// Check for check-in reminders
function checkForCheckInReminders() {
    if (!window.db || !window.collection || !window.getDocs) {
        return;
    }
    
    try {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        // Query bookings for tomorrow's check-ins
        const bookingsRef = window.collection(window.db, 'bookings');
        window.getDocs(bookingsRef).then((snapshot) => {
            snapshot.forEach((doc) => {
                const bookingData = doc.data();
                const checkInDate = new Date(bookingData.checkIn);
                
                // Check if check-in is tomorrow
                if (isSameDay(checkInDate, tomorrow)) {
                    addReminderNotification({
                        title: 'Check-in Reminder',
                        message: `${bookingData.guestName || 'Guest'} is scheduled to check-in tomorrow at ${bookingData.checkInTime || '2:00 PM'}`,
                        type: 'reminder',
                        icon: 'reminder',
                        bookingId: doc.id,
                        bookingData: bookingData
                    });
                }
            });
        });
    } catch (error) {
        console.error('Error checking check-in reminders:', error);
    }
}

// Check for check-out reminders
function checkForCheckOutReminders() {
    if (!window.db || !window.collection || !window.getDocs) {
        return;
    }
    
    try {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        // Query bookings for tomorrow's check-outs
        const bookingsRef = window.collection(window.db, 'bookings');
        window.getDocs(bookingsRef).then((snapshot) => {
            snapshot.forEach((doc) => {
                const bookingData = doc.data();
                const checkOutDate = new Date(bookingData.checkOut);
                
                // Check if check-out is tomorrow
                if (isSameDay(checkOutDate, tomorrow)) {
                    addReminderNotification({
                        title: 'Check-out Reminder',
                        message: `${bookingData.guestName || 'Guest'} is scheduled to check-out tomorrow at ${bookingData.checkOutTime || '11:00 AM'}`,
                        type: 'reminder',
                        icon: 'reminder',
                        bookingId: doc.id,
                        bookingData: bookingData
                    });
                }
            });
        });
    } catch (error) {
        console.error('Error checking check-out reminders:', error);
    }
}

// Add reminder notification
function addReminderNotification(reminderData) {
    const notification = {
        id: `reminder_${reminderData.bookingId}_${Date.now()}`,
        title: reminderData.title,
        message: reminderData.message,
        time: new Date(),
        read: false,
        type: reminderData.type,
        icon: reminderData.icon,
        bookingId: reminderData.bookingId,
        bookingData: reminderData.bookingData
    };
    
    // Check if similar reminder already exists
    const existingReminder = notifications.find(n => 
        n.type === 'reminder' && 
        n.bookingId === reminderData.bookingId &&
        n.title === reminderData.title
    );
    
    if (!existingReminder) {
        notifications.unshift(notification);
        saveNotificationsToStorage();
        renderNotifications();
        updateNotificationBadge();
    }
    
    return notification;
}

// Utility function to check if two dates are the same day
function isSameDay(date1, date2) {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
}

// Utility function to format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
}

// Render notifications based on current filter
function renderNotifications() {
    const notificationList = document.getElementById('notificationList');
    if (!notificationList) return;
    
    let filteredNotifications = notifications;
    
    if (currentFilter === 'unread') {
        filteredNotifications = notifications.filter(n => !n.read);
    } else if (currentFilter === 'read') {
        filteredNotifications = notifications.filter(n => n.read);
    }
    
    if (filteredNotifications.length === 0) {
        notificationList.innerHTML = `
            <div class="notification-empty">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
                <h4>No ${currentFilter === 'all' ? '' : currentFilter} notifications</h4>
                <p>You're all caught up!</p>
            </div>
        `;
        return;
    }
    
    notificationList.innerHTML = filteredNotifications.map(notification => `
        <div class="notification-item ${notification.read ? '' : 'unread'}" data-id="${notification.id}">
            <div class="notification-icon">
                ${getNotificationIcon(notification.icon)}
            </div>
            <div class="notification-content">
                <div class="notification-title">${notification.title}</div>
                <div class="notification-message">${notification.message}</div>
                <div class="notification-time">${formatTime(notification.time)}</div>
            </div>
        </div>
    `).join('');
    
    // Add click handlers to notification items
    notificationList.querySelectorAll('.notification-item').forEach(item => {
        item.addEventListener('click', () => {
            const notificationId = parseInt(item.dataset.id);
            markNotificationAsRead(notificationId);
        });
    });
}

// Get notification icon based on type
function getNotificationIcon(type) {
    const icons = {
        booking: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2H5a2 2 0 0 0-2-2z"></path>
            <polyline points="8,21 12,17 16,21"></polyline>
        </svg>`,
        payment: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="1" x2="12" y2="23"></line>
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
        </svg>`,
        reminder: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12,6 12,12 16,14"></polyline>
        </svg>`,
        maintenance: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
        </svg>`,
        status_update: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20,6 9,17 4,12"></polyline>
        </svg>`,
        checkmark: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20,6 9,17 4,12"></polyline>
        </svg>`,
        general: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>`
    };
    
    return icons[type] || icons.booking;
}

// Format time for display
function formatTime(date) {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    
    return date.toLocaleDateString();
}

// Mark notification as read
function markNotificationAsRead(id) {
    const notification = notifications.find(n => n.id === id);
    if (notification) {
        notification.read = true;
        renderNotifications();
        updateNotificationBadge();
    }
}

// Add new notification
function addNotificationToList(notification) {
    const newNotification = {
        id: Date.now(),
        title: notification.title || 'New Notification',
        message: notification.message || 'You have a new notification',
        time: new Date(),
        read: false,
        type: notification.type || 'general',
        icon: notification.icon || 'booking'
    };
    
    notifications.unshift(newNotification);
    renderNotifications();
    updateNotificationBadge();
    
    return newNotification;
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NotificationManager;
}
