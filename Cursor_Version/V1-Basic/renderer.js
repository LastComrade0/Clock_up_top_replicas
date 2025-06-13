// Import Firebase and auth functions
import { initializeAuth, onAuthStateChanged, signInWithGoogle } from './auth';
import { auth, db } from './firebase';

// Clock functionality
let clockInterval;

function initializeClock() {
    function updateClock() {
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const seconds = now.getSeconds().toString().padStart(2, '0');
        const clockElement = document.getElementById('clock');
        if (clockElement) {
            clockElement.textContent = `${hours}:${minutes}:${seconds}`;
        }
    }

    // Clear any existing interval to prevent duplicates
    if (clockInterval) {
        clearInterval(clockInterval);
    }
    
    // Initialize clock updates
    updateClock(); // Initial call
    clockInterval = setInterval(updateClock, 1000);
}

// Handle sign in button clicks
function setupSignInButtons() {
    const signInButtons = [
        document.getElementById('sign-in-button'),
        document.querySelector('.widget-placeholder:last-child .sign-in-button')
    ].filter(Boolean);

    signInButtons.forEach(button => {
        button.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            try {
                const user = await signInWithGoogle();
                console.log('User signed in:', user.displayName);
                
                // Hide lock overlay
                const lockOverlay = button.closest('.widget-placeholder')?.querySelector('.lock-overlay');
                if (lockOverlay) {
                    lockOverlay.style.display = 'none';
                }
            } catch (error) {
                console.error('Sign-in error:', error);
                alert('Sign-in failed. Please try again.');
            }
        });
    });
}

// Set up UI event listeners
function setupUIListeners() {
    // Handle close button
    const closeButton = document.getElementById('close-button');
    if (closeButton) {
        closeButton.addEventListener('click', () => {
            window.electron?.ipcRenderer?.send('close-app');
        });
    }

    // Handle minimize button
    const minimizeButton = document.getElementById('minimize-button');
    if (minimizeButton) {
        minimizeButton.addEventListener('click', () => {
            window.electron?.ipcRenderer?.send('minimize-app');
        });
    }

    // Handle menu toggle
    const menuArrow = document.getElementById('menu-arrow');
    const menu = document.getElementById('menu');
    if (menuArrow && menu) {
        menuArrow.addEventListener('click', (e) => {
            e.stopPropagation();
            menu.classList.toggle('show');
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!menu.contains(e.target) && e.target !== menuArrow) {
                menu.classList.remove('show');
            }
        });
    }

    // Handle exit option
    const exitOption = document.getElementById('exit-option');
    if (exitOption) {
        exitOption.addEventListener('click', () => {
            window.electron?.ipcRenderer?.send('close-app');
        });
    }
}

// Check for redirect result when the app loads
async function checkRedirectResult() {
    try {
        // Listen for OAuth response from main process (Electron)
        if (window.electron) {
            window.electron.ipcRenderer.on('oauth-response', async (response) => {
                try {
                    console.log('Received OAuth response in renderer');
                    const user = await handleRedirectResult();
                    if (user) {
                        console.log('Successfully handled redirect for user:', user.email);
                        
                        // Redirect back to the original URL if it exists
                        const redirectUrl = sessionStorage.getItem('auth_redirect_url');
                        if (redirectUrl && redirectUrl !== window.location.href) {
                            window.location.href = redirectUrl;
                        }
                    }
                } catch (error) {
                    console.error('Error handling OAuth response:', error);
                }
            });
        }
        
        // For web or if no response from main process
        const user = await handleRedirectResult();
        if (user) {
            console.log('Successfully handled redirect for user:', user.email);
            
            // Redirect back to the original URL if it exists
            const redirectUrl = sessionStorage.getItem('auth_redirect_url');
            if (redirectUrl && redirectUrl !== window.location.href) {
                window.location.href = redirectUrl;
            }
        }
    } catch (error) {
        console.error('Error handling redirect result:', error);
    }
}

// Wait for Firebase to be fully initialized
function waitForFirebase() {
    return new Promise((resolve) => {
        const checkFirebase = () => {
            if (window.firebase && window.firebaseAuth) {
                console.log('Firebase is ready');
                resolve();
            } else {
                console.log('Waiting for Firebase to initialize...');
                setTimeout(checkFirebase, 100);
            }
        };
        checkFirebase();
    });
}

// Initialize the application
async function initializeApp() {
    console.log('Initializing application...');
    
    // Wait for Firebase to be ready
    await waitForFirebase();
    
    // Initialize clock
    initializeClock();
    
    // Set up UI event listeners
    setupUIListeners();
    
    // Initialize auth
    initializeAuth();
    
    // Set up auth state change listener
    onAuthStateChanged((user) => {
        console.log('Auth state changed:', user ? `User signed in: ${user.email}` : 'User signed out');
        
        if (user) {
            // Hide all lock overlays when signed in
            document.querySelectorAll('.lock-overlay').forEach(overlay => {
                overlay.style.display = 'none';
            });
        }
    });
    
    // Set up sign-in buttons
    setupSignInButtons();
    
    // Check for redirect result
    checkRedirectResult().catch(console.error);
    
    console.log('Application initialization complete');
}

// Start the app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}