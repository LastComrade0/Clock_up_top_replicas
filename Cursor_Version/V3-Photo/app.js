// app.js - General application functionality

console.log('App.js loaded');

// Global app state
window.appState = {
    isInitialized: false,
    currentUser: null,
    settings: {}
};

// Initialize app
function initializeApp() {
    console.log('Initializing app...');
    window.appState.isInitialized = true;
    console.log('App initialized');
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { initializeApp };
} 