// Main JavaScript for shared functionality

// Mobile Navigation Toggle
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenu = document.getElementById('mobile-menu');
    const navMenu = document.querySelector('.nav-menu');
    
    console.log('Mobile menu element:', mobileMenu);
    console.log('Nav menu element:', navMenu);
    
    // Only initialize mobile menu if elements exist (not on admin page)
    if (mobileMenu && navMenu) {
        // Simple and reliable click handler
        function toggleMobileMenu() {
            console.log('Toggling mobile menu...');
            const isActive = mobileMenu.classList.contains('active');
            
            if (isActive) {
                // Close menu
                mobileMenu.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.style.overflow = 'auto';
                console.log('Mobile menu closed');
            } else {
                // Open menu
                mobileMenu.classList.add('active');
                navMenu.classList.add('active');
                document.body.style.overflow = 'hidden';
                console.log('Mobile menu opened');
            }
        }
        
        // Primary click handler
        mobileMenu.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            toggleMobileMenu();
        });
        
        // Touch events for mobile
        mobileMenu.addEventListener('touchend', function(e) {
            e.preventDefault();
            e.stopPropagation();
            toggleMobileMenu();
        });
        
        // Fallback: direct event listener
        mobileMenu.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            toggleMobileMenu();
        };
        
    } else {
        // Mobile menu elements not found - this is normal for admin page
        console.log('Mobile menu elements not found (normal for admin page):', {
            mobileMenu: !!mobileMenu,
            navMenu: !!navMenu,
            currentPage: window.location.pathname
        });
    }
    
    // Close mobile menu when clicking on a link
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (mobileMenu && navMenu) {
                mobileMenu.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.style.overflow = 'auto';
            }
        });
    });
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', function(event) {
        if (mobileMenu && navMenu) {
            const isClickInsideNav = navMenu.contains(event.target);
            const isClickOnToggle = mobileMenu.contains(event.target);
            
            if (!isClickInsideNav && !isClickOnToggle && navMenu.classList.contains('active')) {
                console.log('Closing mobile menu - clicked outside');
                mobileMenu.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.style.overflow = 'auto';
            }
        }
    });
    
    // Fallback: Close mobile menu when clicking on overlay
    document.addEventListener('click', function(event) {
        if (mobileMenu && navMenu && navMenu.classList.contains('active')) {
            // Check if click is on the overlay (outside nav-menu but inside viewport)
            const navRect = navMenu.getBoundingClientRect();
            const isClickOnOverlay = event.clientX < navRect.left || 
                                   event.clientX > navRect.right ||
                                   event.clientY < navRect.top ||
                                   event.clientY > navRect.bottom;
            
            if (isClickOnOverlay && !mobileMenu.contains(event.target)) {
                console.log('Closing mobile menu - clicked on overlay');
                mobileMenu.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.style.overflow = 'auto';
            }
        }
    });
    
    // Close mobile menu on window resize (if screen becomes larger)
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768 && mobileMenu && navMenu) {
            console.log('Closing mobile menu - screen resized to desktop');
            mobileMenu.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    });
    
    // Debug function for mobile menu
    window.debugMobileMenu = function() {
        console.log('Mobile Menu Debug Info:', {
            mobileMenu: mobileMenu,
            navMenu: navMenu,
            mobileMenuActive: mobileMenu?.classList.contains('active'),
            navMenuActive: navMenu?.classList.contains('active'),
            screenWidth: window.innerWidth,
            isMobile: window.innerWidth <= 768
        });
    };
    
    // Debug function for admin redirect
    window.debugAdminRedirect = function() {
        console.log('=== Admin Redirect Debug ===');
        console.log('Current pathname:', window.location.pathname);
        console.log('Current href:', window.location.href);
        console.log('Current origin:', window.location.origin);
        console.log('Current hostname:', window.location.hostname);
        
        const currentPath = window.location.pathname;
        const currentUrl = window.location.href;
        const isHomePage = currentPath.includes('index.html') || 
                         currentPath === '/' || 
                         currentPath.endsWith('/') ||
                         currentPath.includes('arribahomestaysiargao') ||
                         currentUrl.includes('arribahomestaysiargao');
        
        console.log('Is home page:', isHomePage);
        console.log('Admin page exists:', document.querySelector('a[href="admin.html"]') !== null);
        
        // Test redirect
        console.log('Testing redirect...');
        setTimeout(() => {
            window.location.href = 'admin.html';
        }, 1000);
    };
    
    // Test function to manually toggle mobile menu
    window.testMobileMenu = function() {
        if (mobileMenu && navMenu) {
            console.log('Manually toggling mobile menu...');
            mobileMenu.classList.toggle('active');
            navMenu.classList.toggle('active');
            
            if (navMenu.classList.contains('active')) {
                document.body.style.overflow = 'hidden';
                console.log('Mobile menu opened manually');
            } else {
                document.body.style.overflow = 'auto';
                console.log('Mobile menu closed manually');
            }
        }
    };
    
    // Test function to manually redirect to admin
    window.testAdminRedirect = function() {
        console.log('Testing admin redirect...');
        console.log('Current path:', window.location.pathname);
        console.log('Current URL:', window.location.href);
        
        setTimeout(() => {
            console.log('Redirecting to admin page...');
            window.location.href = 'admin.html';
        }, 1000);
    };
    
    // Auto-debug on load for mobile devices
    if (window.innerWidth <= 768) {
        setTimeout(() => {
            console.log('Mobile device detected, running mobile menu debug...');
            window.debugMobileMenu();
        }, 1000);
    }
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add active class to current page navigation
document.addEventListener('DOMContentLoaded', function() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        const linkHref = link.getAttribute('href');
        if (linkHref === currentPage || (currentPage === '' && linkHref === 'index.html')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
});

// Utility function for animations
function animateOnScroll() {
    const elements = document.querySelectorAll('.feature-card, .gallery-item, .amenity-card');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1
    });
    
    elements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(element);
    });
}

// Initialize animations when DOM is loaded
document.addEventListener('DOMContentLoaded', animateOnScroll);

// Login Modal Functionality
document.addEventListener('DOMContentLoaded', function() {
    console.log('Main.js loaded');
    const modal = document.getElementById('loginModal');
    const accountBtn = document.getElementById('accountBtn');
    const closeBtn = document.querySelector('.close');
    
    console.log('Modal:', modal);
    console.log('Account button:', accountBtn);
    console.log('Current page:', window.location.pathname);
    
    // Only initialize login modal if elements exist (not on admin page)
    if (!modal || !accountBtn) {
        console.log('Login modal elements not found (normal for admin page)');
        return;
    }
    
    
    // Close modal when X is clicked
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
    }
    
    // Close modal when clicking outside of it
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
    }
    
    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.style.display === 'block') {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
    
    // Handle login form submission
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            if (!email || !password) {
                alert('Please fill in all fields');
                return;
            }
            
            // Show loading state
            const submitBtn = loginForm.querySelector('.login-btn');
            const originalText = submitBtn.textContent;
            submitBtn.innerHTML = '<span class="loading-spinner"></span>Logging in...';
            submitBtn.disabled = true;
            submitBtn.classList.add('loading');
            
            try {
                const result = await window.loginUser(email, password);
                
                if (result.success) {
                    // Remove loading class and add success class
                    submitBtn.classList.remove('loading');
                    submitBtn.classList.add('success');
                    
                    // Show success animation
                    submitBtn.innerHTML = '<span class="success-animation"><svg class="success-checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52"><circle class="success-checkmark-circle" cx="26" cy="26" r="25" fill="none"/><path class="success-checkmark-check" fill="none" d="m14.1 27.2l7.1 7.2 16.7-16.8"/></svg></span>Login Successful!';
                    
                    // Wait for success animation to complete
                    setTimeout(() => {
                        // Close modal with smooth animation
                        modal.style.opacity = '0';
                        modal.style.transform = 'scale(0.9)';
                        
                        setTimeout(() => {
                    modal.style.display = 'none';
                    document.body.style.overflow = 'auto';
                            
                            // Reset modal styles
                            modal.style.opacity = '';
                            modal.style.transform = '';
                        }, 300);
                    
                    // Clear form
                    loginForm.reset();
                    
                    // Update UI to show logged in state
                    updateAccountButton(true);
                    
                        // Security: Set session authentication
                        sessionStorage.setItem('isAdmin', 'true');
                        console.log('Session authentication set for admin');
                        
                        // Initialize notifications for admin
                        if (window.notificationManager) {
                            console.log('Initializing notifications for admin...');
                            window.notificationManager.requestPermission().catch(error => {
                                console.error('Notification permission error:', error);
                            });
                        }
                        
                        // Redirect to admin page from any page after successful login
                        console.log('Redirecting to admin page...');
                        
                        // Construct admin URL based on current location
                        let adminUrl = 'admin.html';
                        
                        // For GitHub Pages, ensure we're using the correct path
                        if (window.location.hostname.includes('github.io')) {
                            const pathParts = window.location.pathname.split('/');
                            const repoName = pathParts[1]; // e.g., 'arribahomestaysiargao'
                            if (repoName) {
                                adminUrl = `/${repoName}/admin.html`;
                            }
                        }
                        
                        console.log('Admin URL:', adminUrl);
                        
                        // Use smooth loading screen redirect
                        if (window.redirectWithLoading) {
                            window.redirectWithLoading(adminUrl, 2000);
                        } else {
                            // Fallback to direct redirect if loading screen not available
                            window.location.href = adminUrl;
                        }
                    }, 1800);
                } else {
                    alert(result.error);
                }
            } catch (error) {
                console.error('Login error:', error);
                alert('Login failed. Please try again.');
            } finally {
                // Reset button state after a delay (only if not successful)
                setTimeout(() => {
                    if (!submitBtn.classList.contains('success')) {
                        submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                        submitBtn.classList.remove('loading');
                    }
                }, 100);
            }
        });
    }
    
    // Update account button based on auth state
    function updateAccountButton(isLoggedIn) {
        const accountBtn = document.getElementById('accountBtn');
        if (accountBtn) {
            if (isLoggedIn) {
                accountBtn.innerHTML = `
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M9 12l2 2 4-4"></path>
                        <circle cx="12" cy="12" r="10"></circle>
                    </svg>
                `;
                accountBtn.title = 'Logged in - Click to logout';
            } else {
                accountBtn.innerHTML = `
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                `;
                accountBtn.title = 'Click to login';
            }
        }
    }
    
    // Security: Prevent unauthorized access to admin pages
    function checkAdminAccess() {
        const currentPath = window.location.pathname;
        const isAdminPage = currentPath.includes('admin.html');
        
        if (isAdminPage) {
            // Check if user is properly authenticated
            const sessionAuth = sessionStorage.getItem('isAdmin');
            const localAuth = localStorage.getItem('isAdmin');
            
            if (!sessionAuth && !localAuth) {
                console.log('Unauthorized admin access detected, redirecting...');
                window.location.replace('index.html');
                return;
            }
        }
    }
    
    // Security: Clear any cached admin authentication on main page
    function clearCachedAdminAuth() {
        const currentPath = window.location.pathname;
        const isMainPage = currentPath.includes('index.html') || currentPath === '/' || currentPath.endsWith('/');
        
        if (isMainPage) {
            // Clear any cached admin authentication
            localStorage.removeItem('isAdmin');
            console.log('Cleared cached admin authentication on main page');
        }
    }
    
    // Security: Initialize protection
    checkAdminAccess();
    clearCachedAdminAuth();
    
    // Check auth state on page load
    if (window.onAuthStateChange) {
        window.onAuthStateChange((user) => {
            if (user) {
                console.log('User is logged in:', user.email);
                updateAccountButton(true);
            } else {
                console.log('User is not logged in');
                updateAccountButton(false);
            }
        });
    }
    
    // Debug Firebase auth on page load
    setTimeout(() => {
        if (window.debugFirebaseAuth) {
            window.debugFirebaseAuth();
        }
    }, 2000);
    
    // Handle logout when account button is clicked while logged in
    if (accountBtn) {
        console.log('Account button found, adding event listener');
        accountBtn.addEventListener('click', async function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Account button clicked');
            
            // Check if user is logged in
            const user = window.getCurrentUser ? window.getCurrentUser() : null;
            console.log('Current user:', user);
            
            if (user) {
                // User is logged in, show logout confirmation
                if (confirm('Are you sure you want to logout?')) {
                    try {
                        const result = await window.logoutUser();
                        if (result.success) {
                            updateAccountButton(false);
                            alert('Logged out successfully');
                        } else {
                            alert('Logout failed: ' + result.error);
                        }
                    } catch (error) {
                        console.error('Logout error:', error);
                        alert('Logout failed. Please try again.');
                    }
                }
            } else {
                // User is not logged in, show login modal
                console.log('Account button clicked - showing login modal');
                console.log('Modal element:', modal);
                if (modal) {
                    console.log('Modal found, displaying...');
                    modal.style.display = 'block';
                    document.body.style.overflow = 'hidden';
                    console.log('Modal display set to:', modal.style.display);
                } else {
                    console.error('Modal not found!');
                }
            }
        });
    }
});







