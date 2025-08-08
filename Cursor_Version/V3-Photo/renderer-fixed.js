// Centralized event handling for the application
function setupUIListeners() {
    // Clock update functionality
    function updateClock() {
        const now = new Date();
        const timeElement = document.getElementById('time');
        if (timeElement) {
            const timeString = now.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true
            });
            timeElement.textContent = timeString;
        }
    }

    // Initialize clock
    updateClock();
    setInterval(updateClock, 1000);

    // Menu dots functionality
    const menuButton = document.getElementById('menu-dots');
    const widgetsMenu = document.getElementById('widgets-menu');

    if (menuButton && widgetsMenu) {
        menuButton.addEventListener('click', (e) => {
            e.stopPropagation();
            widgetsMenu.classList.toggle('show');
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!widgetsMenu.contains(e.target) && e.target !== menuButton) {
                widgetsMenu.classList.remove('show');
            }
        });
    }

    // Timezone bar toggle
    const menuArrow = document.getElementById('menu-arrow');
    const timezoneBar = document.getElementById('timezone-bar');

    if (menuArrow && timezoneBar) {
        menuArrow.addEventListener('click', (e) => {
            e.stopPropagation();
            menuArrow.classList.toggle('flipped');
            timezoneBar.classList.toggle('show');
            
            // Only try to send IPC message if Electron is available
            if (window.electron?.ipcRenderer) {
                window.electron.ipcRenderer.send('toggle-content');
            }
        });
    }

    // Window controls
    const closeButton = document.getElementById('close-button');
    const minimizeButton = document.getElementById('minimize-button');

    if (closeButton) {
        closeButton.addEventListener('click', () => {
            if (window.electron?.ipcRenderer) {
                window.electron.ipcRenderer.send('close-app');
            } else {
                console.warn('Close button clicked but Electron IPC is not available');
            }
        });
    }

    if (minimizeButton) {
        minimizeButton.addEventListener('click', () => {
            if (window.electron?.ipcRenderer) {
                window.electron.ipcRenderer.send('minimize-app');
            } else {
                console.warn('Minimize button clicked but Electron IPC is not available');
            }
        });
    }

    // Handle sign in button clicks
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

    // Handle exit option
    const exitOption = document.getElementById('exit-option');
    if (exitOption) {
        exitOption.addEventListener('click', () => {
            if (window.electron?.ipcRenderer) {
                window.electron.ipcRenderer.send('close-app');
            } else {
                console.warn('Exit option clicked but Electron IPC is not available');
            }
        });
    }
}

// Initialize Daily.co integration
async function initializeDailyIntegration() {
    const joinButton = document.getElementById('join-stretch-session');
    if (!joinButton) {
        console.error('Join session button not found');
        return;
    }

    console.log('Join session button found:', joinButton);
    console.log('Daily.co manager available:', !!window.dailyStretchingManager);

    // Initialize Daily.co
    if (window.dailyStretchingManager) {
        console.log('Initializing Daily.co manager...');
        await window.dailyStretchingManager.initializeDaily();
        console.log('Daily.co manager initialized successfully');
    } else {
        console.error('Daily.co manager not found! Make sure daily-streaming.js is loaded.');
    }

    // Handle join button click
    joinButton.addEventListener('click', async () => {
        try {
            console.log('Join button clicked');
            
            // Show session UI immediately
            const sessionUI = document.getElementById('stretching-session-ui');
            if (sessionUI) {
                sessionUI.style.display = 'flex';
            }

            // Join session (works for both authenticated and anonymous users)
            await window.dailyStretchingManager.joinSession();
        } catch (error) {
            console.error('Failed to join session:', error);
            alert('Failed to join stretching session. Please try again.');
        }
    });
}

// Check authentication state and update UI
function checkAuthState() {
    const joinButton = document.getElementById('join-stretch-session');
    if (!joinButton) return;

    const isAuthenticated = !!window.firebase?.auth?.currentUser;
    console.log('Auth state check - isAuthenticated:', isAuthenticated);
    console.log('Current user:', window.firebase?.auth?.currentUser);

    // Always show the button, but change text based on auth status
    joinButton.style.display = 'block';
    joinButton.disabled = false; // Always enabled for anonymous access
    
    if (isAuthenticated) {
        joinButton.style.opacity = '1';
        joinButton.textContent = '🫂 Join Live Session';
        joinButton.style.background = '#7CFFB2';
    } else {
        joinButton.style.opacity = '0.8';
        joinButton.textContent = '🫂 Join Live Session (Anonymous)';
        joinButton.style.background = '#FFB27C';
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    setupUIListeners();
    initializeDailyIntegration();
    
    // Check auth state after a short delay to ensure Firebase is loaded
    setTimeout(checkAuthState, 1000);
    
    // Also check auth state when Firebase auth state changes
    if (window.firebase?.auth) {
        window.firebase.auth.onAuthStateChanged((user) => {
            console.log('Auth state changed:', user);
            checkAuthState();
        });
    }
});
