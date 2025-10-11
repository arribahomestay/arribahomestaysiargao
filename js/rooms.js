// Rooms Page JavaScript

let allRooms = [];
let currentFilter = 'recent';

document.addEventListener('DOMContentLoaded', function() {
    // Wait for Firebase to be available
    waitForFirebase().then(() => {
        loadRooms();
        setupFilterButtons();
    });
});

function waitForFirebase() {
    return new Promise((resolve) => {
        const checkFirebase = () => {
            if (typeof window.db !== 'undefined' && typeof window.getDocs !== 'undefined') {
                resolve();
            } else {
                setTimeout(checkFirebase, 100);
            }
        };
        checkFirebase();
    });
}

async function loadRooms() {
    try {
        console.log('Loading rooms from Firebase...');
        console.log('Firebase db:', window.db);
        console.log('Firebase collection:', window.collection);
        
        const roomsRef = window.collection(window.db, 'rooms');
        console.log('Rooms ref:', roomsRef);
        
        const snapshot = await window.getDocs(roomsRef);
        console.log('Snapshot:', snapshot);
        console.log('Snapshot empty:', snapshot.empty);
        console.log('Snapshot size:', snapshot.size);
        
        const roomsGrid = document.getElementById('roomsGrid');
        
        if (snapshot.empty) {
            console.log('No rooms found in database');
            roomsGrid.innerHTML = `
                <div class="no-rooms-message">
                    <h3>No Rooms Available</h3>
                    <p>Please check back later or contact us for availability.</p>
                </div>
            `;
            return;
        }
        
        roomsGrid.innerHTML = '';
        allRooms = [];
        
        snapshot.forEach(doc => {
            console.log('Room doc:', doc.id, doc.data());
            const room = { id: doc.id, ...doc.data() };
            allRooms.push(room);
        });
        
        // Sort rooms by creation date (most recent first)
        allRooms.sort((a, b) => {
            const dateA = a.createdAt ? a.createdAt.toDate() : new Date(0);
            const dateB = b.createdAt ? b.createdAt.toDate() : new Date(0);
            return dateB - dateA;
        });
        
        // Display rooms with numbering
        displayRooms(allRooms);
        
        console.log(`Successfully loaded ${snapshot.size} rooms`);
    } catch (error) {
        console.error('Error loading rooms:', error);
        console.error('Error details:', error.message);
        console.error('Error code:', error.code);
        
        const roomsGrid = document.getElementById('roomsGrid');
        roomsGrid.innerHTML = `
            <div class="no-rooms-message">
                <h3>Error Loading Rooms</h3>
                <p>Please refresh the page or try again later.</p>
                <p style="font-size: 0.8rem; color: #999;">Error: ${error.message}</p>
            </div>
        `;
    }
}

function displayRooms(rooms) {
    const roomsGrid = document.getElementById('roomsGrid');
    roomsGrid.innerHTML = '';
    
    rooms.forEach((room, index) => {
        const roomCard = createRoomCard(room, index + 1);
        roomsGrid.appendChild(roomCard);
    });
}

function setupFilterButtons() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            
            // Get filter type
            const filterType = this.getAttribute('data-filter');
            currentFilter = filterType;
            
            // Filter and display rooms
            filterRooms(filterType);
        });
    });
}

function filterRooms(filterType) {
    let filteredRooms = [...allRooms];
    
    switch(filterType) {
        case 'recent':
            // Already sorted by creation date
            break;
        case 'low-price':
            filteredRooms.sort((a, b) => {
                const priceA = parseFloat(a.price) || 0;
                const priceB = parseFloat(b.price) || 0;
                return priceA - priceB;
            });
            break;
        case 'high-price':
            filteredRooms.sort((a, b) => {
                const priceA = parseFloat(a.price) || 0;
                const priceB = parseFloat(b.price) || 0;
                return priceB - priceA;
            });
            break;
        case 'mid-price':
            // Sort by price and take middle range
            filteredRooms.sort((a, b) => {
                const priceA = parseFloat(a.price) || 0;
                const priceB = parseFloat(b.price) || 0;
                return priceA - priceB;
            });
            // Take middle 50% of rooms
            const start = Math.floor(filteredRooms.length * 0.25);
            const end = Math.ceil(filteredRooms.length * 0.75);
            filteredRooms = filteredRooms.slice(start, end);
            break;
        case 'all':
            // Show all rooms (already sorted by recent)
            break;
    }
    
    displayRooms(filteredRooms);
}

function createRoomCard(room, roomNumber) {
    const roomCard = document.createElement('div');
    roomCard.className = 'room-card';
    
    // Create amenity tags
    const amenityTags = room.amenities && room.amenities.length > 0 
        ? room.amenities.map(amenity => `<span class="amenity-tag">${amenity}</span>`).join('')
        : '<span class="amenity-tag">Basic amenities</span>';
    
    // Create status badge
    const statusClass = room.available ? 'available' : 'unavailable';
    const statusText = room.available ? 'Available' : 'Unavailable';
    
    roomCard.innerHTML = `
        <div class="room-number">${roomNumber}</div>
        <div class="room-image">
            <span>Room Image</span>
        </div>
        <div class="room-content">
            <div class="room-header">
                <h3 class="room-name">${room.name || 'Unnamed Room'}</h3>
                <span class="room-price">₱${room.price || '0'}/night</span>
            </div>
            
            <p class="room-description">${room.description || 'Comfortable accommodation for your stay.'}</p>
            
            <div class="room-details">
                <div class="room-detail-row">
                    <div class="room-detail">
                        <svg class="room-detail-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                            <circle cx="9" cy="7" r="4"></circle>
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                        </svg>
                        <span>Max ${room.maxGuests || 'N/A'} guests</span>
                    </div>
                    <div class="room-detail">
                        <svg class="room-detail-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                            <line x1="8" y1="21" x2="16" y2="21"></line>
                            <line x1="12" y1="17" x2="12" y2="21"></line>
                        </svg>
                        <span>Standard room</span>
                    </div>
                </div>
            </div>
            
            <div class="room-amenities">
                <h4>Amenities:</h4>
                <div class="amenity-tags">
                    ${amenityTags}
                </div>
            </div>
            
            <div class="room-status ${statusClass}">
                <span>${statusText}</span>
            </div>
        </div>
    `;
    
    return roomCard;
}

// Make functions available globally
window.rooms = {
    loadRooms,
    createRoomCard
};
