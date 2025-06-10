const { app, BrowserWindow, ipcMain, Tray, Menu } = require('electron');
const path = require('path');

let tray = null;
let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 280,
    height: 90,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    useContentSize: true,
    skipTaskbar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
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
        mainWindow.setAlwaysOnTop(true, 'screen-saver');
      }
    },
    { 
      label: 'Hide Clock', 
      click: () => mainWindow.hide()
    },
    { type: 'separator' },
    { 
      label: 'Quit', 
      click: () => app.quit()
    }
  ]);
  tray.setToolTip('Clock up Top');
  tray.setContextMenu(contextMenu);

  // Handle close message from renderer
  ipcMain.on('close-app', () => {
    app.quit();
  });

  // Handle minimize message from renderer
  ipcMain.on('minimize-app', () => {
    mainWindow.hide();
  });

  // Keep window on top
  mainWindow.setAlwaysOnTop(true, 'screen-saver');
  
  // Handle window focus
  mainWindow.on('blur', () => {
    mainWindow.setAlwaysOnTop(true, 'screen-saver');
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    } else {
      mainWindow.show();
      mainWindow.setAlwaysOnTop(true, 'screen-saver');
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
}); 