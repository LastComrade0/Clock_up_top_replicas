const { app, BrowserWindow, ipcMain, Tray, Menu } = require('electron');
const path = require('path');

let tray = null;
let mainWindow = null;
let isExpanded = false;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 600,
    height: 600,
    transparent: true,
    frame: false,
    backgroundColor: '#00000000',
    hasShadow: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    alwaysOnTop: true,
    skipTaskbar: true,
    focusable: false,
    fullscreenable: false,
    type: 'panel'
  });

  mainWindow.loadFile('index.html');
  
  // Make window draggable
  mainWindow.setMovable(true);
  
  // Remove menu bar
  mainWindow.setMenuBarVisibility(false);

  // Create tray icon
  tray = new Tray(path.join(__dirname, 'clock_icon.png'));
  const contextMenu = Menu.buildFromTemplate([
    { 
      label: 'Show Clock', 
      click: () => {
        mainWindow.show();
      }
    },
    { 
      label: 'Hide Clock', 
      click: () => {
        mainWindow.hide();
      }
    },
    { type: 'separator' },
    { 
      label: 'Exit', 
      click: () => {
        app.quit();
      }
    }
  ]);
  tray.setToolTip('Clock up Top');
  tray.setContextMenu(contextMenu);

  // Handle tray icon click
  tray.on('click', () => {
    if (mainWindow.isVisible()) {
      mainWindow.hide();
    } else {
      mainWindow.show();
    }
  });

  // Handle window close
  mainWindow.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault();
      mainWindow.hide();
    }
    return false;
  });

  // Handle app quit
  app.on('before-quit', () => {
    app.isQuitting = true;
  });

  // Handle close message from renderer
  ipcMain.on('close-app', () => {
    app.quit();
  });

  // Handle minimize message from renderer
  ipcMain.on('minimize-app', () => {
    mainWindow.hide();
  });

  // Keep window on top
  mainWindow.setAlwaysOnTop(true, 'screen-saver', 1);
  
  // Handle window focus
  mainWindow.on('blur', () => {
    mainWindow.setAlwaysOnTop(true, 'screen-saver', 1);
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
}); 