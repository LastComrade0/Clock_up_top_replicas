const { app, BrowserWindow, ipcMain, Menu, Tray, screen } = require('electron');
const path = require('path');

// Firebase Admin SDK (Server-side)

// Initialize Firebase Admin in the main process
const initializeFirebaseAdmin = async () => {
  try {
    console.log('Initializing Firebase Admin...');
    
    // Dynamically import firebase-admin
    const admin = require('firebase-admin');
    
    // Path to your service account key file
    const serviceAccountPath = path.join(__dirname, 'clock-up-top-firebase-adminsdk-fbsvc-e27601c60a.json');
    
    // Check if the service account file exists
    const fs = require('fs');
    if (!fs.existsSync(serviceAccountPath)) {
      throw new Error(`Service account file not found at: ${serviceAccountPath}`);
    }
    
    // Read and parse the service account file
    const serviceAccount = require(serviceAccountPath);
    
    // Initialize Firebase Admin
    console.log('Initializing Firebase Admin app...');
    const firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    
    console.log('Firebase Admin initialized successfully');
    
    // Get Firestore instance
    console.log('Initializing Firestore...');
    const db = admin.firestore();
    
    // Configure Firestore settings
    db.settings({
      cacheSizeBytes: admin.firestore.CACHE_SIZE_UNLIMITED,
      ignoreUndefinedProperties: true
    });
    
    console.log('Firestore initialized successfully');
    
    // Make Firestore available globally
    global.firestore = db;
    return db;
    
  } catch (error) {
    console.error('Error in initializeFirebaseAdmin:', error);
    throw error; // Re-throw to handle in the calling function
  }
};

// Only initialize Firebase Admin in the main process
if (app) {
  // Temporarily disable Firebase Admin to test other functionality
  console.log('Firebase Admin initialization disabled for testing');
  // initializeFirebaseAdmin().catch(error => {
  //   console.error('Failed to initialize Firebase Admin:', error);
  // });
}

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
      enableRemoteModule: false,
      webSecurity: true,
      devTools: false,
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
