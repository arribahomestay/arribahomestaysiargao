// Booking Calendar JavaScript - Read-only calendar for users

document.addEventListener('DOMContentLoaded', function() {
    // Wait for Firebase to be available
    waitForFirebase().then(() => {
        initializeBookingCalendar();
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

// Calendar state
let currentDate = new Date();
let availabilityData = {}; // Store availability data from Firebase

// Calendar elements
let calendarGrid, currentMonthYear, prevMonthBtn, nextMonthBtn;

function initializeBookingCalendar() {
    // Get calendar elements
    calendarGrid = document.getElementById('calendarGrid');
    currentMonthYear = document.getElementById('currentMonthYear');
    prevMonthBtn = document.getElementById('prevMonthBtn');
    nextMonthBtn = document.getElementById('nextMonthBtn');
    
    // Initialize calendar
    if (calendarGrid) {
        initializeCalendar();
        setupEventListeners();
        // Load availability data after calendar is generated
        loadAvailabilityData().then(() => {
            // Regenerate calendar to show loaded availability
            generateCalendar();
        });
    }
}

function initializeCalendar() {
    generateCalendar();
}

function setupEventListeners() {
    // Month navigation
    if (prevMonthBtn) {
        prevMonthBtn.addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() - 1);
            generateCalendar();
        });
    }
    
    if (nextMonthBtn) {
        nextMonthBtn.addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() + 1);
            generateCalendar();
        });
    }
}

function generateCalendar() {
    if (!calendarGrid) return;
    
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Update month/year display
    if (currentMonthYear) {
        currentMonthYear.textContent = `${getMonthName(month)} ${year}`;
    }
    
    // Clear calendar
    calendarGrid.innerHTML = '';
    
    // Add day headers
    const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    dayHeaders.forEach(day => {
        const header = document.createElement('div');
        header.className = 'calendar-day-header';
        header.textContent = day;
        calendarGrid.appendChild(header);
    });
    
    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'calendar-day other-month';
        calendarGrid.appendChild(emptyDay);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        dayElement.textContent = day;
        
        const dateString = formatDateString(year, month, day);
        dayElement.dataset.date = dateString;
        
        // Add availability class if data exists, otherwise default to available
        if (availabilityData[dateString]) {
            dayElement.classList.add(availabilityData[dateString]);
            console.log(`Applied ${availabilityData[dateString]} class to ${dateString}`);
        } else {
            // Default to available (green) if no data exists
            dayElement.classList.add('available');
        }
        
        calendarGrid.appendChild(dayElement);
    }
    
    // Add empty cells for days after the last day of the month
    const totalCells = calendarGrid.children.length - 7; // Subtract headers
    const remainingCells = 42 - totalCells; // 6 rows * 7 days
    for (let i = 0; i < remainingCells; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'calendar-day other-month';
        calendarGrid.appendChild(emptyDay);
    }
}

function formatDateString(year, month, day) {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function getMonthName(month) {
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[month];
}

// Firebase functions
async function loadAvailabilityData() {
    try {
        console.log('Loading availability data for booking calendar...');
        const availabilityRef = window.collection(window.db, 'availability');
        const snapshot = await window.getDocs(availabilityRef);
        
        availabilityData = {};
        snapshot.forEach(doc => {
            availabilityData[doc.id] = doc.data().status;
            console.log(`Loaded: ${doc.id} = ${doc.data().status}`);
        });
        
        console.log('Availability data loaded for booking calendar:', availabilityData);
        console.log('Total documents loaded:', snapshot.size);
    } catch (error) {
        console.error('Error loading availability data:', error);
    }
}

// Make functions available globally
window.bookingCalendar = {
    loadAvailabilityData,
    generateCalendar
};
