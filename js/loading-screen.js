// Loading Screen Functionality

// Show loading screen
function showLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
        loadingScreen.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
}

// Hide loading screen
function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
        loadingScreen.classList.add('hide');
        
        // Remove from DOM after animation
        setTimeout(() => {
            loadingScreen.classList.remove('show', 'hide');
            document.body.style.overflow = 'auto';
        }, 500);
    }
}

// Smooth redirect with loading screen
function redirectWithLoading(url, delay = 2000) {
    showLoadingScreen();
    
    setTimeout(() => {
        hideLoadingScreen();
        
        // Small delay before redirect to ensure smooth transition
        setTimeout(() => {
            window.location.href = url;
        }, 300);
    }, delay);
}

// Make functions available globally
window.showLoadingScreen = showLoadingScreen;
window.hideLoadingScreen = hideLoadingScreen;
window.redirectWithLoading = redirectWithLoading;

