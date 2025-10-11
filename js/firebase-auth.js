// Firebase Authentication Functions

// Login function
async function loginUser(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(window.auth, email, password);
        console.log('User logged in:', userCredential.user);
        return { success: true, user: userCredential.user };
            } catch (error) {
                console.error('Login error:', error);
                let errorMessage = 'Login failed. Please try again.';
                
                switch (error.code) {
                    case 'auth/user-not-found':
                        errorMessage = 'No account found with this email address.';
                        break;
                    case 'auth/wrong-password':
                        errorMessage = 'Incorrect password.';
                        break;
                    case 'auth/invalid-email':
                        errorMessage = 'Invalid email address.';
                        break;
                    case 'auth/invalid-credential':
                        errorMessage = 'Invalid email or password. Please check your credentials and try again.';
                        break;
                    case 'auth/user-disabled':
                        errorMessage = 'This account has been disabled.';
                        break;
                    case 'auth/too-many-requests':
                        errorMessage = 'Too many failed attempts. Please try again later.';
                        break;
                    case 'auth/network-request-failed':
                        errorMessage = 'Network error. Please check your internet connection.';
                        break;
                    case 'auth/invalid-login-credentials':
                        errorMessage = 'Invalid email or password. Please check your credentials.';
                        break;
                    case 'auth/operation-not-allowed':
                        errorMessage = 'Email/password sign-in is not enabled. Please contact support.';
                        break;
                    case 'auth/weak-password':
                        errorMessage = 'Password is too weak.';
                        break;
                    case 'auth/email-already-in-use':
                        errorMessage = 'Email address is already in use.';
                        break;
                    default:
                        errorMessage = `Login failed: ${error.message}. Please try again.`;
                        break;
                }
        
        return { success: false, error: errorMessage };
    }
}

// Logout function
async function logoutUser() {
    try {
        await window.signOut(window.auth);
        console.log('User logged out');
        return { success: true };
            } catch (error) {
        console.error('Logout error:', error);
        return { success: false, error: error.message };
    }
}

// Check if user is logged in
function getCurrentUser() {
    return window.auth.currentUser;
}

// Monitor auth state changes
function onAuthStateChange(callback) {
    // Wait for Firebase to be ready
    if (!window.onAuthStateChanged || !window.auth) {
        console.log('Firebase not ready yet, retrying in 100ms...');
        setTimeout(() => onAuthStateChange(callback), 100);
        return;
    }
    return window.onAuthStateChanged(window.auth, callback);
}

// Debug function to test Firebase auth
async function debugFirebaseAuth() {
    console.log('=== Firebase Auth Debug ===');
    console.log('Auth object:', window.auth);
    console.log('Auth app:', window.auth?.app);
    console.log('Auth config:', window.auth?.app?.options);
    console.log('Current user:', window.auth?.currentUser);
    
    // Test Firebase connection
    try {
        const testEmail = 'test@example.com';
        const testPassword = 'testpassword123';
        console.log('Testing Firebase connection...');
        
        // This will fail but will show us if Firebase is working
        await signInWithEmailAndPassword(window.auth, testEmail, testPassword);
    } catch (error) {
        console.log('Expected error (Firebase is working):', error.code, error.message);
        
        if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
            console.log('✅ Firebase Authentication is working correctly');
        } else {
            console.log('❌ Firebase Authentication issue:', error);
        }
    }
}

// Create admin user function (for debugging)
async function createAdminUser(email, password) {
    try {
        console.log('Creating admin user:', email);
        
        if (!window.createUserWithEmailAndPassword) {
            throw new Error('createUserWithEmailAndPassword not available');
        }
        
        const userCredential = await window.createUserWithEmailAndPassword(window.auth, email, password);
        console.log('Admin user created:', userCredential.user);
        
        // Set custom claims or admin flag
        localStorage.setItem('isAdmin', 'true');
        
        return { success: true, user: userCredential.user };
    } catch (error) {
        console.error('Error creating admin user:', error);
        
        let errorMessage = 'Failed to create admin user.';
        switch (error.code) {
            case 'auth/email-already-in-use':
                errorMessage = 'Email address is already in use.';
                break;
            case 'auth/invalid-email':
                errorMessage = 'Invalid email address.';
                break;
            case 'auth/weak-password':
                errorMessage = 'Password is too weak.';
                break;
            case 'auth/operation-not-allowed':
                errorMessage = 'User creation is not enabled.';
                break;
            default:
                errorMessage = `Failed to create user: ${error.message}`;
                break;
        }
        
        return { success: false, error: errorMessage };
    }
}

// Make functions available globally
window.loginUser = loginUser;
window.logoutUser = logoutUser;
window.getCurrentUser = getCurrentUser;
window.onAuthStateChange = onAuthStateChange;
window.debugFirebaseAuth = debugFirebaseAuth;
window.createAdminUser = createAdminUser;
