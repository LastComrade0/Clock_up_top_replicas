// Update clock display
function updateClock() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    document.getElementById('clock').textContent = `${hours}:${minutes}:${seconds}`;
}

// Update clock every second
setInterval(updateClock, 1000);
updateClock();

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

moreOptions.addEventListener('click', (e) => {
    e.stopPropagation();
    moreOptionsMenu.classList.toggle('show');
});

// Close menu when clicking outside
document.addEventListener('click', (e) => {
    if (!moreOptionsMenu.contains(e.target) && e.target !== moreOptions) {
        moreOptionsMenu.classList.remove('show');
    }
});

// Prevent menu from closing when scrolling
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