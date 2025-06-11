const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
    'electron',
    {
        ipcRenderer: {
            send: (channel, data) => {
                // whitelist channels
                let validChannels = ['close-app', 'minimize-app', 'toggle-content'];
                if (validChannels.includes(channel)) {
                    ipcRenderer.send(channel, data);
                }
            }
        }
    }
); 