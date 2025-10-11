// Admin Dashboard JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Check if Firebase is loaded
    if (typeof window.auth === 'undefined' || typeof window.db === 'undefined') {
        console.error('Firebase not loaded');
        return;
    }

    const auth = window.auth;
    const db = window.db;
    const onAuthStateChanged = window.onAuthStateChanged;
    const addDoc = window.addDoc;
    const getDocs = window.getDocs;
    const updateDoc = window.updateDoc;
    const deleteDoc = window.deleteDoc;
    const collection = window.collection;
    const doc = window.doc;
    const query = window.query;
    const orderBy = window.orderBy;

    // Global variables
    let currentBookingId = null;
    let currentRoomId = null;
    let bookings = [];
    let filteredBookings = [];
    let rooms = [];

    // Security: Session management and browser navigation protection
    let sessionTimeout = null;
    let isAuthenticated = false;
    let lastActivity = Date.now();
    
    // Set session timeout (30 minutes)
    const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds
    
    // Security: Prevent back/forward button access
    function preventNavigationAccess() {
        // Clear any cached authentication
        localStorage.removeItem('isAdmin');
        sessionStorage.clear();
        
        // Redirect to login page
        window.location.replace('index.html');
    }
    
    // Security: Handle browser navigation events
    function setupNavigationProtection() {
        // Prevent back button access
        window.addEventListener('popstate', function(event) {
            console.log('Navigation detected, checking authentication...');
            if (!isAuthenticated) {
                preventNavigationAccess();
            }
        });
        
        // Prevent page refresh without re-authentication
        window.addEventListener('beforeunload', function(event) {
            if (isAuthenticated) {
                // Clear session data on page unload
                localStorage.removeItem('isAdmin');
                sessionStorage.clear();
            }
        });
        
        // Monitor page visibility changes
        document.addEventListener('visibilitychange', function() {
            if (document.hidden) {
                // Page is hidden, start session timeout
                startSessionTimeout();
            } else {
                // Page is visible, reset session timeout
                resetSessionTimeout();
            }
        });
        
        // Monitor user activity
        ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
            document.addEventListener(event, resetSessionTimeout, true);
        });
    }
    
    // Security: Session timeout management
    function startSessionTimeout() {
        if (sessionTimeout) {
            clearTimeout(sessionTimeout);
        }
        sessionTimeout = setTimeout(() => {
            console.log('Session timeout reached, logging out...');
            logoutUser();
        }, SESSION_TIMEOUT);
    }
    
    function resetSessionTimeout() {
        lastActivity = Date.now();
        if (sessionTimeout) {
            clearTimeout(sessionTimeout);
        }
        startSessionTimeout();
    }
    
    // Security: Enhanced logout function
    function logoutUser() {
        console.log('Logging out user...');
        
        // Clear authentication state
        isAuthenticated = false;
        
        // Clear session data
        localStorage.removeItem('isAdmin');
        sessionStorage.clear();
        
        // Clear session timeout
        if (sessionTimeout) {
            clearTimeout(sessionTimeout);
            sessionTimeout = null;
        }
        
        // Sign out from Firebase
        if (window.signOut && auth) {
            window.signOut(auth).then(() => {
                console.log('Firebase logout successful');
            }).catch((error) => {
                console.error('Firebase logout error:', error);
            });
        }
        
        // Redirect to login page
        window.location.replace('index.html');
    }
    
    // Security: Check for cached authentication attempts
    function checkCachedAuth() {
        const cachedAuth = localStorage.getItem('isAdmin');
        if (cachedAuth === 'true') {
            console.log('Cached authentication detected, clearing...');
            localStorage.removeItem('isAdmin');
            preventNavigationAccess();
        }
    }
    
    // Security: Initialize protection
    setupNavigationProtection();
    checkCachedAuth();
    
    // Check authentication
    onAuthStateChanged(auth, (user) => {
        if (user) {
            console.log('Admin logged in:', user.email);
            isAuthenticated = true;
            
            // Set admin flag in session storage (not localStorage)
            sessionStorage.setItem('isAdmin', 'true');
            
            // Start session timeout
            resetSessionTimeout();
            
            initializeAdmin();
        } else {
            console.log('Admin not logged in, redirecting...');
            isAuthenticated = false;
            preventNavigationAccess();
        }
    });

    // Initialize admin dashboard
    function initializeAdmin() {
        setupEventListeners();
        loadDashboardData();
        
        // Test Firebase connection
        testFirebaseConnection();
    }
    
    // Test Firebase connection
    async function testFirebaseConnection() {
        try {
            console.log('Testing Firebase connection...');
            console.log('Auth:', auth);
            console.log('DB:', db);
            console.log('Current user:', auth.currentUser);
            
            // Test Firestore connection
            if (db && getDocs && collection) {
                const testRef = collection(db, 'bookings');
                const snapshot = await getDocs(testRef);
                console.log('Firestore connection successful. Documents:', snapshot.size);
            } else {
                console.error('Firestore functions not available');
            }
        } catch (error) {
            console.error('Firebase connection test failed:', error);
        }
    }

    // Setup event listeners
    function setupEventListeners() {
        // Tab switching
        const tabButtons = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tabId = button.getAttribute('data-tab');
                
                // Remove active class from all tabs and contents
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));
                
                // Add active class to clicked tab and corresponding content
                button.classList.add('active');
                document.getElementById(`${tabId}-tab`).classList.add('active');
            });
        });

        // Status filter
        const statusFilter = document.getElementById('statusFilter');
        if (statusFilter) {
            statusFilter.addEventListener('change', function() {
                filterBookings(this.value);
            });
        }

        // Delete All button
        const deleteAllBtn = document.getElementById('deleteAllBtn');
        if (deleteAllBtn) {
            deleteAllBtn.addEventListener('click', handleDeleteAllBookings);
        }
        
        // Calendar tab initialization
        const calendarTab = document.getElementById('calendar-tab');
        if (calendarTab) {
            // Calendar will be initialized by calendar.js
            console.log('Calendar tab detected');
        }

        // Modal controls
        setupModalControls();

        // Form submissions
        setupFormSubmissions();

        // Add buttons
        document.getElementById('addBookingBtn').addEventListener('click', () => openBookingModal());
        document.getElementById('addRoomBtn').addEventListener('click', () => openRoomModal());

        // Logout button
        document.getElementById('adminLogoutBtn').addEventListener('click', handleLogout);
    }

    // Setup modal controls
    function setupModalControls() {
        const modals = document.querySelectorAll('.modal');
        const closeButtons = document.querySelectorAll('.close');

        closeButtons.forEach(button => {
            button.addEventListener('click', () => {
                modals.forEach(modal => modal.style.display = 'none');
                document.body.style.overflow = 'auto';
            });
        });

        modals.forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.style.display = 'none';
                    document.body.style.overflow = 'auto';
                }
            });
        });

        // Escape key to close modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                modals.forEach(modal => modal.style.display = 'none');
                document.body.style.overflow = 'auto';
            }
        });
    }

    // Setup form submissions
    function setupFormSubmissions() {
        // Booking form
        document.getElementById('bookingForm').addEventListener('submit', handleBookingSubmit);
        
        // Room form
        document.getElementById('roomForm').addEventListener('submit', handleRoomSubmit);
        
        // Settings form
        document.getElementById('settingsForm').addEventListener('submit', handleSettingsSubmit);
    }

    // Load dashboard data
    async function loadDashboardData() {
        try {
            await Promise.all([
                loadBookings(),
                loadRooms(),
                loadSettings()
            ]);
            updateDashboardStats();
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        }
    }

    // Load bookings
    async function loadBookings() {
        try {
            const bookingsQuery = query(collection(db, 'bookings'), orderBy('createdAt', 'desc'));
            const querySnapshot = await getDocs(bookingsQuery);
            
            bookings = [];
            querySnapshot.forEach((doc) => {
                bookings.push({ id: doc.id, ...doc.data() });
            });
            
            // Initialize filtered bookings with all bookings
            filteredBookings = [...bookings];
            renderBookingsTable();
        } catch (error) {
            console.error('Error loading bookings:', error);
        }
    }

    // Load rooms
    async function loadRooms() {
        try {
            const roomsQuery = query(collection(db, 'rooms'));
            const querySnapshot = await getDocs(roomsQuery);
            
            rooms = [];
            querySnapshot.forEach((doc) => {
                rooms.push({ id: doc.id, ...doc.data() });
            });
            
            renderRoomsGrid();
            updateRoomSelect();
        } catch (error) {
            console.error('Error loading rooms:', error);
        }
    }

    // Load settings
    async function loadSettings() {
        try {
            const settingsDoc = doc(db, 'settings', 'general');
            const settingsSnapshot = await getDocs(collection(db, 'settings'));
            
            if (!settingsSnapshot.empty) {
                const settingsData = settingsSnapshot.docs[0].data();
                populateSettingsForm(settingsData);
            }
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    }

    // Filter bookings by status
    function filterBookings(status) {
        if (status === 'all') {
            filteredBookings = [...bookings];
        } else if (status === 'recent') {
            // Show bookings from last 7 days
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            filteredBookings = bookings.filter(booking => {
                const bookingDate = new Date(booking.createdAt);
                return bookingDate >= sevenDaysAgo;
            });
        } else {
            // Filter by specific status
            filteredBookings = bookings.filter(booking => 
                booking.status && booking.status.toLowerCase() === status.toLowerCase()
            );
        }
        renderBookingsTable();
    }

    // Render bookings table
    function renderBookingsTable() {
        const tbody = document.getElementById('bookingsTableBody');
        tbody.innerHTML = '';

        if (filteredBookings.length === 0) {
            tbody.innerHTML = '<tr><td colspan="11" class="loading">No bookings found</td></tr>';
            return;
        }

        filteredBookings.forEach(booking => {
            const row = document.createElement('tr');
            row.setAttribute('data-booking-id', booking.id);
            row.innerHTML = `
                <td>${booking.id.substring(0, 8)}...</td>
                <td>${booking.guestName || 'N/A'}</td>
                <td>${booking.email || 'N/A'}</td>
                <td>${booking.fullPhone || booking.phone || 'N/A'}</td>
                <td>${formatDate(booking.checkIn)}</td>
                <td>${formatDate(booking.checkOut)}</td>
                <td>${booking.guests || 'N/A'}</td>
                <td>${booking.roomType || 'N/A'}</td>
                <td>₱${booking.totalFee || booking.totalAmount || '0'}</td>
                <td><span class="status-badge status-${booking.status || 'pending'}">${booking.status || 'pending'}</span></td>
                <td class="actions-cell">
                    <button class="btn-primary" onclick="viewBookingDetails('${booking.id}')">View Details</button>
                    <button class="btn-secondary" onclick="editBooking('${booking.id}')">Edit</button>
                    <button class="btn-danger" onclick="deleteBooking('${booking.id}')">Delete</button>
                </td>
            `;
            
            // Add click event listener to make the row clickable
            row.addEventListener('click', function(e) {
                // Don't trigger if clicking on buttons
                if (e.target.tagName === 'BUTTON') {
                    return;
                }
                viewBookingDetails(booking.id);
            });
            
            // Add hover effect styling
            row.style.cursor = 'pointer';
            row.addEventListener('mouseenter', function() {
                this.style.backgroundColor = '#f8f9fa';
            });
            row.addEventListener('mouseleave', function() {
                this.style.backgroundColor = '';
            });
            
            tbody.appendChild(row);
        });
    }

    // Render rooms grid
    function renderRoomsGrid() {
        const grid = document.getElementById('roomsGrid');
        grid.innerHTML = '';

        if (rooms.length === 0) {
            grid.innerHTML = '<div class="loading">No rooms found</div>';
            return;
        }

        // Create table structure
        const table = document.createElement('table');
        table.className = 'rooms-table';
        table.innerHTML = `
            <thead>
                <tr>
                    <th>Room Name</th>
                    <th>Price/Night</th>
                    <th>Max Guests</th>
                    <th>Available</th>
                    <th>Amenities</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
            </tbody>
        `;

        const tbody = table.querySelector('tbody');

        rooms.forEach(room => {
            const row = document.createElement('tr');
            row.className = 'room-row';
            row.innerHTML = `
                <td class="room-name-cell">
                    <strong>${room.name || 'Unnamed Room'}</strong>
                </td>
                <td class="room-price-cell">
                    <span class="price">₱${room.price || '0'}</span>
                </td>
                <td class="room-guests-cell">
                    ${room.maxGuests || 'N/A'}
                </td>
                <td class="room-available-cell">
                    <span class="status-badge ${room.available ? 'status-available' : 'status-unavailable'}">
                        ${room.available ? 'Yes' : 'No'}
                    </span>
                </td>
                <td class="room-amenities-cell">
                    <div class="amenity-tags">
                        ${(room.amenities || []).map(amenity => `<span class="amenity-tag">${amenity}</span>`).join('')}
                    </div>
                </td>
                <td class="room-actions-cell">
                    <button class="btn-secondary btn-sm" onclick="editRoom('${room.id}')">Edit</button>
                    <button class="btn-danger btn-sm" onclick="deleteRoom('${room.id}')">Delete</button>
                </td>
            `;
            tbody.appendChild(row);
        });

        grid.appendChild(table);
    }

    // Update room select dropdown
    function updateRoomSelect() {
        const roomSelect = document.getElementById('roomType');
        roomSelect.innerHTML = '<option value="">Select Room</option>';
        
        rooms.forEach(room => {
            const option = document.createElement('option');
            option.value = room.name;
            option.textContent = `${room.name} - ₱${room.price}/night`;
            roomSelect.appendChild(option);
        });
    }

    // Populate settings form
    function populateSettingsForm(settings) {
        const fields = ['siteName', 'contactEmail', 'contactPhone', 'checkInTime', 'checkOutTime'];
        fields.forEach(field => {
            const input = document.getElementById(field);
            if (input && settings[field]) {
                input.value = settings[field];
            }
        });
    }

    // Update dashboard stats
    function updateDashboardStats() {
        const totalBookings = bookings.length;
        const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length;
        const pendingBookings = bookings.filter(b => b.status === 'pending').length;
        const totalRevenue = bookings.reduce((sum, b) => sum + (parseFloat(b.totalAmount) || 0), 0);

        document.getElementById('totalBookings').textContent = totalBookings;
        document.getElementById('confirmedBookings').textContent = confirmedBookings;
        document.getElementById('pendingBookings').textContent = pendingBookings;
        document.getElementById('totalRevenue').textContent = `₱${totalRevenue.toFixed(2)}`;
    }

    // Open booking modal
    function openBookingModal(bookingId = null) {
        currentBookingId = bookingId;
        const modal = document.getElementById('bookingModal');
        const title = document.getElementById('bookingModalTitle');
        const form = document.getElementById('bookingForm');

        if (bookingId) {
            title.textContent = 'Edit Booking';
            const booking = bookings.find(b => b.id === bookingId);
            if (booking) {
                populateBookingForm(booking);
            }
        } else {
            title.textContent = 'Add New Booking';
            form.reset();
        }

        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    // Open room modal
    function openRoomModal(roomId = null) {
        currentRoomId = roomId;
        const modal = document.getElementById('roomModal');
        const title = document.getElementById('roomModalTitle');
        const form = document.getElementById('roomForm');

        if (roomId) {
            title.textContent = 'Edit Room';
            const room = rooms.find(r => r.id === roomId);
            if (room) {
                populateRoomForm(room);
            }
        } else {
            title.textContent = 'Add New Room';
            form.reset();
        }

        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    // Populate booking form
    function populateBookingForm(booking) {
        const fields = ['guestName', 'email', 'phone', 'roomType', 'checkIn', 'checkOut', 'guests', 'totalFee', 'specialRequests', 'status'];
        fields.forEach(field => {
            const input = document.getElementById(field);
            if (input && booking[field]) {
                input.value = booking[field];
            }
        });
    }

    // Populate room form
    function populateRoomForm(room) {
        const fields = ['roomName', 'roomPrice', 'maxGuests', 'roomDescription'];
        fields.forEach(field => {
            const input = document.getElementById(field);
            if (input && room[field]) {
                input.value = room[field];
            }
        });

        const availableSelect = document.getElementById('roomAvailable');
        if (availableSelect) {
            availableSelect.value = room.available ? 'true' : 'false';
        }

        const amenitiesInput = document.getElementById('roomAmenities');
        if (amenitiesInput && room.amenities) {
            amenitiesInput.value = room.amenities.join(', ');
        }
    }

    // Handle booking form submission
    async function handleBookingSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const bookingData = {
            guestName: formData.get('guestName'),
            email: formData.get('guestEmail'),
            phone: formData.get('guestPhone'),
            roomType: formData.get('roomType'),
            checkIn: formData.get('checkIn'),
            checkOut: formData.get('checkOut'),
            guests: parseInt(formData.get('guests')),
            totalAmount: parseFloat(formData.get('totalAmount')),
            specialRequests: formData.get('specialRequests'),
            status: formData.get('status'),
            updatedAt: new Date()
        };

        try {
            if (currentBookingId) {
                // Update existing booking
                await updateDoc(doc(db, 'bookings', currentBookingId), bookingData);
                alert('Booking updated successfully!');
            } else {
                // Add new booking
                bookingData.createdAt = new Date();
                await addDoc(collection(db, 'bookings'), bookingData);
                alert('Booking added successfully!');
            }

            document.getElementById('bookingModal').style.display = 'none';
            document.body.style.overflow = 'auto';
            await loadBookings();
            updateDashboardStats();
        } catch (error) {
            console.error('Error saving booking:', error);
            alert('Error saving booking. Please try again.');
        }
    }

    // Handle delete all bookings
    async function handleDeleteAllBookings() {
        // Show confirmation dialog
        const confirmed = confirm('Are you sure you want to delete ALL bookings? This action cannot be undone!');
        
        if (!confirmed) {
            return;
        }

        // Show second confirmation for safety
        const doubleConfirmed = confirm('This will permanently delete ALL bookings. Type "DELETE ALL" to confirm:');
        
        if (!doubleConfirmed) {
            return;
        }

        try {
            // Get all booking documents
            const bookingsRef = collection(db, 'bookings');
            const snapshot = await getDocs(bookingsRef);
            
            if (snapshot.empty) {
                alert('No bookings found to delete.');
                return;
            }

            // Show loading state
            const deleteAllBtn = document.getElementById('deleteAllBtn');
            const originalText = deleteAllBtn.textContent;
            deleteAllBtn.textContent = 'Deleting...';
            deleteAllBtn.disabled = true;

            // Delete all bookings
            const deletePromises = [];
            snapshot.forEach((doc) => {
                deletePromises.push(deleteDoc(doc.ref));
            });

            await Promise.all(deletePromises);

            // Restore calendar availability for all accepted bookings
            const acceptedBookings = snapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .filter(booking => booking.status === 'accepted');
            
            console.log('Restoring availability for accepted bookings:', acceptedBookings.length);
            
            for (const booking of acceptedBookings) {
                await restoreBookingDatesAvailability(booking);
            }

            // Clear local arrays
            bookings = [];
            filteredBookings = [];

            // Refresh the table and stats
            renderBookingsTable();
            updateDashboardStats();

            // Show success message
            alert(`Successfully deleted ${snapshot.size} booking(s).`);

            // Reset button state
            deleteAllBtn.textContent = originalText;
            deleteAllBtn.disabled = false;

        } catch (error) {
            console.error('Error deleting bookings:', error);
            alert('Error deleting bookings. Please try again.');
            
            // Reset button state
            const deleteAllBtn = document.getElementById('deleteAllBtn');
            deleteAllBtn.textContent = 'Delete All';
            deleteAllBtn.disabled = false;
        }
    }

    // Handle room form submission
    async function handleRoomSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const roomData = {
            name: formData.get('roomName'),
            price: parseFloat(formData.get('roomPrice')),
            maxGuests: parseInt(formData.get('maxGuests')),
            available: formData.get('roomAvailable') === 'true',
            description: formData.get('roomDescription'),
            amenities: formData.get('roomAmenities').split(',').map(a => a.trim()).filter(a => a)
        };

        try {
            if (currentRoomId) {
                // Update existing room
                await updateDoc(doc(db, 'rooms', currentRoomId), roomData);
                alert('Room updated successfully!');
            } else {
                // Add new room
                await addDoc(collection(db, 'rooms'), roomData);
                alert('Room added successfully!');
            }

            document.getElementById('roomModal').style.display = 'none';
            document.body.style.overflow = 'auto';
            await loadRooms();
        } catch (error) {
            console.error('Error saving room:', error);
            alert('Error saving room. Please try again.');
        }
    }

    // Handle settings form submission
    async function handleSettingsSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const settingsData = {
            siteName: formData.get('siteName'),
            contactEmail: formData.get('contactEmail'),
            contactPhone: formData.get('contactPhone'),
            checkInTime: formData.get('checkInTime'),
            checkOutTime: formData.get('checkOutTime')
        };

        try {
            await updateDoc(doc(db, 'settings', 'general'), settingsData);
            alert('Settings saved successfully!');
        } catch (error) {
            console.error('Error saving settings:', error);
            alert('Error saving settings. Please try again.');
        }
    }

    // Edit booking
    window.editBooking = function(bookingId) {
        openBookingModal(bookingId);
    };

    // Complete booking (mark as completed and restore availability)
    window.completeBooking = async function(bookingId) {
        if (confirm('Are you sure you want to mark this booking as completed?')) {
            try {
                // Get booking data before updating
                const booking = bookings.find(b => b.id === bookingId);
                
                // Update booking status to completed
                await updateDoc(doc(db, 'bookings', bookingId), {
                    status: 'completed',
                    completedAt: new Date(),
                    updatedAt: new Date()
                });
                
                // Restore calendar availability for completed booking
                if (booking) {
                    await restoreBookingDatesAvailability(booking);
                }
                
                // Show success toast
                const successToast = document.createElement('div');
                successToast.style.cssText = `
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: #27ae60;
                    color: white;
                    padding: 1rem 1.5rem;
                    border-radius: 8px;
                    z-index: 10000;
                    font-weight: 500;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                `;
                successToast.textContent = 'Booking completed successfully!';
                document.body.appendChild(successToast);
                
                // Remove success toast after 3 seconds
                setTimeout(() => {
                    if (document.body.contains(successToast)) {
                        document.body.removeChild(successToast);
                    }
                }, 3000);
                
                // Refresh bookings table
                await loadBookings();
                
                // Reapply current filter
                const statusFilter = document.getElementById('statusFilter');
                if (statusFilter) {
                    filterBookings(statusFilter.value);
                }
                
                // Update dashboard stats
                updateDashboardStats();
                
            } catch (error) {
                console.error('Error completing booking:', error);
                alert('Error completing booking. Please try again.');
            }
        }
    };

    // Delete booking
    window.deleteBooking = async function(bookingId) {
        if (confirm('Are you sure you want to delete this booking?')) {
            try {
                // Get booking data before deletion to restore calendar availability
                const booking = bookings.find(b => b.id === bookingId);
                
                await deleteDoc(doc(db, 'bookings', bookingId));
                
                // Restore calendar availability if booking was accepted
                if (booking && booking.status === 'accepted') {
                    await restoreBookingDatesAvailability(booking);
                }
                
                alert('Booking deleted successfully!');
                await loadBookings();
                updateDashboardStats();
            } catch (error) {
                console.error('Error deleting booking:', error);
                alert('Error deleting booking. Please try again.');
            }
        }
    };

    // Edit room
    window.editRoom = function(roomId) {
        openRoomModal(roomId);
    };

    // Delete room
    window.deleteRoom = async function(roomId) {
        if (confirm('Are you sure you want to delete this room?')) {
            try {
                await deleteDoc(doc(db, 'rooms', roomId));
                alert('Room deleted successfully!');
                await loadRooms();
            } catch (error) {
                console.error('Error deleting room:', error);
                alert('Error deleting room. Please try again.');
            }
        }
    };

    // Handle logout
    async function handleLogout() {
        if (confirm('Are you sure you want to logout?')) {
            logoutUser();
        }
    }

    // Utility functions
    function formatDate(dateString) {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString();
    }

    function calculateDuration(checkIn, checkOut) {
        if (!checkIn || !checkOut) return 'N/A';
        
        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);
        
        // Calculate the difference in milliseconds
        const timeDiff = checkOutDate.getTime() - checkInDate.getTime();
        
        // Convert to days and round up
        const nights = Math.ceil(timeDiff / (1000 * 3600 * 24));
        
        return nights > 0 ? nights : 0;
    }

    // Accept booking function
    window.acceptBooking = async function(bookingId) {
        console.log('Accepting booking:', bookingId);
        console.log('Firebase db:', db);
        console.log('updateDoc function:', updateDoc);
        console.log('doc function:', doc);
        
        // Check if booking is already accepted
        const booking = bookings.find(b => b.id === bookingId);
        if (booking && booking.status === 'accepted') {
            alert('This booking has already been accepted!');
            return;
        }
        
        if (confirm('Are you sure you want to accept this booking?')) {
            try {
                // Check if Firebase functions are available
                if (!updateDoc || !doc || !db) {
                    throw new Error('Firebase functions not available');
                }
                
                console.log('Updating booking document...');
                
                // Try primary method first
            try {
                await updateDoc(doc(db, 'bookings', bookingId), {
                    status: 'accepted',
                    updatedAt: new Date()
                });
                    console.log('Booking updated successfully with updateDoc');
                } catch (updateError) {
                    console.log('updateDoc failed, trying setDoc...', updateError);
                    
                    // Fallback: try setDoc with merge
                    await setDoc(doc(db, 'bookings', bookingId), {
                        status: 'accepted',
                        updatedAt: new Date()
                    }, { merge: true });
                    console.log('Booking updated successfully with setDoc');
                }
                
                // Mark booking dates as unavailable in calendar
                await markBookingDatesUnavailable(booking);
                
                // Trigger notification for booking status update
                if (window.addNotification) {
                    window.addNotification({
                        title: 'Booking Accepted',
                        message: `Booking #${bookingId} has been accepted`,
                        type: 'status_update',
                        icon: 'checkmark',
                        bookingId: bookingId
                    });
                }
                
                // Show success toast
                const successToast = document.createElement('div');
                successToast.style.cssText = `
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: #27ae60;
                    color: white;
                    padding: 1rem 1.5rem;
                    border-radius: 8px;
                    z-index: 10000;
                    font-weight: 500;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                `;
                successToast.textContent = 'Booking accepted successfully!';
                document.body.appendChild(successToast);
                
                // Remove success toast after 3 seconds
                setTimeout(() => {
                    if (document.body.contains(successToast)) {
                        document.body.removeChild(successToast);
                    }
                }, 3000);
                
                await loadBookings();
                // Reapply current filter
                const statusFilter = document.getElementById('statusFilter');
                if (statusFilter) {
                    filterBookings(statusFilter.value);
                }
                
                // Update dashboard stats
                updateDashboardStats();
            } catch (error) {
                console.error('Error accepting booking:', error);
                console.error('Error details:', {
                    message: error.message,
                    code: error.code,
                    stack: error.stack
                });
                alert(`Error accepting booking: ${error.message}. Please try again.`);
            }
        }
    };

    // View booking details function
    window.viewBookingDetails = function(bookingId) {
        // Find the booking data from the table
        const bookingRow = document.querySelector(`tr[data-booking-id="${bookingId}"]`);
        if (!bookingRow) {
            alert('Booking not found');
            return;
        }
        
        // Extract booking data from the table row
        const cells = bookingRow.querySelectorAll('td');
        const booking = {
            id: bookingId,
            guestName: cells[1].textContent,
            email: cells[2].textContent,
            phone: cells[3].textContent,
            checkIn: cells[4].textContent,
            checkOut: cells[5].textContent,
            guests: cells[6].textContent,
            roomType: cells[7].textContent,
            totalFee: cells[8].textContent.replace('₱', ''),
            status: cells[9].querySelector('.status-badge').textContent.toLowerCase()
        };
        if (!booking) {
            alert('Booking not found');
            return;
        }

        // Create modal content
        const detailsHtml = `
            <div class="booking-details-modal">
                <h3>Booking Details</h3>
                <div class="detail-row">
                    <strong>Booking ID:</strong> ${booking.id}
                </div>
                <div class="detail-row">
                    <strong>Guest Name:</strong> ${booking.guestName || 'N/A'}
                </div>
                <div class="detail-row">
                    <strong>Email:</strong> ${booking.email || 'N/A'}
                </div>
                <div class="detail-row">
                    <strong>Phone:</strong> ${booking.fullPhone || booking.phone || 'N/A'}
                </div>
                <div class="detail-row">
                    <strong>Check-in:</strong> ${formatDate(booking.checkIn)}
                </div>
                <div class="detail-row">
                    <strong>Check-out:</strong> ${formatDate(booking.checkOut)}
                </div>
                <div class="detail-row">
                    <strong>Duration:</strong> ${calculateDuration(booking.checkIn, booking.checkOut)} nights
                </div>
                <div class="detail-row">
                    <strong>Guests:</strong> ${booking.guests || 'N/A'}
                </div>
                <div class="detail-row">
                    <strong>Extra Beds:</strong> ${booking.extraBed || '0'}
                </div>
                <div class="detail-row">
                    <strong>Room Fee:</strong> ₱${booking.roomFee || '0'}
                </div>
                <div class="detail-row">
                    <strong>Extra Bed Fee:</strong> ₱${booking.extraBedFee || '0'}
                </div>
                <div class="detail-row">
                    <strong>Total Fee:</strong> ₱${booking.totalFee || booking.totalAmount || '0'}
                </div>
                <div class="detail-row">
                    <strong>Special Requests:</strong> ${booking.specialRequests || 'None'}
                </div>
                <div class="detail-row">
                    <strong>Status:</strong> <span class="status-badge status-${booking.status || 'pending'}">${booking.status || 'pending'}</span>
                </div>
                <div class="detail-row">
                    <strong>Created:</strong> ${formatDate(booking.createdAt)}
                </div>
                
                <div class="modal-actions" style="margin-top: 2rem; padding-top: 1rem; border-top: 1px solid #e0e0e0;">
                    ${booking.status === 'accepted' ? 
                        '<div style="display: flex; flex-direction: column; gap: 1rem;"><div style="display: flex; align-items: center; gap: 0.5rem; color: #27ae60; font-weight: 600;"><span style="font-size: 1.2rem;">✅</span> Booking Already Accepted</div><button class="btn-primary" onclick="completeBooking(\'' + booking.id + '\')" style="background-color: #3498db;">Complete Booking</button></div>' : 
                        '<button class="btn-success" onclick="acceptBookingFromModal(\'' + booking.id + '\')" style="margin-right: 1rem;">Accept Booking</button>'
                    }
                    <button class="btn-secondary" onclick="closeBookingModal()">Close</button>
                </div>
            </div>
        `;

        // Show modal
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.id = 'bookingDetailsModal';
        modal.style.display = 'block';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Booking Details</h2>
                    <span class="close">&times;</span>
                </div>
                <div class="modal-body">
                    ${detailsHtml}
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';

        // Close modal functionality
        const closeBtn = modal.querySelector('.close');
        closeBtn.onclick = function() {
            closeBookingModal();
        };

        modal.onclick = function(e) {
            if (e.target === modal) {
                closeBookingModal();
            }
        };
    };

    // Accept booking from modal
    window.acceptBookingFromModal = async function(bookingId) {
        // Check if booking is already accepted
        const booking = bookings.find(b => b.id === bookingId);
        if (booking && booking.status === 'accepted') {
            alert('This booking has already been accepted!');
            return;
        }
        
        if (confirm('Are you sure you want to accept this booking?')) {
            try {
                // Close modal immediately for better UX
                closeBookingModal();
                
                // Show loading state
                const loadingToast = document.createElement('div');
                loadingToast.style.cssText = `
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: #3498db;
                    color: white;
                    padding: 1rem 1.5rem;
                    border-radius: 8px;
                    z-index: 10000;
                    font-weight: 500;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                `;
                loadingToast.textContent = 'Accepting booking...';
                document.body.appendChild(loadingToast);
                
                // Update booking status
                await updateDoc(doc(db, 'bookings', bookingId), {
                    status: 'accepted',
                    updatedAt: new Date()
                });
                
                // Mark booking dates as unavailable in calendar
                await markBookingDatesUnavailable(booking);
                
                // Remove loading toast
                document.body.removeChild(loadingToast);
                
                // Show success toast
                const successToast = document.createElement('div');
                successToast.style.cssText = `
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: #27ae60;
                    color: white;
                    padding: 1rem 1.5rem;
                    border-radius: 8px;
                    z-index: 10000;
                    font-weight: 500;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                `;
                successToast.textContent = 'Booking accepted successfully!';
                document.body.appendChild(successToast);
                
                // Remove success toast after 3 seconds
                setTimeout(() => {
                    if (document.body.contains(successToast)) {
                        document.body.removeChild(successToast);
                    }
                }, 3000);
                
                // Trigger notification for booking status update
                if (window.addNotification) {
                    window.addNotification({
                        title: 'Booking Accepted',
                        message: `Booking #${bookingId} has been accepted`,
                        type: 'status_update',
                        icon: 'checkmark',
                        bookingId: bookingId
                    });
                }
                
                // Refresh bookings table
                await loadBookings();
                
                // Reapply current filter
                const statusFilter = document.getElementById('statusFilter');
                if (statusFilter) {
                    filterBookings(statusFilter.value);
                }
                
                // Update dashboard stats
                updateDashboardStats();
                
            } catch (error) {
                console.error('Error accepting booking:', error);
                
                // Remove loading toast if it exists
                const loadingToast = document.querySelector('[style*="Accepting booking"]');
                if (loadingToast) {
                    document.body.removeChild(loadingToast);
                }
                
                // Show error toast
                const errorToast = document.createElement('div');
                errorToast.style.cssText = `
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: #e74c3c;
                    color: white;
                    padding: 1rem 1.5rem;
                    border-radius: 8px;
                    z-index: 10000;
                    font-weight: 500;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                `;
                errorToast.textContent = 'Error accepting booking. Please try again.';
                document.body.appendChild(errorToast);
                
                // Remove error toast after 5 seconds
                setTimeout(() => {
                    if (document.body.contains(errorToast)) {
                        document.body.removeChild(errorToast);
                    }
                }, 5000);
            }
        }
    };

    // Restore booking dates availability in calendar
    async function restoreBookingDatesAvailability(booking) {
        try {
            if (!booking.checkIn || !booking.checkOut) {
                console.log('Booking missing check-in or check-out dates');
                return;
            }
            
            console.log('Restoring availability for booking dates:', booking.checkIn, booking.checkOut);
            
            // Parse dates - they should be ISO strings (YYYY-MM-DD)
            const checkInDate = new Date(booking.checkIn);
            const checkOutDate = new Date(booking.checkOut);
            
            // Validate dates
            if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
                console.error('Invalid dates:', booking.checkIn, booking.checkOut);
                return;
            }
            
            // Generate all dates between check-in and check-out (excluding check-out)
            const datesToRestore = [];
            const currentDate = new Date(checkInDate);
            
            while (currentDate < checkOutDate) {
                const dateString = formatDateString(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
                datesToRestore.push(dateString);
                currentDate.setDate(currentDate.getDate() + 1);
            }
            
            console.log('Restoring availability for dates:', datesToRestore);
            
            // Remove each date from availability collection (making them available again)
            const promises = datesToRestore.map(dateString => {
                const docRef = doc(db, 'availability', dateString);
                return deleteDoc(docRef);
            });
            
            await Promise.all(promises);
            console.log('Successfully restored booking dates availability');
            
            // Refresh calendar if it exists
            console.log('Refreshing calendar after availability restoration...');
            if (window.calendar && window.calendar.loadAvailabilityData) {
                await window.calendar.loadAvailabilityData();
                if (window.calendar.generateCalendar) {
                    window.calendar.generateCalendar();
                }
                console.log('Calendar refreshed after availability restoration');
            } else {
                console.log('Calendar functions not available for restoration');
            }
            
        } catch (error) {
            console.error('Error restoring booking dates availability:', error);
        }
    }

    // Mark booking dates as unavailable in calendar
    async function markBookingDatesUnavailable(booking) {
        try {
            if (!booking.checkIn || !booking.checkOut) {
                console.log('Booking missing check-in or check-out dates');
                return;
            }
            
            console.log('Booking dates:', booking.checkIn, booking.checkOut);
            console.log('Booking object:', booking);
            
            // Parse dates - handle both Timestamp objects and strings
            let checkInDate, checkOutDate;
            
            if (booking.checkIn && booking.checkIn.toDate) {
                // Firestore Timestamp object
                checkInDate = booking.checkIn.toDate();
                console.log('Check-in is Firestore Timestamp:', booking.checkIn);
            } else {
                // String or other format
                checkInDate = new Date(booking.checkIn);
                console.log('Check-in is string/other:', booking.checkIn);
            }
            
            if (booking.checkOut && booking.checkOut.toDate) {
                // Firestore Timestamp object
                checkOutDate = booking.checkOut.toDate();
                console.log('Check-out is Firestore Timestamp:', booking.checkOut);
            } else {
                // String or other format
                checkOutDate = new Date(booking.checkOut);
                console.log('Check-out is string/other:', booking.checkOut);
            }
            
            console.log('Parsed check-in date:', checkInDate);
            console.log('Parsed check-out date:', checkOutDate);
            
            // Validate dates
            if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
                console.error('Invalid dates:', booking.checkIn, booking.checkOut);
                return;
            }
            
            // Generate all dates between check-in and check-out (excluding check-out)
            const datesToMark = [];
            const currentDate = new Date(checkInDate);
            
            while (currentDate < checkOutDate) {
                const dateString = formatDateString(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
                datesToMark.push(dateString);
                console.log('Adding date to mark unavailable:', dateString, 'from', currentDate);
                currentDate.setDate(currentDate.getDate() + 1);
            }
            
            console.log('Marking dates as unavailable:', datesToMark);
            
            // Mark each date as unavailable in Firebase
            const promises = datesToMark.map(dateString => {
                const docRef = doc(db, 'availability', dateString);
                return setDoc(docRef, {
                    status: 'unavailable',
                    bookingId: booking.id,
                    guestName: booking.guestName,
                    updatedAt: new Date()
                });
            });
            
            await Promise.all(promises);
            console.log('Successfully marked booking dates as unavailable');
            
            // Refresh calendar if it exists
            console.log('Checking calendar availability...');
            console.log('window.calendar:', window.calendar);
            console.log('loadAvailabilityData function:', window.calendar?.loadAvailabilityData);
            console.log('generateCalendar function:', window.calendar?.generateCalendar);
            
            if (window.calendar && window.calendar.loadAvailabilityData) {
                console.log('Loading availability data...');
                await window.calendar.loadAvailabilityData();
                console.log('Availability data loaded, generating calendar...');
                if (window.calendar.generateCalendar) {
                    window.calendar.generateCalendar();
                    console.log('Calendar regenerated');
                }
            } else {
                console.log('Calendar functions not available');
            }
            
            // Force calendar refresh with a delay to ensure Firebase data is updated
            setTimeout(async () => {
                console.log('Force refreshing calendar after delay...');
                if (window.calendar && window.calendar.loadAvailabilityData) {
                    await window.calendar.loadAvailabilityData();
                    if (window.calendar.generateCalendar) {
                        window.calendar.generateCalendar();
                        console.log('Calendar force refreshed');
                    }
                }
            }, 2000);
            
        } catch (error) {
            console.error('Error marking booking dates as unavailable:', error);
        }
    }
    
    // Helper function to format date string (matches calendar.js format)
    function formatDateString(year, month, day) {
        return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }

    // Close booking modal
    window.closeBookingModal = function() {
        // Close the booking details modal specifically
        const bookingModal = document.getElementById('bookingDetailsModal');
        if (bookingModal) {
            document.body.removeChild(bookingModal);
            document.body.style.overflow = 'auto';
        } else {
            // Fallback: close any modal
        const modal = document.querySelector('.modal');
        if (modal) {
            document.body.removeChild(modal);
            document.body.style.overflow = 'auto';
            }
        }
    };
    
    // Debug booking data structure
    window.debugBookingData = function(bookingId) {
        const booking = bookings.find(b => b.id === bookingId);
        if (booking) {
            console.log('Booking data structure:', booking);
            console.log('Check-in field:', booking.checkIn);
            console.log('Check-out field:', booking.checkOut);
            console.log('Check-in type:', typeof booking.checkIn);
            console.log('Check-out type:', typeof booking.checkOut);
            console.log('All booking fields:', Object.keys(booking));
        } else {
            console.log('Booking not found:', bookingId);
        }
    };

    // Manual calendar refresh
    window.refreshCalendar = async function() {
        console.log('Manually refreshing calendar...');
        if (window.calendar && window.calendar.loadAvailabilityData) {
            await window.calendar.loadAvailabilityData();
            if (window.calendar.generateCalendar) {
                window.calendar.generateCalendar();
                console.log('Calendar manually refreshed');
            }
        } else {
            console.log('Calendar functions not available');
        }
    };

    // Test calendar availability update
    window.testCalendarUpdate = async function() {
        console.log('Testing calendar availability update...');
        
        // Test with October 30-31, 2025
        const testDates = ['2025-10-30', '2025-10-31'];
        
        try {
            const promises = testDates.map(dateString => {
                const docRef = doc(db, 'availability', dateString);
                return setDoc(docRef, {
                    status: 'unavailable',
                    bookingId: 'test123',
                    guestName: 'Test Booking',
                    updatedAt: new Date()
                });
            });
            
            await Promise.all(promises);
            console.log('Test dates marked as unavailable:', testDates);
            
            // Refresh calendar
            if (window.calendar && window.calendar.loadAvailabilityData) {
                await window.calendar.loadAvailabilityData();
                if (window.calendar.generateCalendar) {
                    window.calendar.generateCalendar();
                }
                console.log('Calendar refreshed after test update');
            }
            
        } catch (error) {
            console.error('Test calendar update failed:', error);
        }
    };

    // Manual booking update function (for debugging)
    window.manualUpdateBooking = async function(bookingId, newStatus) {
        try {
            console.log('Manual update:', bookingId, newStatus);
            
            if (!db || !doc || !setDoc) {
                throw new Error('Firebase not initialized');
            }
            
            const bookingRef = doc(db, 'bookings', bookingId);
            await setDoc(bookingRef, {
                status: newStatus,
                updatedAt: new Date()
            }, { merge: true });
            
            console.log('Manual update successful');
            alert(`Booking ${bookingId} updated to ${newStatus}`);
            
            // Reload bookings
            await loadBookings();
            
        } catch (error) {
            console.error('Manual update failed:', error);
            alert(`Manual update failed: ${error.message}`);
        }
    };
});

