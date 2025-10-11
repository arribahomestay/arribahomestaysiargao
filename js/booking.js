// Booking Page JavaScript - Mobile Device Compatible

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, waiting for Firebase...');
    
    // Wait for Firebase to be fully loaded on mobile devices
    waitForFirebaseOnMobile().then(() => {
        console.log('Firebase ready, initializing booking page...');
        initializeBookingPage();
    }).catch((error) => {
        console.error('Firebase failed to load:', error);
        showFirebaseError();
    });
});

// Wait for Firebase to be fully loaded on mobile devices
function waitForFirebaseOnMobile() {
    return new Promise((resolve, reject) => {
        let attempts = 0;
        const maxAttempts = 50; // 5 seconds max wait
        
        const checkFirebase = () => {
            attempts++;
            console.log(`Firebase check attempt ${attempts}/${maxAttempts}`);
            
            // Check if Firebase is loaded
            if (typeof window.db !== 'undefined' && 
                typeof window.addDoc !== 'undefined' && 
                typeof window.collection !== 'undefined' &&
                window.firebaseInitialized !== false) {
                
                console.log('Firebase is ready!');
                resolve();
                return;
            }
            
            if (attempts >= maxAttempts) {
                console.error('Firebase failed to load after maximum attempts');
                reject(new Error('Firebase initialization timeout'));
                return;
            }
            
            // Wait 100ms before next check
            setTimeout(checkFirebase, 100);
        };
        
        checkFirebase();
    });
}

// Show Firebase error message
function showFirebaseError() {
    const form = document.getElementById('bookingForm');
    if (form) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            background: #f8d7da;
            color: #721c24;
            padding: 1rem;
            margin: 1rem 0;
            border-radius: 8px;
            border: 1px solid #f5c6cb;
        `;
        errorDiv.innerHTML = `
            <strong>Service Unavailable</strong><br>
            The booking service is temporarily unavailable. Please refresh the page and try again.
            <br><br>
            <button onclick="window.location.reload()" style="background: #dc3545; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer;">
                Refresh Page
            </button>
        `;
        form.parentNode.insertBefore(errorDiv, form);
    }
}

// Initialize booking page after Firebase is ready
function initializeBookingPage() {
    console.log('Initializing booking page...');
    
    // Get Firebase functions
    const db = window.db;
    const addDoc = window.addDoc;
    const getDocs = window.getDocs;
    const collection = window.collection;
    const query = window.query;
    const orderBy = window.orderBy;

    // Global variables
    let rooms = [];
    let currentBooking = null;
    let availabilityData = {}; // Store availability data from Firebase

    // Check if device is mobile and iOS Safari
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isIOSSafari = /iPad|iPhone|iPod/.test(navigator.userAgent) && /Safari/.test(navigator.userAgent);
    console.log('Device type:', isMobile ? 'Mobile' : 'Desktop');
    console.log('iOS Safari:', isIOSSafari);
    
    // Setup event listeners and validation
    setupEventListeners();
    loadAvailabilityData().then(() => {
        setupDateValidation();
    });
    setupFormValidation();
    
    // Mobile-specific optimizations
    if (isMobile) {
        setupMobileOptimizations();
    }
    
    // iOS Safari specific optimizations
    if (isIOSSafari) {
        setupIOSOptimizations();
    }
    
    // Initial summary update with delay for mobile devices
    setTimeout(() => {
        updateBookingSummary();
    }, isMobile ? 1000 : 500);
    
    console.log('Booking page initialization complete');


    // iOS Safari specific optimizations
    function setupIOSOptimizations() {
        console.log('Setting up iOS Safari optimizations...');
        
        // Add iOS Safari specific CSS classes
        document.body.classList.add('ios-safari');
        
        // Fix iOS Safari modal z-index issues
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.style.zIndex = '999999';
            modal.style.position = 'fixed';
            modal.style.webkitTransform = 'translateZ(0)';
            modal.style.transform = 'translateZ(0)';
        });
        
        // iOS Safari specific touch handling
        const form = document.getElementById('bookingForm');
        if (form) {
            form.addEventListener('touchstart', function(e) {
                // Prevent iOS Safari zoom on form inputs
                if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') {
                    e.target.style.fontSize = '16px';
                }
            }, { passive: true });
        }
        
        console.log('iOS Safari optimizations complete');
    }

    // Setup mobile-specific optimizations
    function setupMobileOptimizations() {
        console.log('Setting up mobile optimizations...');
        
        // Add mobile-specific meta tags if not present
        const viewport = document.querySelector('meta[name="viewport"]');
        if (viewport) {
            viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
        }
        
        // Add mobile-specific CSS classes
        document.body.classList.add('mobile-device');
        
        // Optimize form inputs for mobile
        const inputs = document.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.classList.add('mobile-optimized');
            
            // Add mobile-specific event listeners
            input.addEventListener('focus', function() {
                // Prevent zoom on iOS
                if (this.type === 'date' || this.type === 'number') {
                    this.style.fontSize = '16px';
                }
            });
        });
        
        // Add mobile-specific touch handlers
        const form = document.getElementById('bookingForm');
        if (form) {
            form.addEventListener('touchstart', function(e) {
                // Add touch feedback
                if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') {
                    e.target.style.backgroundColor = '#f8f9fa';
                }
            });
            
            form.addEventListener('touchend', function(e) {
                // Remove touch feedback
                if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') {
                    setTimeout(() => {
                        e.target.style.backgroundColor = '';
                    }, 150);
                }
            });
        }
        
        console.log('Mobile optimizations complete');
    }

    // Setup event listeners - Mobile Device Compatible
    function setupEventListeners() {
        console.log('Setting up event listeners...');
        
        // Form submission
        const form = document.getElementById('bookingForm');
        if (form) {
            form.addEventListener('submit', handleBookingSubmit);
            console.log('Form submission listener added');
        } else {
            console.error('Booking form not found!');
        }

        // Form field changes for summary update - Enhanced for mobile devices
        const formFields = ['checkInDate', 'checkOutDate', 'guests', 'extraBed'];
        formFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                console.log(`Setting up listeners for ${fieldId}`);
                
                // Mobile device specific event handling
                if (isMobile) {
                    // Mobile devices require specific event handling with delays
                    field.addEventListener('change', function() {
                        console.log(`${fieldId} changed`);
                        setTimeout(updateBookingSummary, 200);
                    });
                    field.addEventListener('input', function() {
                        console.log(`${fieldId} input`);
                        setTimeout(updateBookingSummary, 200);
                    });
                    field.addEventListener('blur', function() {
                        console.log(`${fieldId} blur`);
                        setTimeout(updateBookingSummary, 200);
                    });
                    // Mobile touch events
                    field.addEventListener('touchend', function() {
                        console.log(`${fieldId} touchend`);
                        setTimeout(updateBookingSummary, 200);
                    });
                } else {
                    // Standard event listeners for desktop
                    field.addEventListener('change', updateBookingSummary);
                    field.addEventListener('input', updateBookingSummary);
                    field.addEventListener('blur', updateBookingSummary);
                }
            } else {
                console.error(`Field ${fieldId} not found!`);
            }
        });

        // Modal controls
        setupModalControls();
        console.log('Event listeners setup complete');
    }

    // Setup modal controls
    function setupModalControls() {
        const modal = document.getElementById('successModal');
        const closeBtn = document.querySelector('.close');

        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            });
        }

        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.style.display = 'none';
                    document.body.style.overflow = 'auto';
                }
            });
        }
    }

    // Load availability data from Firebase
    async function loadAvailabilityData() {
        try {
            console.log('Loading availability data for booking form...');
            const availabilityRef = collection(db, 'availability');
            const snapshot = await getDocs(availabilityRef);
            
            availabilityData = {};
            snapshot.forEach(doc => {
                availabilityData[doc.id] = doc.data().status;
                console.log(`Loaded: ${doc.id} = ${doc.data().status}`);
            });
            
            console.log('Availability data loaded for booking form:', availabilityData);
            console.log('Total documents loaded:', snapshot.size);
        } catch (error) {
            console.error('Error loading availability data:', error);
        }
    }

    // Check if a date is available
    function isDateAvailable(dateString) {
        // If no availability data exists for this date, default to available
        if (!availabilityData[dateString]) {
            return true;
        }
        // Check if the status is 'available' (not 'unavailable')
        return availabilityData[dateString] === 'available';
    }

    // Add visual indicators to date inputs
    function addDateInputStyling() {
        const checkInDate = document.getElementById('checkInDate');
        const checkOutDate = document.getElementById('checkOutDate');
        
        // Add event listeners for visual feedback
        [checkInDate, checkOutDate].forEach(input => {
            input.addEventListener('focus', function() {
                this.style.borderColor = '#3498db';
            });
            
            input.addEventListener('blur', function() {
                if (this.value && !isDateAvailable(this.value)) {
                    this.style.borderColor = '#e74c3c';
                    this.style.backgroundColor = '#fdf2f2';
                } else {
                    this.style.borderColor = '#ddd';
                    this.style.backgroundColor = 'white';
                }
            });
            
            input.addEventListener('change', function() {
                if (this.value && !isDateAvailable(this.value)) {
                    this.style.borderColor = '#e74c3c';
                    this.style.backgroundColor = '#fdf2f2';
                } else {
                    this.style.borderColor = '#27ae60';
                    this.style.backgroundColor = '#f0fff4';
                }
            });
        });
    }

    // Replace native date inputs with custom date pickers
    function replaceDateInputsWithCustomPickers() {
        const checkInDate = document.getElementById('checkInDate');
        const checkOutDate = document.getElementById('checkOutDate');
        
        // Create custom date picker containers
        const checkInContainer = createCustomDatePicker(checkInDate, 'checkInDate');
        const checkOutContainer = createCustomDatePicker(checkOutDate, 'checkOutDate');
        
        // Replace the original inputs
        checkInDate.parentNode.replaceChild(checkInContainer, checkInDate);
        checkOutDate.parentNode.replaceChild(checkOutContainer, checkOutDate);
    }

    // Create a custom date picker that integrates with availability
    function createCustomDatePicker(originalInput, inputId) {
        const container = document.createElement('div');
        container.className = 'custom-date-picker';
        container.style.position = 'relative';
        
        // Create the display input
        const displayInput = document.createElement('input');
        displayInput.type = 'text';
        displayInput.id = inputId;
        displayInput.name = originalInput.name;
        displayInput.required = originalInput.required;
        displayInput.placeholder = 'dd/mm/yyyy';
        displayInput.readOnly = true;
        displayInput.style.width = '100%';
        displayInput.style.padding = '12px';
        displayInput.style.border = '1px solid #ddd';
        displayInput.style.borderRadius = '4px';
        displayInput.style.fontSize = '14px';
        displayInput.style.cursor = 'pointer';
        
        // Create calendar icon
        const calendarIcon = document.createElement('span');
        calendarIcon.innerHTML = '📅';
        calendarIcon.style.position = 'absolute';
        calendarIcon.style.right = '10px';
        calendarIcon.style.top = '50%';
        calendarIcon.style.transform = 'translateY(-50%)';
        calendarIcon.style.cursor = 'pointer';
        calendarIcon.style.fontSize = '16px';
        
        // Create dropdown calendar
        const calendarDropdown = document.createElement('div');
        calendarDropdown.className = 'calendar-dropdown';
        calendarDropdown.style.display = 'none';
        calendarDropdown.style.position = 'absolute';
        calendarDropdown.style.top = '100%';
        calendarDropdown.style.left = '0';
        calendarDropdown.style.right = '0';
        calendarDropdown.style.backgroundColor = 'white';
        calendarDropdown.style.border = '1px solid #ddd';
        calendarDropdown.style.borderRadius = '4px';
        calendarDropdown.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
        calendarDropdown.style.zIndex = '1000';
        calendarDropdown.style.padding = '10px';
        
        // Add click handlers
        displayInput.addEventListener('click', () => toggleCalendar(calendarDropdown));
        calendarIcon.addEventListener('click', () => toggleCalendar(calendarDropdown));
        
        // Generate calendar content
        generateCalendarContent(calendarDropdown, displayInput, inputId);
        
        // Close calendar when clicking outside
        document.addEventListener('click', (e) => {
            if (!container.contains(e.target)) {
                calendarDropdown.style.display = 'none';
            }
        });
        
        container.appendChild(displayInput);
        container.appendChild(calendarIcon);
        container.appendChild(calendarDropdown);
        
        return container;
    }

    // Toggle calendar visibility
    function toggleCalendar(calendarDropdown) {
        calendarDropdown.style.display = calendarDropdown.style.display === 'none' ? 'block' : 'none';
    }

    // Generate calendar content with availability integration
    function generateCalendarContent(container, displayInput, inputId) {
        const today = new Date();
        let currentDate = new Date(today);
        
        // Calendar header
        const header = document.createElement('div');
        header.style.display = 'flex';
        header.style.justifyContent = 'space-between';
        header.style.alignItems = 'center';
        header.style.marginBottom = '10px';
        
        const prevBtn = document.createElement('button');
        prevBtn.innerHTML = '←';
        prevBtn.style.border = 'none';
        prevBtn.style.background = 'none';
        prevBtn.style.cursor = 'pointer';
        prevBtn.style.fontSize = '16px';
        
        const monthYear = document.createElement('span');
        monthYear.style.fontWeight = 'bold';
        
        const nextBtn = document.createElement('button');
        nextBtn.innerHTML = '→';
        nextBtn.style.border = 'none';
        nextBtn.style.background = 'none';
        nextBtn.style.cursor = 'pointer';
        nextBtn.style.fontSize = '16px';
        
        header.appendChild(prevBtn);
        header.appendChild(monthYear);
        header.appendChild(nextBtn);
        
        // Calendar grid
        const grid = document.createElement('div');
        grid.style.display = 'grid';
        grid.style.gridTemplateColumns = 'repeat(7, 1fr)';
        grid.style.gap = '2px';
        
        // Day headers
        const dayHeaders = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
        dayHeaders.forEach(day => {
            const header = document.createElement('div');
            header.textContent = day;
            header.style.textAlign = 'center';
            header.style.fontWeight = 'bold';
            header.style.padding = '5px';
            header.style.fontSize = '12px';
            grid.appendChild(header);
        });
        
        function updateCalendar() {
            grid.innerHTML = '';
            
            // Add day headers
            dayHeaders.forEach(day => {
                const header = document.createElement('div');
                header.textContent = day;
                header.style.textAlign = 'center';
                header.style.fontWeight = 'bold';
                header.style.padding = '5px';
                header.style.fontSize = '12px';
                grid.appendChild(header);
            });
            
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth();
            monthYear.textContent = `${getMonthName(month)} ${year}`;
            
            const firstDay = new Date(year, month, 1);
            const lastDay = new Date(year, month + 1, 0);
            const daysInMonth = lastDay.getDate();
            const startingDayOfWeek = firstDay.getDay();
            
            // Add empty cells for days before the first day
            for (let i = 0; i < startingDayOfWeek; i++) {
                const emptyDay = document.createElement('div');
                emptyDay.style.height = '30px';
                grid.appendChild(emptyDay);
            }
            
            // Add days of the month
            for (let day = 1; day <= daysInMonth; day++) {
                const dayElement = document.createElement('div');
                dayElement.textContent = day;
                dayElement.style.textAlign = 'center';
                dayElement.style.padding = '5px';
                dayElement.style.cursor = 'pointer';
                dayElement.style.borderRadius = '3px';
                dayElement.style.fontSize = '12px';
                
                const dateString = formatDateString(year, month, day);
                
                // Check if date is available
                if (isDateAvailable(dateString)) {
                    dayElement.style.backgroundColor = '#e8f5e8';
                    dayElement.style.color = '#2d5a2d';
                } else {
                    dayElement.style.backgroundColor = '#ffe8e8';
                    dayElement.style.color = '#8b0000';
                    dayElement.style.cursor = 'not-allowed';
                }
                
                // Check if date is in the past
                const dateObj = new Date(year, month, day);
                if (dateObj < today) {
                    dayElement.style.backgroundColor = '#f5f5f5';
                    dayElement.style.color = '#999';
                    dayElement.style.cursor = 'not-allowed';
                }
                
                dayElement.addEventListener('click', () => {
                    if (isDateAvailable(dateString) && dateObj >= today) {
                        displayInput.value = formatDateForDisplay(dateString);
                        displayInput.dataset.value = dateString;
                        container.style.display = 'none';
                        
                        // Trigger change event for form validation
                        const event = new Event('change', { bubbles: true });
                        displayInput.dispatchEvent(event);
                    }
                });
                
                grid.appendChild(dayElement);
            }
        }
        
        // Navigation handlers
        prevBtn.addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() - 1);
            updateCalendar();
        });
        
        nextBtn.addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() + 1);
            updateCalendar();
        });
        
        container.appendChild(header);
        container.appendChild(grid);
        
        updateCalendar();
    }

    // Helper functions
    function getMonthName(month) {
        const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        return months[month];
    }

    function formatDateString(year, month, day) {
        return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }

    function formatDateForDisplay(dateString) {
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year}`;
    }

    // Setup date validation with availability checking
    function setupDateValidation() {
        const checkInDate = document.getElementById('checkInDate');
        const checkOutDate = document.getElementById('checkOutDate');

        // Set minimum date to today
        const today = new Date().toISOString().split('T')[0];
        checkInDate.min = today;
        
        // Add visual styling for date inputs
        addDateInputStyling();
        
        // Check if device is mobile - use native date picker for better mobile experience
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        if (isMobile) {
            console.log('Mobile device detected, using native date picker');
            // For mobile devices, use native date picker but add mobile-specific styling
            setupMobileDateInputs(checkInDate, checkOutDate);
        } else {
            // For desktop, use custom date picker
            replaceDateInputsWithCustomPickers();
        }

        // Enhanced date change handlers for mobile compatibility
        const handleCheckInChange = function() {
            const checkInValue = this.dataset.value || this.value;
            if (checkInValue) {
                // Validate check-in date availability
                if (!isDateAvailable(checkInValue)) {
                    alert('Selected check-in date is not available. Please choose another date.');
                    this.value = '';
                    this.dataset.value = '';
                    return;
                }

                const nextDay = new Date(checkInValue);
                nextDay.setDate(nextDay.getDate() + 1);
                checkOutDate.min = nextDay.toISOString().split('T')[0];
                
                // Clear checkout date if it's before the new minimum
                if (checkOutDate.dataset.value && checkOutDate.dataset.value <= checkInValue) {
                    checkOutDate.value = '';
                    checkOutDate.dataset.value = '';
                }
            }
            updateBookingSummary();
        };

        const handleCheckOutChange = function() {
            const checkOutValue = this.dataset.value || this.value;
            if (checkOutValue) {
                // Validate check-out date availability
                if (!isDateAvailable(checkOutValue)) {
                    alert('Selected check-out date is not available. Please choose another date.');
                    this.value = '';
                    this.dataset.value = '';
                    return;
                }

                // Check if any dates in the range are unavailable
                const checkInValue = checkInDate.dataset.value || checkInDate.value;
                if (checkInValue) {
                    const startDate = new Date(checkInValue);
                    const endDate = new Date(checkOutValue);
                    
                    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
                        const dateString = d.toISOString().split('T')[0];
                        if (!isDateAvailable(dateString)) {
                            alert(`Date ${dateString} is not available. Please choose different dates.`);
                            this.value = '';
                            this.dataset.value = '';
                            return;
                        }
                    }
                }
            }
            updateBookingSummary();
        };

        // Add multiple event listeners for better mobile compatibility
        checkInDate.addEventListener('change', handleCheckInChange);
        checkInDate.addEventListener('input', handleCheckInChange);
        checkInDate.addEventListener('blur', handleCheckInChange);
        
        checkOutDate.addEventListener('change', handleCheckOutChange);
        checkOutDate.addEventListener('input', handleCheckOutChange);
        checkOutDate.addEventListener('blur', handleCheckOutChange);
        
        // For mobile devices, also listen to touch events
        if ('ontouchstart' in window) {
            checkInDate.addEventListener('touchend', handleCheckInChange);
            checkOutDate.addEventListener('touchend', handleCheckOutChange);
        }
    }

    // Setup mobile-optimized date inputs
    function setupMobileDateInputs(checkInDate, checkOutDate) {
        // Add mobile-specific styling
        checkInDate.style.fontSize = '16px'; // Prevents zoom on iOS
        checkOutDate.style.fontSize = '16px';
        
        // Add mobile-specific attributes
        checkInDate.setAttribute('data-mobile', 'true');
        checkOutDate.setAttribute('data-mobile', 'true');
        
        // Add visual feedback for mobile
        [checkInDate, checkOutDate].forEach(input => {
            input.addEventListener('focus', function() {
                this.style.borderColor = '#3498db';
                this.style.backgroundColor = '#f8f9fa';
            });
            
            input.addEventListener('blur', function() {
                if (this.value && !isDateAvailable(this.value)) {
                    this.style.borderColor = '#e74c3c';
                    this.style.backgroundColor = '#fdf2f2';
                } else {
                    this.style.borderColor = '#27ae60';
                    this.style.backgroundColor = '#f0fff4';
                }
            });
        });
    }

    // Setup form validation
    function setupFormValidation() {
        const form = document.getElementById('bookingForm');
        const inputs = form.querySelectorAll('input, select, textarea');

        inputs.forEach(input => {
            input.addEventListener('blur', validateField);
            input.addEventListener('input', clearFieldError);
        });
    }

    // Validate individual field
    function validateField(e) {
        const field = e.target;
        const value = field.value.trim();

        // Remove existing error styling
        field.classList.remove('error');

        // Required field validation
        if (field.hasAttribute('required') && !value) {
            showFieldError(field, 'This field is required');
            return false;
        }

        // Email validation
        if (field.type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                showFieldError(field, 'Please enter a valid email address');
                return false;
            }
        }

        // Phone validation
        if (field.type === 'tel' && value) {
            const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
            if (!phoneRegex.test(value)) {
                showFieldError(field, 'Please enter a valid phone number');
                return false;
            }
        }

        // Number validation
        if (field.type === 'number' && value) {
            const num = parseFloat(value);
            if (isNaN(num) || num < 0) {
                showFieldError(field, 'Please enter a valid number');
                return false;
            }
        }

        return true;
    }

    // Show field error
    function showFieldError(field, message) {
        field.classList.add('error');
        
        // Remove existing error message
        const existingError = field.parentNode.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }

        // Add new error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        errorDiv.style.color = '#e74c3c';
        errorDiv.style.fontSize = '0.8rem';
        errorDiv.style.marginTop = '0.25rem';
        field.parentNode.appendChild(errorDiv);
    }

    // Clear field error
    function clearFieldError(e) {
        const field = e.target;
        field.classList.remove('error');
        
        const errorMessage = field.parentNode.querySelector('.error-message');
        if (errorMessage) {
            errorMessage.remove();
        }
    }

    // Update booking summary - Enhanced for mobile compatibility
    function updateBookingSummary() {
        try {
            console.log('Updating booking summary...');
            
            const checkInInput = document.getElementById('checkInDate');
            const checkOutInput = document.getElementById('checkOutDate');
            const guestsInput = document.getElementById('guests');
            const extraBedInput = document.getElementById('extraBed');
            
            if (!checkInInput || !checkOutInput || !guestsInput || !extraBedInput) {
                console.error('Required form elements not found');
                return;
            }
            
            // Get values with fallbacks for mobile compatibility
            const checkInDate = checkInInput?.dataset?.value || checkInInput?.value || '';
            const checkOutDate = checkOutInput?.dataset?.value || checkOutInput?.value || '';
            const guests = parseInt(guestsInput?.value) || 0;
            const extraBed = extraBedInput?.checked ? 1 : 0;

            console.log('Summary values:', { checkInDate, checkOutDate, guests, extraBed });

            // Update summary fields with null checks
            const summaryGuests = document.getElementById('summaryGuests');
            const summaryExtraBeds = document.getElementById('summaryExtraBeds');
            const summaryDuration = document.getElementById('summaryDuration');
            const summaryRoomFee = document.getElementById('summaryRoomFee');
            const summaryExtraBedFee = document.getElementById('summaryExtraBedFee');
            const summaryTotalFee = document.getElementById('summaryTotalFee');

            if (summaryGuests) summaryGuests.textContent = guests || '-';
            if (summaryExtraBeds) summaryExtraBeds.textContent = extraBed || '0';

            // Calculate duration and fees
            if (checkInDate && checkOutDate) {
                const checkIn = new Date(checkInDate);
                const checkOut = new Date(checkOutDate);
                
                // Validate dates
                if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
                    console.log('Invalid dates detected');
                    resetSummaryDisplay();
                    return;
                }
                
                const duration = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
                
                if (duration <= 0) {
                    console.log('Invalid duration:', duration);
                    resetSummaryDisplay();
                    return;
                }
                
                if (summaryDuration) summaryDuration.textContent = `${duration} night${duration !== 1 ? 's' : ''}`;
                
                // Calculate fees
                const roomFeePerNight = 3300;
                const extraBedFeePerBed = 300;
                
                const roomFee = duration * roomFeePerNight;
                const extraBedFee = extraBed * extraBedFeePerBed;
                const totalFee = roomFee + extraBedFee;
                
                console.log('Calculated fees:', { duration, roomFee, extraBedFee, totalFee });
                
                // Update fee displays with formatting
                if (summaryRoomFee) summaryRoomFee.textContent = `₱${roomFee.toLocaleString()}`;
                if (summaryExtraBedFee) summaryExtraBedFee.textContent = `₱${extraBedFee.toLocaleString()}`;
                if (summaryTotalFee) summaryTotalFee.innerHTML = `<strong>₱${totalFee.toLocaleString()}</strong>`;
                
                // Add visual feedback for mobile
                if (summaryTotalFee) {
                    summaryTotalFee.style.animation = 'none';
                    setTimeout(() => {
                        summaryTotalFee.style.animation = 'pulse 0.5s ease-in-out';
                    }, 10);
                }
            } else {
                console.log('Missing dates, resetting summary');
                resetSummaryDisplay();
            }
        } catch (error) {
            console.error('Error updating booking summary:', error);
            resetSummaryDisplay();
        }
    }

    // Reset summary display to default values
    function resetSummaryDisplay() {
        const summaryDuration = document.getElementById('summaryDuration');
        const summaryRoomFee = document.getElementById('summaryRoomFee');
        const summaryExtraBedFee = document.getElementById('summaryExtraBedFee');
        const summaryTotalFee = document.getElementById('summaryTotalFee');

        if (summaryDuration) summaryDuration.textContent = '-';
        if (summaryRoomFee) summaryRoomFee.textContent = '₱0';
        if (summaryExtraBedFee) summaryExtraBedFee.textContent = '₱0';
        if (summaryTotalFee) summaryTotalFee.innerHTML = '<strong>₱0</strong>';
    }

    // Handle booking form submission - Enhanced for mobile compatibility
    async function handleBookingSubmit(e) {
        e.preventDefault();
        
        console.log('Booking form submission started...');
        
        // Show loading state
        const submitBtn = document.getElementById('submitBooking');
        const originalText = submitBtn?.textContent;
        if (submitBtn) {
            submitBtn.textContent = 'Processing...';
            submitBtn.disabled = true;
        }

        try {
            // Validate all fields
            const form = e.target;
            const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
            let isValid = true;

            inputs.forEach(input => {
                if (!validateField({ target: input })) {
                    isValid = false;
                }
            });

            if (!isValid) {
                throw new Error('Please fill in all required fields correctly.');
            }

            // Get form data with mobile compatibility
            const formData = new FormData(form);
            
            // Validate availability for selected dates - Enhanced for mobile
            const checkInInput = document.getElementById('checkInDate');
            const checkOutInput = document.getElementById('checkOutDate');
            
            if (!checkInInput || !checkOutInput) {
                throw new Error('Date inputs not found');
            }
            
            // Get dates with multiple fallbacks for mobile compatibility
            let checkInDate = checkInInput?.dataset?.value || checkInInput?.value || formData.get('checkInDate');
            let checkOutDate = checkOutInput?.dataset?.value || checkOutInput?.value || formData.get('checkOutDate');
        
        console.log('Date values:', { 
            checkInDate, 
            checkOutDate, 
            datasetValue: checkInInput?.dataset?.value,
            inputValue: checkInInput?.value 
        });
        
        // Validate dates exist
        if (!checkInDate || !checkOutDate) {
            alert('Please select both check-in and check-out dates.');
            return;
        }
        
        // Validate date format and availability
        if (!isDateAvailable(checkInDate)) {
            alert('Selected check-in date is no longer available. Please choose another date.');
            return;
        }
        
        if (!isDateAvailable(checkOutDate)) {
            alert('Selected check-out date is no longer available. Please choose another date.');
            return;
        }
        
        // Check if any dates in the range are unavailable
        const startDate = new Date(checkInDate);
        const endDate = new Date(checkOutDate);
        
        // Validate date objects
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            alert('Invalid date format. Please select valid dates.');
            return;
        }
        
        // Check date range validity
        if (startDate >= endDate) {
            alert('Check-out date must be after check-in date.');
            return;
        }
        
        for (let d = new Date(startDate); d < endDate; d.setDate(d.getDate() + 1)) {
            const dateString = d.toISOString().split('T')[0];
            if (!isDateAvailable(dateString)) {
                alert(`Date ${dateString} is no longer available. Please choose different dates.`);
                return;
            }
        }
        
        // Calculate fees with validation
        const duration = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
        const extraBed = parseInt(formData.get('extraBed')) || 0;
        const guests = parseInt(formData.get('guests')) || 1;
        
        if (duration <= 0) {
            alert('Invalid booking duration. Please check your dates.');
            return;
        }
        
        const roomFeePerNight = 3300;
        const extraBedFeePerBed = 300;
        const roomFee = duration * roomFeePerNight;
        const extraBedFee = extraBed * extraBedFeePerBed;
        const totalFee = roomFee + extraBedFee;
        
        console.log('Calculated booking details:', { duration, guests, extraBed, roomFee, extraBedFee, totalFee });
        
        const bookingData = {
            guestName: formData.get('fullName'),
            email: formData.get('email'),
            countryCode: formData.get('countryCode'),
            phoneNumber: formData.get('phoneNumber'),
            phone: `${formData.get('countryCode')} ${formData.get('phoneNumber')}`,
            checkIn: checkInDate,
            checkOut: checkOutDate,
            guests: guests,
            extraBed: extraBed,
            specialRequests: formData.get('specialRequests') || '',
            duration: duration,
            roomFeePerNight: roomFeePerNight,
            extraBedFeePerBed: extraBedFeePerBed,
            roomFee: roomFee,
            extraBedFee: extraBedFee,
            totalFee: totalFee,
            status: 'pending',
            createdAt: new Date(),
            updatedAt: new Date(),
            // Add mobile-specific metadata
            userAgent: navigator.userAgent,
            isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
        };

        // Show loading state with mobile-optimized feedback
        const submitBtn = document.getElementById('submitBtn');
        const submitText = document.getElementById('submitText');
        const submitLoading = document.getElementById('submitLoading');
        
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.style.opacity = '0.7';
        }
        if (submitText) submitText.style.display = 'none';
        if (submitLoading) submitLoading.style.display = 'inline-block';

        try {
            // Save booking to Firestore - iOS Safari Compatible
            console.log('Attempting to save booking:', bookingData);
            
            // Check if Firebase is available with iOS Safari compatibility
            if (!window.firebaseInitialized || !db || !addDoc || !collection) {
                throw new Error('Firebase not initialized - iOS Safari compatibility issue');
            }
            
            // iOS Safari specific Firebase handling
            if (window.isIOSSafari) {
                // Add retry logic for iOS Safari
                let retryCount = 0;
                const maxRetries = 3;
                
                while (retryCount < maxRetries) {
                    try {
                        const docRef = await addDoc(collection(db, 'bookings'), bookingData);
                        console.log('Booking saved successfully with ID:', docRef.id);
                        
                        // Store booking data for success modal
                        currentBooking = bookingData;
                        
                        // Trigger notification for admin with iOS Safari compatibility
                        if (window.addBookingNotification) {
                            console.log('Triggering admin notification...');
                            setTimeout(() => {
                                window.addBookingNotification(bookingData, docRef.id);
                            }, 100);
                        }
                        
                        // Show success modal with iOS Safari compatibility
                        setTimeout(() => {
                            showSuccessModal(bookingData);
                        }, 100);
                        
                        // Reset form manually to preserve custom date picker data
                        setTimeout(() => {
                            resetBookingForm();
                            updateBookingSummary();
                        }, 200);
                        
                        console.log('Booking submission completed successfully on iOS Safari');
                        break;
                        
                    } catch (retryError) {
                        retryCount++;
                        console.log(`Firebase retry ${retryCount}/${maxRetries}:`, retryError);
                        if (retryCount >= maxRetries) {
                            throw retryError;
                        }
                        await new Promise(resolve => setTimeout(resolve, 500));
                    }
                }
            } else {
                // Standard Firebase handling for other browsers
                const docRef = await addDoc(collection(db, 'bookings'), bookingData);
                console.log('Booking saved successfully with ID:', docRef.id);
                
                // Store booking data for success modal
                currentBooking = bookingData;
                
                // Trigger notification for admin
                if (window.addBookingNotification) {
                    console.log('Triggering admin notification...');
                    window.addBookingNotification(bookingData, docRef.id);
                }
                
                // Show success modal
                showSuccessModal(bookingData);
                
                // Reset form manually to preserve custom date picker data
                resetBookingForm();
                updateBookingSummary();
                
                console.log('Booking submission completed successfully');
            }
            
        } catch (error) {
            console.error('Error saving booking:', error);
            
            // More detailed error handling for mobile devices
            let errorMessage = 'Error submitting booking. Please try again.';
            
            if (error.code === 'permission-denied') {
                errorMessage = 'Permission denied. Please check Firebase security rules.';
            } else if (error.code === 'unavailable') {
                errorMessage = 'Service temporarily unavailable. Please check your internet connection and try again.';
            } else if (error.code === 'invalid-argument') {
                errorMessage = 'Invalid data provided. Please check your input.';
            } else if (error.message.includes('Firebase not initialized')) {
                errorMessage = 'Service not available. Please refresh the page and try again.';
            } else if (error.message.includes('Date inputs not found')) {
                errorMessage = 'Form error. Please refresh the page and try again.';
            } else if (error.message.includes('Required form elements not found')) {
                errorMessage = 'Form error. Please refresh the page and try again.';
            }
            
            // Show error with mobile-friendly alert
            alert(errorMessage);
            
        } finally {
            // Reset button state with mobile compatibility
            const submitBtn = document.getElementById('submitBooking');
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.style.opacity = '1';
                submitBtn.textContent = originalText || 'Submit Booking';
            }
            
            // Reset other button elements if they exist
            const submitText = document.getElementById('submitText');
            const submitLoading = document.getElementById('submitLoading');
            if (submitText) submitText.style.display = 'inline';
            if (submitLoading) submitLoading.style.display = 'none';
        }
    }

    // Show success modal - iOS Safari Compatible
    function showSuccessModal(bookingData) {
        console.log('Showing success modal...');
        const modal = document.getElementById('successModal');
        const bookingDetails = document.getElementById('bookingDetails');
        
        if (!modal || !bookingDetails) {
            console.error('Modal elements not found');
            return;
        }
        
        // Populate booking details
        bookingDetails.innerHTML = `
            <div class="detail-item">
                <strong>Name:</strong> ${bookingData.guestName}
            </div>
            <div class="detail-item">
                <strong>Email:</strong> ${bookingData.email}
            </div>
            <div class="detail-item">
                <strong>Phone:</strong> ${bookingData.phone}
            </div>
            <div class="detail-item">
                <strong>Check-in:</strong> ${formatDate(bookingData.checkIn)}
            </div>
            <div class="detail-item">
                <strong>Check-out:</strong> ${formatDate(bookingData.checkOut)}
            </div>
            <div class="detail-item">
                <strong>Duration:</strong> ${bookingData.duration} night${bookingData.duration !== 1 ? 's' : ''}
            </div>
            <div class="detail-item">
                <strong>Guests:</strong> ${bookingData.guests}
            </div>
            <div class="detail-item">
                <strong>Extra Beds:</strong> ${bookingData.extraBed}
            </div>
            <div class="detail-item">
                <strong>Room Fee:</strong> ₱${bookingData.roomFee.toLocaleString()}
            </div>
            <div class="detail-item">
                <strong>Extra Bed Fee:</strong> ₱${bookingData.extraBedFee.toLocaleString()}
            </div>
            <div class="detail-item" style="border-top: 1px solid #ddd; padding-top: 10px; margin-top: 10px;">
                <strong>Total Fee:</strong> ₱${bookingData.totalFee.toLocaleString()}
            </div>
        `;
        
        // iOS Safari specific modal handling
        if (window.isIOSSafari) {
            // Force iOS Safari to recognize the modal
            modal.style.zIndex = '999999';
            modal.style.position = 'fixed';
            modal.style.webkitTransform = 'translateZ(0)';
            modal.style.transform = 'translateZ(0)';
            modal.style.display = 'block';
            modal.style.opacity = '0';
            
            // Animate in for iOS Safari
            setTimeout(() => {
                modal.style.opacity = '1';
                modal.style.transition = 'opacity 0.3s ease';
            }, 10);
            
            // Force repaint
            modal.offsetHeight;
        } else {
            // Standard modal display
            modal.style.display = 'block';
        }
        
        document.body.style.overflow = 'hidden';
        console.log('Success modal displayed');
    }

    // Print booking function
    window.printBooking = function() {
        if (currentBooking) {
            const printWindow = window.open('', '_blank');
            printWindow.document.write(`
                <html>
                    <head>
                        <title>Booking Confirmation - ARRIBA HOMESTAY</title>
                        <style>
                            body { font-family: Arial, sans-serif; margin: 20px; }
                            .header { text-align: center; margin-bottom: 30px; }
                            .booking-details { margin: 20px 0; }
                            .detail-item { margin: 10px 0; }
                            .total { font-weight: bold; font-size: 1.2em; }
                        </style>
                    </head>
                    <body>
                        <div class="header">
                            <h1>ARRIBA HOMESTAY</h1>
                            <h2>Booking Confirmation</h2>
                        </div>
                        <div class="booking-details">
                            <div class="detail-item"><strong>Name:</strong> ${currentBooking.guestName}</div>
                            <div class="detail-item"><strong>Email:</strong> ${currentBooking.email}</div>
                            <div class="detail-item"><strong>Phone:</strong> ${currentBooking.phone}</div>
                            <div class="detail-item"><strong>Check-in:</strong> ${formatDate(currentBooking.checkIn)}</div>
                            <div class="detail-item"><strong>Check-out:</strong> ${formatDate(currentBooking.checkOut)}</div>
                            <div class="detail-item"><strong>Duration:</strong> ${currentBooking.duration} night${currentBooking.duration !== 1 ? 's' : ''}</div>
                            <div class="detail-item"><strong>Guests:</strong> ${currentBooking.guests}</div>
                            <div class="detail-item"><strong>Extra Beds:</strong> ${currentBooking.extraBed}</div>
                            <div class="detail-item"><strong>Room Fee:</strong> ₱${currentBooking.roomFee.toLocaleString()}</div>
                            <div class="detail-item"><strong>Extra Bed Fee:</strong> ₱${currentBooking.extraBedFee.toLocaleString()}</div>
                            <div class="detail-item"><strong>Total Fee:</strong> ₱${currentBooking.totalFee.toLocaleString()}</div>
                            <div class="detail-item"><strong>Special Requests:</strong> ${currentBooking.specialRequests || 'None'}</div>
                        </div>
                        <p><strong>Status:</strong> Pending Confirmation</p>
                        <p>Thank you for choosing ARRIBA HOMESTAY!</p>
                    </body>
                </html>
            `);
            printWindow.document.close();
            printWindow.print();
        }
    };

    // Reset booking form manually
    function resetBookingForm() {
        const form = document.getElementById('bookingForm');
        const inputs = form.querySelectorAll('input, select, textarea');
        
        inputs.forEach(input => {
            if (input.type === 'checkbox' || input.type === 'radio') {
                input.checked = false;
            } else {
                input.value = '';
                // Clear dataset values for custom date pickers
                if (input.dataset.value) {
                    input.dataset.value = '';
                }
            }
        });
        
        // Reset custom date picker displays
        const checkInInput = document.getElementById('checkInDate');
        const checkOutInput = document.getElementById('checkOutDate');
        if (checkInInput) {
            checkInInput.value = '';
            checkInInput.dataset.value = '';
        }
        if (checkOutInput) {
            checkOutInput.value = '';
            checkOutInput.dataset.value = '';
        }
    }

    // Utility functions
    function formatDate(dateString) {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    // Debug function for mobile troubleshooting
    window.debugBookingForm = function() {
        console.log('=== Booking Form Debug Info ===');
        console.log('Device:', /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ? 'Mobile' : 'Desktop');
        console.log('User Agent:', navigator.userAgent);
        console.log('Firebase available:', !!window.db);
        console.log('Form elements:');
        
        const form = document.getElementById('bookingForm');
        if (form) {
            const inputs = form.querySelectorAll('input, select, textarea');
            inputs.forEach(input => {
                console.log(`${input.id}:`, {
                    value: input.value,
                    datasetValue: input.dataset.value,
                    type: input.type,
                    required: input.required
                });
            });
        }
        
        console.log('Availability data loaded:', Object.keys(availabilityData).length, 'dates');
        console.log('Current booking summary:');
        updateBookingSummary();
        
        console.log('=== End Debug Info ===');
    };

    // Test booking submission (for debugging)
    window.testBookingSubmission = function() {
        console.log('Testing booking submission...');
        
        // Fill form with test data
        document.getElementById('fullName').value = 'Test User';
        document.getElementById('email').value = 'test@example.com';
        document.getElementById('countryCode').value = '+63';
        document.getElementById('phoneNumber').value = '9123456789';
        document.getElementById('checkInDate').value = '2025-02-01';
        document.getElementById('checkOutDate').value = '2025-02-03';
        document.getElementById('guests').value = '2';
        document.getElementById('extraBed').value = '1';
        
        // Update summary
        updateBookingSummary();
        
        console.log('Test data filled. You can now submit the form manually.');
    };
});













