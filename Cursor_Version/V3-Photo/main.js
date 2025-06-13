const { app, BrowserWindow, ipcMain, Tray, Menu } = require('electron');
const path = require('path');

let tray = null;
let mainWindow = null;
let isExpanded = false;

// Handle IPC messages from renderer
ipcMain.on('google-token', (event, token) => {
    console.log('Received Google token in main process');
    // Main process can now use this token if needed
    // For now, we just log it
});

// Handle OAuth callback for Firebase Auth
app.setAsDefaultProtocolClient('com.clockuptop');

// Handle deep linking for OAuth redirects
app.on('open-url', (event, url) => {
    event.preventDefault();
    console.log('Received URL:', url);
    
    // Parse the URL to get the OAuth response
    const parsedUrl = new URL(url);
    const response = parsedUrl.searchParams.get('response');
    
    if (response) {
        // Send the response back to the renderer
        mainWindow.webContents.send('oauth-response', response);
    }
});

// Handle opening external URLs in the default browser
ipcMain.on('open-external', (event, url) => {
    if (typeof url === 'string' && (url.startsWith('http:') || url.startsWith('https:'))) {
        require('electron').shell.openExternal(url);
    }
});

// Keep only the Electron-specific code here

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 540,
    height: 100,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: true,
    useContentSize: true,
    skipTaskbar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
      preload: path.join(__dirname, 'preload.js'),
      sandbox: true
    }
  });


  // Load the local index.html file
  mainWindow.loadFile('index.html');
  
  // Make window draggable
  mainWindow.setMovable(true);
  
  // Remove menu bar
  mainWindow.setMenuBarVisibility(false);
  
  // Open DevTools in a separate window
  const { screen } = require('electron');
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;
  
  // Calculate safe dimensions (80% of screen, centered)
  const devToolsWidth = Math.min(1400, Math.round(width * 0.8));
  const devToolsHeight = Math.min(900, Math.round(height * 0.9));
  const devToolsX = Math.round((width - devToolsWidth) / 2);
  const devToolsY = Math.round((height - devToolsHeight) / 2);
  
  // Create a new browser window for DevTools
  const devToolsWindow = new BrowserWindow({
    width: devToolsWidth,
    height: devToolsHeight,
    x: devToolsX,
    y: devToolsY,
    minWidth: 800,
    minHeight: 600,
    title: 'Clock App - Developer Tools',
    show: false, // Don't show until ready
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
      devTools: true,
      sandbox: true
    }
  });
  
  // Set up DevTools
  mainWindow.webContents.setDevToolsWebContents(devToolsWindow.webContents);
  mainWindow.webContents.openDevTools({ 
    mode: 'detach',
    activate: true,
    mode: 'bottom'
  });
  
  // Ensure DevTools window is properly shown
  devToolsWindow.loadURL('about:blank').then(() => {
    devToolsWindow.show();
    // Focus the DevTools window
    devToolsWindow.focus();
  });
  
  // Handle window move/resize to keep it within bounds
  const ensureWindowInBounds = () => {
    const [winX, winY] = devToolsWindow.getPosition();
    const [winWidth, winHeight] = devToolsWindow.getSize();
    
    let newX = Math.max(0, Math.min(winX, width - 100)); // Keep at least 100px visible
    let newY = Math.max(0, Math.min(winY, height - 100));
    
    if (winX !== newX || winY !== newY) {
      devToolsWindow.setPosition(newX, newY);
    }
  };
  
  // Ensure window stays in bounds when moved or resized
  devToolsWindow.on('move', ensureWindowInBounds);
  devToolsWindow.on('resize', ensureWindowInBounds);

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
    console.log('Close requested');
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.destroy();
    }
    app.quit();
  });
  
  ipcMain.on('minimize-app', () => {
    console.log('Minimize requested');
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.hide();
    }
  });
  
  ipcMain.on('toggle-content', () => {
    isExpanded = !isExpanded;
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.setSize(540, isExpanded ? 280 : 100);
    }
  });

  // Keep window on top
  mainWindow.setAlwaysOnTop(true, 'screen-saver');
  
  // Handle window focus
  mainWindow.on('blur', () => {
    mainWindow.setAlwaysOnTop(true, 'screen-saver');
  });

  tray.on('click', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      if (mainWindow.isVisible()) mainWindow.hide();
      else mainWindow.show();
    }
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
