const { contextBridge, ipcRenderer } = require('electron');

// Whitelist of valid channels for IPC communication
const validChannels = [
    'close-app',
    'minimize-app',
    'toggle-content',
    'google-token',
    'oauth-response'
];

// ContextBridge API to expose protected methods to the renderer process
// Expose process type for environment detection
contextBridge.exposeInMainWorld('process', {
    type: 'renderer',
    versions: process.versions,
    platform: process.platform
});

// Expose shell API for opening external URLs
contextBridge.exposeInMainWorld('electron', {
    shell: {
        openExternal: (url) => ipcRenderer.send('open-external', url)
    },
    ipcRenderer: {
        // Send a message to the main process
        send: (channel, data) => {
            if (validChannels.includes(channel)) {
                ipcRenderer.send(channel, data);
            } else {
                console.warn(`Blocked attempt to send on channel: ${channel}`);
            }
        },
        
        // Receive a message from the main process
        on: (channel, func) => {
            if (validChannels.includes(channel)) {
                // Deliberately strip event as it includes `sender`
                const subscription = (event, ...args) => func(...args);
                ipcRenderer.on(channel, subscription);
                return () => ipcRenderer.removeListener(channel, subscription);
            }
            return undefined;
        },
        
        // Remove a listener
        removeListener: (channel, listener) => {
            if (validChannels.includes(channel)) {
                ipcRenderer.removeListener(channel, listener);
            }
        }
    }
});

// Log when the preload script is loaded
console.log('Preload script loaded successfully'); 