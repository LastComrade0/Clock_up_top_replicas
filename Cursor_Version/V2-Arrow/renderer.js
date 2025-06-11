// Update clock display
function updateClock() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    document.getElementById('time').textContent = `${hours}:${minutes}:${seconds}`;
}

// Update clock every second
setInterval(updateClock, 1000);
updateClock(); // Initial update

// Handle close button
document.getElementById('close-button').addEventListener('click', () => {
    window.electron.ipcRenderer.send('close-app');
});

// Handle minimize button
document.getElementById('minimize-button').addEventListener('click', () => {
    window.electron.ipcRenderer.send('minimize-app');
});

// More options menu handler
const moreOptions = document.getElementById('more-options');
const moreOptionsMenu = document.getElementById('more-options-menu');

function adjustWindowHeight() {
    if (window.electron && window.electron.ipcRenderer) {
        const menuHeight = moreOptionsMenu.offsetHeight;
        const baseHeight = 100; // Base height for clock
        const padding = 20; // Extra padding
        const newHeight = baseHeight + menuHeight + padding;
        window.electron.ipcRenderer.send('adjust-window-height', newHeight);
    }
}

moreOptions.addEventListener('click', (e) => {
    e.stopPropagation();
    const rect = moreOptions.getBoundingClientRect();
    moreOptionsMenu.style.top = rect.top + 'px';
    moreOptionsMenu.classList.toggle('show');
    
    if (moreOptionsMenu.classList.contains('show')) {
        adjustWindowHeight();
    } else {
        // Reset to base height when menu is closed
        if (window.electron && window.electron.ipcRenderer) {
            window.electron.ipcRenderer.send('adjust-window-height', 100);
        }
    }
});

// Close menu when clicking outside
document.addEventListener('click', (e) => {
    if (!moreOptionsMenu.contains(e.target) && e.target !== moreOptions) {
        moreOptionsMenu.classList.remove('show');
        // Reset to base height when menu is closed
        if (window.electron && window.electron.ipcRenderer) {
            window.electron.ipcRenderer.send('adjust-window-height', 100);
        }
    }
});

// Prevent menu from closing when clicking inside
moreOptionsMenu.addEventListener('click', (e) => {
    e.stopPropagation();
});

// Menu item logic: toggle checkmark on click
document.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', (e) => {
        const check = item.querySelector('.menu-check');
        if (check.textContent === '✓') {
            check.textContent = '';
        } else {
            check.textContent = '✓';
        }
    });
}); 