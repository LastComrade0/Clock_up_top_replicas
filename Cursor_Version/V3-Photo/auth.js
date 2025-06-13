console.log('Auth.js loaded');

let auth, db, googleProvider;

// Function to initialize Firebase services
function initializeFirebase() {
    if (!window.firebase || !window.firebase.auth) {
        console.error('Firebase not initialized yet');
        return false;
    }

    try {
        // Get Firebase auth and firestore instances
        const { 
            GoogleAuthProvider,
            signInWithRedirect,
            getRedirectResult,
            signInWithPopup
        } = window.firebase.auth;

        // Initialize services
        auth = window.firebaseAuth;
        db = window.firebaseDb;
        googleProvider = new GoogleAuthProvider();

        // Configure Google provider
        googleProvider.setCustomParameters({
            prompt: 'select_account'
        });

        // Make methods available
        window.firebase.auth = {
            ...window.firebase.auth,
            signInWithRedirect: (...args) => signInWithRedirect(auth, ...args),
            getRedirectResult: () => getRedirectResult(auth),
            signInWithPopup: (...args) => signInWithPopup(auth, ...args)
        };

        console.log('Firebase services initialized in auth.js');
        return true;
    } catch (error) {
        console.error('Error initializing Firebase services:', error);
        return false;
    }
}

// Initialize Firebase services
const isFirebaseInitialized = initializeFirebase();
if (!isFirebaseInitialized) {
    console.warn('Firebase services not initialized yet, will retry when needed');
}

// Import Firestore functions
const { 
    doc, 
    setDoc, 
    updateDoc, 
    serverTimestamp 
} = window.firebase.firestore;

// Track auth state
let currentUser = null;
let authStateListeners = [];

// Helper function to notify all auth state listeners
function notifyAuthStateListeners(user) {
    currentUser = user;
    authStateListeners.forEach(listener => listener(user));
}

// Initialize auth state tracking
export function initializeAuth() {
    console.log('Initializing auth state tracking');
    
    // Set up auth state change listener
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
        try {
            if (user) {
                console.log('Auth state changed - user signed in:', user.uid);
                
                // Save user data to Firestore
                const userRef = doc(db, 'users', user.uid);
                await setDoc(userRef, {
                    uid: user.uid,
                    name: user.displayName,
                    email: user.email,
                    photoURL: user.photoURL,
                    lastLogin: serverTimestamp(),
                    online: true
                }, { merge: true });

                // Send Google token to renderer if available
                const token = await user.getIdToken();
                if (token && window.electron?.ipcRenderer) {
                    console.log('Sending token to renderer');
                    window.electron.ipcRenderer.send('google-token', token);
                }
                
                // Set up cleanup when window is closed
                window.addEventListener('beforeunload', async () => {
                    try {
                        await updateDoc(userRef, { online: false });
                    } catch (error) {
                        console.error('Error updating user status on unload:', error);
                    }
                });
                
                // Notify listeners
                notifyAuthStateListeners(user);
            } else {
                console.log('Auth state changed - no user signed in');
                notifyAuthStateListeners(null);
            }
        } catch (error) {
            console.error('Error in auth state change:', error);
        }
    });
    
    // Cleanup function
    return () => {
        if (unsubscribe) unsubscribe();
    };
}

// Sign in function
export async function signInWithGoogle() {
    try {
        console.log('Starting Google sign in...');
        
        // For Electron, we need to use signInWithRedirect
        if (window.electron) {
            console.log('Running in Electron environment, using signInWithRedirect');
            
            // Add custom parameters for better UX in Electron
            googleProvider.setCustomParameters({
                prompt: 'select_account',
                hd: '*'  // Optional: restrict to specific domain
            });
            
            // Store the current URL to redirect back after auth
            const redirectUrl = window.location.href.split('#')[0];
            sessionStorage.setItem('auth_redirect_url', redirectUrl);
            
            // Start the sign-in process
            await signInWithRedirect(auth, googleProvider);
            return null;
        } 
        // For web, we can use signInWithPopup
        else {
            console.log('Running in web environment, using signInWithPopup');
            const result = await signInWithPopup(auth, googleProvider);
            return result.user;
        }
    } catch (error) {
        console.error('Google sign in error:', error);
        throw error;
    }
}

// Check for redirect result
export async function handleRedirectResult() {
    try {
        const result = await getRedirectResult(auth);
        if (result) {
            const user = result.user;
            console.log('User signed in (redirect):', user.displayName);
            return user;
        }
        return null;
    } catch (error) {
        console.error('Error handling redirect result:', error);
        throw error;
    }
}

// Sign out function
export async function signOut() {
    try {
        await auth.signOut();
        notifyAuthStateListeners(null);
    } catch (error) {
        console.error('Error signing out:', error);
        throw error;
    }
}

// Get current user
export function getCurrentUser() {
    return currentUser;
}

// Subscribe to auth state changes
export function onAuthStateChanged(callback) {
    // Add the callback to our listeners
    authStateListeners.push(callback);
    
    // Immediately invoke with current user if available
    if (currentUser !== undefined) {
        callback(currentUser);
    }
    
    // Return unsubscribe function
    return () => {
        authStateListeners = authStateListeners.filter(listener => listener !== callback);
    };
}
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
      const signInBtn = document.getElementById('sign-in-button');
      if (signInBtn) {
        console.log('Binding click listener to sign-in-button');
        signInBtn.addEventListener('click', async () => {
          try {
            await signInWithGoogle();
          } catch (err) {
            console.error('Sign-in failed:', err);
            alert('Sign-in failed. Check the console for details.');
          }
        });
      } else {
        console.warn('Sign-in button not found');
      }
    });
  }
  
// Export the auth object for direct access if needed
export { auth };
