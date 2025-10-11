// Booking Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Check if Firebase is loaded
    if (typeof window.db === 'undefined') {
        console.error('Firebase not loaded');
        return;
    }

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

    // Initialize booking page
    initializeBookingPage();

    // Initialize booking page
    function initializeBookingPage() {
        setupEventListeners();
        loadAvailabilityData().then(() => {
        setupDateValidation();
        });
        setupFormValidation();
    }

    // Setup event listeners
    function setupEventListeners() {
        // Form submission
        document.getElementById('bookingForm').addEventListener('submit', handleBookingSubmit);

        // Form field changes for summary update
        const formFields = ['checkInDate', 'checkOutDate', 'guests', 'extraBed'];
        formFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.addEventListener('change', updateBookingSummary);
            }
        });

        // Modal controls
        setupModalControls();
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
        
        // Replace native date inputs with custom date pickers
        replaceDateInputsWithCustomPickers();

        // Update checkout date minimum when check-in date changes
        checkInDate.addEventListener('change', function() {
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
        });

        checkOutDate.addEventListener('change', function() {
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

    // Update booking summary
    function updateBookingSummary() {
        const checkInInput = document.getElementById('checkInDate');
        const checkOutInput = document.getElementById('checkOutDate');
        const checkInDate = checkInInput.dataset.value || checkInInput.value;
        const checkOutDate = checkOutInput.dataset.value || checkOutInput.value;
        const guests = parseInt(document.getElementById('guests').value) || 0;
        const extraBed = parseInt(document.getElementById('extraBed').value) || 0;

        // Update summary fields
        document.getElementById('summaryGuests').textContent = guests || '-';
        document.getElementById('summaryExtraBeds').textContent = extraBed || '0';

        // Calculate duration and fees
        if (checkInDate && checkOutDate) {
            const checkIn = new Date(checkInDate);
            const checkOut = new Date(checkOutDate);
            const duration = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
            document.getElementById('summaryDuration').textContent = `${duration} night${duration !== 1 ? 's' : ''}`;
            
            // Calculate fees
            const roomFeePerNight = 3300;
            const extraBedFeePerBed = 300;
            
            const roomFee = duration * roomFeePerNight;
            const extraBedFee = extraBed * extraBedFeePerBed;
            const totalFee = roomFee + extraBedFee;
            
            // Update fee displays
            document.getElementById('summaryRoomFee').textContent = `₱${roomFee.toLocaleString()}`;
            document.getElementById('summaryExtraBedFee').textContent = `₱${extraBedFee.toLocaleString()}`;
            document.getElementById('summaryTotalFee').innerHTML = `<strong>₱${totalFee.toLocaleString()}</strong>`;
        } else {
            document.getElementById('summaryDuration').textContent = '-';
            document.getElementById('summaryRoomFee').textContent = '₱0';
            document.getElementById('summaryExtraBedFee').textContent = '₱0';
            document.getElementById('summaryTotalFee').innerHTML = '<strong>₱0</strong>';
        }
    }

    // Handle booking form submission
    async function handleBookingSubmit(e) {
        e.preventDefault();

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
            alert('Please fill in all required fields correctly.');
            return;
        }

        // Get form data
        const formData = new FormData(form);
        
        // Validate availability for selected dates
        const checkInInput = document.getElementById('checkInDate');
        const checkOutInput = document.getElementById('checkOutDate');
        const checkInDate = checkInInput.dataset.value || formData.get('checkInDate');
        const checkOutDate = checkOutInput.dataset.value || formData.get('checkOutDate');
        
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
        
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            const dateString = d.toISOString().split('T')[0];
            if (!isDateAvailable(dateString)) {
                alert(`Date ${dateString} is no longer available. Please choose different dates.`);
                return;
            }
        }
        
        // Calculate fees
        const checkIn = new Date(checkInDate);
        const checkOut = new Date(checkOutDate);
        const duration = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
        const extraBed = parseInt(formData.get('extraBed')) || 0;
        
        const roomFeePerNight = 3300;
        const extraBedFeePerBed = 300;
        const roomFee = duration * roomFeePerNight;
        const extraBedFee = extraBed * extraBedFeePerBed;
        const totalFee = roomFee + extraBedFee;
        
        // Debug date values
        console.log('Check-in date:', checkInDate);
        console.log('Check-out date:', checkOutDate);
        console.log('Check-in input dataset:', checkInInput.dataset.value);
        console.log('Check-out input dataset:', checkOutInput.dataset.value);
        
        const bookingData = {
            guestName: formData.get('fullName'),
            email: formData.get('email'),
            countryCode: formData.get('countryCode'),
            phoneNumber: formData.get('phoneNumber'),
            phone: `${formData.get('countryCode')} ${formData.get('phoneNumber')}`,
            checkIn: checkInDate, // Use the ISO date from custom picker
            checkOut: checkOutDate, // Use the ISO date from custom picker
            guests: parseInt(formData.get('guests')),
            extraBed: extraBed,
            specialRequests: formData.get('specialRequests'),
            duration: duration,
            roomFeePerNight: roomFeePerNight,
            extraBedFeePerBed: extraBedFeePerBed,
            roomFee: roomFee,
            extraBedFee: extraBedFee,
            totalFee: totalFee,
            status: 'pending',
            createdAt: new Date(),
            updatedAt: new Date()
        };

        // Show loading state
        const submitBtn = document.getElementById('submitBtn');
        const submitText = document.getElementById('submitText');
        const submitLoading = document.getElementById('submitLoading');
        
        submitBtn.disabled = true;
        submitText.style.display = 'none';
        submitLoading.style.display = 'inline-block';

        try {
            // Save booking to Firestore
            console.log('Attempting to save booking:', bookingData);
            const docRef = await addDoc(collection(db, 'bookings'), bookingData);
            console.log('Booking saved successfully with ID:', docRef.id);
            
            // Store booking data for success modal
            currentBooking = bookingData;
            
            // Trigger notification for admin
            if (window.addBookingNotification) {
                window.addBookingNotification(bookingData, docRef.id);
            }
            
            // Show success modal
            showSuccessModal(bookingData);
            
            // Reset form manually to preserve custom date picker data
            resetBookingForm();
            updateBookingSummary();
            
        } catch (error) {
            console.error('Error saving booking:', error);
            
            // More detailed error handling
            let errorMessage = 'Error submitting booking. Please try again.';
            
            if (error.code === 'permission-denied') {
                errorMessage = 'Permission denied. Please check Firebase security rules.';
            } else if (error.code === 'unavailable') {
                errorMessage = 'Service temporarily unavailable. Please try again later.';
            } else if (error.code === 'invalid-argument') {
                errorMessage = 'Invalid data provided. Please check your input.';
            }
            
            alert(errorMessage);
        } finally {
            // Reset button state
            submitBtn.disabled = false;
            submitText.style.display = 'inline';
            submitLoading.style.display = 'none';
        }
    }

    // Show success modal
    function showSuccessModal(bookingData) {
        const modal = document.getElementById('successModal');
        const bookingDetails = document.getElementById('bookingDetails');
        
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
        
        // Show modal
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
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
});













