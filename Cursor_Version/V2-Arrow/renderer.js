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
updateClock(); // Initial update

// Handle close button
document.getElementById('close-button').addEventListener('click', () => {
    window.electron.ipcRenderer.send('close-app');
});

// Handle minimize button
document.getElementById('minimize-button').addEventListener('click', () => {
    window.electron.ipcRenderer.send('minimize-app');
});

// Handle menu arrow
const menuArrow = document.getElementById('menu-arrow');
const menu = document.getElementById('menu');

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

// Handle exit option
document.getElementById('exit-option').addEventListener('click', () => {
    window.electron.ipcRenderer.send('close-app');
}); 