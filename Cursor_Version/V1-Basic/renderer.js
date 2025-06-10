const { ipcRenderer } = require('electron');

function updateClock() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    
    const clockElement = document.getElementById('clock');
    clockElement.innerHTML = `${hours}:${minutes}:${seconds}<div id="close-button" class="button">×</div><div id="minimize-button" class="button">−</div>`;
}

// Update clock immediately and then every second
updateClock();
setInterval(updateClock, 1000);

// Add button functionality
document.addEventListener('click', (event) => {
    if (event.target.id === 'close-button') {
        ipcRenderer.send('close-app');
    } else if (event.target.id === 'minimize-button') {
        ipcRenderer.send('minimize-app');
    }
}); 