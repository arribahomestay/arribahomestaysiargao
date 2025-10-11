// Booking Page JavaScript - Mobile Device Compatible
console.log('🚀 BOOKING.JS LOADED - Version 1.0.2');

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
}

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
        console.log('🔍 Found booking form:', form);
        console.log('🔍 Form action:', form.action);
        console.log('🔍 Form method:', form.method);
        
        form.addEventListener('submit', function(e) {
            console.log('🚀 FORM SUBMIT EVENT TRIGGERED!');
            handleBookingSubmit(e);
        });
        
        console.log('✅ Form submission listener added successfully');
    } else {
        console.error('❌ Booking form not found!');
    }

    // Form field changes for summary update - Enhanced for mobile devices
        const formFields = ['checkInDate', 'checkOutDate', 'guests', 'extraBed'];
        formFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
            console.log(`Setting up listeners for ${fieldId}`);
            
            // Mobile device specific event handling
            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
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

// Setup date validation
function setupDateValidation() {
    console.log('Setting up date validation...');
    
        const checkInDate = document.getElementById('checkInDate');
        const checkOutDate = document.getElementById('checkOutDate');
        
    if (checkInDate && checkOutDate) {
        // Set minimum date to today
        const today = new Date().toISOString().split('T')[0];
        checkInDate.min = today;
        checkOutDate.min = today;
        
        // Add change listeners for date validation
        checkInDate.addEventListener('change', function() {
            if (this.value) {
                checkOutDate.min = this.value;
            updateBookingSummary();
            }
        });

        checkOutDate.addEventListener('change', function() {
            if (this.value) {
                updateBookingSummary();
            }
        });
        
        console.log('Date validation setup complete');
    }
    }

    // Setup form validation
    function setupFormValidation() {
    console.log('Setting up form validation...');
    
        const form = document.getElementById('bookingForm');
    if (form) {
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', validateField);
            input.addEventListener('input', function() {
                // Remove error styling on input
                this.classList.remove('error');
                const errorMsg = this.parentNode.querySelector('.field-error');
                if (errorMsg) {
                    errorMsg.remove();
                }
            });
        });
        
        console.log('Form validation setup complete');
    }
}

// Validate individual form field
function validateField(event) {
    const field = event.target;
        const value = field.value.trim();

        // Remove existing error styling
        field.classList.remove('error');
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }

    // Check if field is required and empty
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
        const phoneRegex = /^[\d\s\-\+\(\)]+$/;
        if (!phoneRegex.test(value) || value.length < 7) {
                showFieldError(field, 'Please enter a valid phone number');
                return false;
            }
        }
    
    // Date validation
    if (field.type === 'date' && value) {
        const selectedDate = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (selectedDate < today) {
            showFieldError(field, 'Please select a future date');
                return false;
            }
        }

        // Number validation
        if (field.type === 'number' && value) {
        const num = parseInt(value);
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
        const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
        errorDiv.textContent = message;
        field.parentNode.appendChild(errorDiv);
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
        const extraBed = parseInt(extraBedInput?.value) || 0;

        console.log('Summary values:', { checkInDate, checkOutDate, guests, extraBed });
        console.log('Guests input element:', guestsInput);
        console.log('Guests input value:', guestsInput?.value);
        console.log('Parsed guests value:', guests);

        // Update summary fields with null checks
        const summaryGuests = document.getElementById('summaryGuests');
        const summaryExtraBeds = document.getElementById('summaryExtraBeds');
        const summaryDuration = document.getElementById('summaryDuration');
        const summaryRoomFee = document.getElementById('summaryRoomFee');
        const summaryExtraBedFee = document.getElementById('summaryExtraBedFee');
        const summaryTotalFee = document.getElementById('summaryTotalFee');

        if (summaryGuests) summaryGuests.textContent = guests > 0 ? guests : '-';
        if (summaryExtraBeds) summaryExtraBeds.textContent = extraBed > 0 ? extraBed : '0';

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
            
            if (summaryRoomFee) summaryRoomFee.textContent = `₱${roomFee.toLocaleString()}`;
            if (summaryExtraBedFee) summaryExtraBedFee.textContent = `₱${extraBedFee.toLocaleString()}`;
            if (summaryTotalFee) summaryTotalFee.innerHTML = `<strong>₱${totalFee.toLocaleString()}</strong>`;
            
            console.log('Summary updated successfully');
        } else {
            resetSummaryDisplay();
        }
        
    } catch (error) {
        console.error('Error updating booking summary:', error);
        resetSummaryDisplay();
    }
}

// Reset summary display
function resetSummaryDisplay() {
    const summaryGuests = document.getElementById('summaryGuests');
    const summaryExtraBeds = document.getElementById('summaryExtraBeds');
    const summaryDuration = document.getElementById('summaryDuration');
    const summaryRoomFee = document.getElementById('summaryRoomFee');
    const summaryExtraBedFee = document.getElementById('summaryExtraBedFee');
    const summaryTotalFee = document.getElementById('summaryTotalFee');
    
    if (summaryGuests) summaryGuests.textContent = '-';
    if (summaryExtraBeds) summaryExtraBeds.textContent = '0';
    if (summaryDuration) summaryDuration.textContent = '-';
    if (summaryRoomFee) summaryRoomFee.textContent = '₱0';
    if (summaryExtraBedFee) summaryExtraBedFee.textContent = '₱0';
    if (summaryTotalFee) summaryTotalFee.innerHTML = '<strong>₱0</strong>';
}

// Handle booking form submission - Enhanced for mobile compatibility
    async function handleBookingSubmit(e) {
        e.preventDefault();

    console.log('🚀 BOOKING FORM SUBMISSION STARTED - handleBookingSubmit called!');
    
    // Show loading state
    const submitBtn = document.getElementById('submitBtn');
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
            inputValue: checkInInput?.value,
            formDataValue: formData.get('checkInDate')
        });
        
        // Validate dates exist
        if (!checkInDate || !checkOutDate) {
            throw new Error('Please select both check-in and check-out dates.');
        }
        
        // Validate date format and range
        const startDate = new Date(checkInDate);
        const endDate = new Date(checkOutDate);
        
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            throw new Error('Invalid date format. Please select valid dates.');
        }
        
        // Check date range validity
        if (startDate >= endDate) {
            throw new Error('Check-out date must be after check-in date.');
        }
        
        // Check availability for each date
        for (let d = new Date(startDate); d < endDate; d.setDate(d.getDate() + 1)) {
            const dateString = d.toISOString().split('T')[0];
            if (!isDateAvailable(dateString)) {
                throw new Error(`Date ${dateString} is no longer available. Please choose different dates.`);
            }
        }
        
        // Calculate fees with validation
        const duration = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
        const extraBed = parseInt(formData.get('extraBed')) || 0;
        const guests = parseInt(formData.get('guests')) || 1;
        
        if (duration <= 0) {
            throw new Error('Invalid booking duration. Please check your dates.');
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
        const submitText = document.getElementById('submitText');
        const submitLoading = document.getElementById('submitLoading');
        
        if (submitText) submitText.style.display = 'none';
        if (submitLoading) submitLoading.style.display = 'inline-block';

        // Save booking to Firestore - Mobile Device Compatible
            console.log('Attempting to save booking:', bookingData);
        
        // Check if Firebase is available with mobile compatibility
        if (!window.db || !window.addDoc || !window.collection) {
            throw new Error('Firebase not initialized - mobile device compatibility issue');
        }
        
        // Mobile device specific Firebase handling
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        if (isMobile) {
            // Add retry logic for mobile devices
            let retryCount = 0;
            const maxRetries = 3;
            
            while (retryCount < maxRetries) {
                try {
                    const docRef = await window.addDoc(window.collection(window.db, 'bookings'), bookingData);
                    console.log('Booking saved successfully with ID:', docRef.id);
                    
                    // Store booking data for success modal
                    currentBooking = bookingData;
                    
                    // Trigger notification for admin with mobile compatibility
                    if (window.addBookingNotification) {
                        console.log('Triggering admin notification...');
                        setTimeout(() => {
                            window.addBookingNotification(bookingData, docRef.id);
                        }, 200);
                    }
                    
                    // Show success modal with mobile compatibility
                    console.log('📱 Mobile: About to show success modal in 200ms...');
                    setTimeout(() => {
                        console.log('📱 Mobile: Calling showSuccessModal now!');
                        showSuccessModal(bookingData);
                    }, 200);
                    
                    // Reset form manually to preserve custom date picker data
                    setTimeout(() => {
                        resetBookingForm();
                        updateBookingSummary();
                    }, 300);
                    
                    console.log('Booking submission completed successfully on mobile device');
                    break;
                    
                } catch (retryError) {
                    retryCount++;
                    console.log(`Firebase retry ${retryCount}/${maxRetries}:`, retryError);
                    if (retryCount >= maxRetries) {
                        throw retryError;
                    }
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }
        } else {
            // Standard Firebase handling for desktop
            const docRef = await window.addDoc(window.collection(window.db, 'bookings'), bookingData);
            console.log('Booking saved successfully with ID:', docRef.id);
            
            // Store booking data for success modal
            currentBooking = bookingData;
            
            // Trigger notification for admin
            if (window.addBookingNotification) {
                console.log('Triggering admin notification...');
                window.addBookingNotification(bookingData, docRef.id);
            }
            
            // Show success modal
            console.log('🖥️ Desktop: About to show success modal...');
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
        const submitBtn = document.getElementById('submitBtn');
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
    console.log('🎉 SHOWING SUCCESS MODAL - bookingData:', bookingData);
        const modal = document.getElementById('successModal');
        const bookingDetails = document.getElementById('bookingDetails');
    
    console.log('Modal element:', modal);
    console.log('Booking details element:', bookingDetails);
    
    if (!modal || !bookingDetails) {
        console.error('❌ Modal elements not found - modal:', modal, 'bookingDetails:', bookingDetails);
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
            <strong>Check-in:</strong> ${bookingData.checkIn}
            </div>
            <div class="detail-item">
            <strong>Check-out:</strong> ${bookingData.checkOut}
            </div>
            <div class="detail-item">
                <strong>Guests:</strong> ${bookingData.guests}
            </div>
            <div class="detail-item">
                <strong>Extra Beds:</strong> ${bookingData.extraBed}
            </div>
            <div class="detail-item">
            <strong>Total Fee:</strong> ₱${bookingData.totalFee.toLocaleString()}
            </div>
        ${bookingData.specialRequests ? `
            <div class="detail-item">
            <strong>Special Requests:</strong> ${bookingData.specialRequests}
            </div>
        ` : ''}
    `;
    
    // iOS Safari specific modal handling
    const isIOSSafari = /iPad|iPhone|iPod/.test(navigator.userAgent) && /Safari/.test(navigator.userAgent);
    if (isIOSSafari) {
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

// Reset booking form
    function resetBookingForm() {
    console.log('Resetting booking form...');
    
        const form = document.getElementById('bookingForm');
    if (form) {
        form.reset();
        
        // Clear any custom date picker values
        const checkInDate = document.getElementById('checkInDate');
        const checkOutDate = document.getElementById('checkOutDate');
        
        if (checkInDate) {
            checkInDate.value = '';
            if (checkInDate.dataset) {
                checkInDate.dataset.value = '';
            }
        }
        
        if (checkOutDate) {
            checkOutDate.value = '';
            if (checkOutDate.dataset) {
                checkOutDate.dataset.value = '';
            }
        }
        
        // Remove any error styling
        const errorElements = form.querySelectorAll('.error');
        errorElements.forEach(element => element.classList.remove('error'));
        
        const errorMessages = form.querySelectorAll('.field-error');
        errorMessages.forEach(message => message.remove());
        
        console.log('Booking form reset complete');
    }
}