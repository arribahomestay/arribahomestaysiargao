// Calendar Management JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Wait for Firebase to be available
    waitForFirebase().then(() => {
        initializeCalendarApp();
    });
});

function waitForFirebase() {
    return new Promise((resolve) => {
        const checkFirebase = () => {
            if (typeof window.db !== 'undefined' && typeof window.setDoc !== 'undefined') {
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
let selectedDates = new Set();
let availabilityData = {}; // Store availability data from Firebase

// Calendar elements
let calendarGrid, currentMonthYear, prevMonthBtn, nextMonthBtn;
let selectedDatesCount, setAvailableBtn, setUnavailableBtn, clearSelectionBtn;

function initializeCalendarApp() {
    // Get calendar elements
    calendarGrid = document.getElementById('calendarGrid');
    currentMonthYear = document.getElementById('currentMonthYear');
    prevMonthBtn = document.getElementById('prevMonthBtn');
    nextMonthBtn = document.getElementById('nextMonthBtn');
    selectedDatesCount = document.getElementById('selectedDatesCount');
    setAvailableBtn = document.getElementById('setAvailableBtn');
    setUnavailableBtn = document.getElementById('setUnavailableBtn');
    clearSelectionBtn = document.getElementById('clearSelectionBtn');
    
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
    updateSelectedDatesCount();
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
    
    // Availability actions
    const setAvailableBtn = document.getElementById('setAvailableBtn');
    if (setAvailableBtn) {
        setAvailableBtn.addEventListener('click', () => {
            setAvailability('available');
        });
    }
    
    if (setUnavailableBtn) {
        setUnavailableBtn.addEventListener('click', () => {
            setAvailability('unavailable');
        });
    }
    
    if (clearSelectionBtn) {
        clearSelectionBtn.addEventListener('click', () => {
            clearSelection();
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
        } else {
            // Default to available (green) if no data exists
            dayElement.classList.add('available');
        }
        
        // Add click event
        dayElement.addEventListener('click', () => {
            toggleDateSelection(dateString, dayElement);
        });
        
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

function toggleDateSelection(dateString, dayElement) {
    console.log('Date clicked:', dateString);
    console.log('Current selectedDates:', Array.from(selectedDates));
    
    if (selectedDates.has(dateString)) {
        selectedDates.delete(dateString);
        dayElement.classList.remove('selected');
        console.log('Date removed from selection');
    } else {
        selectedDates.add(dateString);
        dayElement.classList.add('selected');
        console.log('Date added to selection');
    }
    
    console.log('Updated selectedDates:', Array.from(selectedDates));
    updateSelectedDatesCount();
    updateActionButtons();
}

function updateSelectedDatesCount() {
    if (selectedDatesCount) {
        const count = selectedDates.size;
        selectedDatesCount.textContent = `${count} date${count !== 1 ? 's' : ''} selected`;
    }
}

function updateActionButtons() {
    const hasSelection = selectedDates.size > 0;
    
    const setAvailableBtn = document.getElementById('setAvailableBtn');
    if (setAvailableBtn) {
        setAvailableBtn.disabled = !hasSelection;
    }
    
    if (setUnavailableBtn) {
        setUnavailableBtn.disabled = !hasSelection;
    }
    
    if (clearSelectionBtn) {
        clearSelectionBtn.disabled = !hasSelection;
    }
}

function setAvailability(status) {
    console.log('setAvailability called with status:', status);
    console.log('selectedDates.size:', selectedDates.size);
    console.log('selectedDates contents:', Array.from(selectedDates));
    
    if (selectedDates.size === 0) {
        console.log('No dates selected, returning early');
        alert('Please select dates first');
        return;
    }
    
    // Update local data
    selectedDates.forEach(dateString => {
        if (status === 'available') {
            // Remove from database (default to available)
            delete availabilityData[dateString];
        } else {
            // Mark as unavailable
            availabilityData[dateString] = status;
        }
    });
    
    // Update visual state
    selectedDates.forEach(dateString => {
        const dayElement = document.querySelector(`[data-date="${dateString}"]`);
        if (dayElement) {
            // Remove existing availability classes
            dayElement.classList.remove('available', 'unavailable');
            // Add new availability class
            dayElement.classList.add(status);
        }
    });
    
    // Store the count before clearing
    const selectedCount = selectedDates.size;
    
    // Save to Firebase
    saveAvailabilityData();
    
    // Clear selection
    clearSelection();
    
    alert(`${selectedCount} date${selectedCount !== 1 ? 's' : ''} set to ${status}`);
}

function clearSelection() {
    selectedDates.forEach(dateString => {
        const dayElement = document.querySelector(`[data-date="${dateString}"]`);
        if (dayElement) {
            dayElement.classList.remove('selected');
        }
    });
    
    selectedDates.clear();
    updateSelectedDatesCount();
    updateActionButtons();
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
        const availabilityRef = window.collection(window.db, 'availability');
        const snapshot = await window.getDocs(availabilityRef);
        
        availabilityData = {};
        snapshot.forEach(doc => {
            availabilityData[doc.id] = doc.data().status;
        });
        
        console.log('Availability data loaded:', availabilityData);
    } catch (error) {
        console.error('Error loading availability data:', error);
    }
}

async function saveAvailabilityData() {
    try {
        const promises = [];
        
        // Process all dates that were selected
        selectedDates.forEach(dateString => {
            if (availabilityData[dateString]) {
                // Date is unavailable - save to database
                const docRef = window.doc(window.db, 'availability', dateString);
                promises.push(window.setDoc(docRef, {
                    status: availabilityData[dateString],
                    updatedAt: new Date()
                }));
            } else {
                // Date is available - delete from database (if it exists)
                const docRef = window.doc(window.db, 'availability', dateString);
                promises.push(window.deleteDoc(docRef).catch(error => {
                    // Ignore error if document doesn't exist
                    if (error.code !== 'not-found') {
                        console.error('Error deleting availability document:', error);
                    }
                }));
            }
        });
        
        await Promise.all(promises);
        console.log('Availability data saved successfully');
    } catch (error) {
        console.error('Error saving availability data:', error);
        alert('Error saving availability data. Please try again.');
    }
}

// Make functions available globally
window.calendar = {
    loadAvailabilityData,
    saveAvailabilityData,
    generateCalendar
};
