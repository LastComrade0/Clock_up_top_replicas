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

// Initialize UI listeners when DOM is fully loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupUIListeners);
} else {
    setupUIListeners();
}
