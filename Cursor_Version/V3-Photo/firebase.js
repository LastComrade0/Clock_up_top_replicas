// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDj_OfcUeY355AgMFIutm1_ooA2eERz_D4",
    authDomain: "clock-up-top.firebaseapp.com",
    projectId: "clock-up-top",
    storageBucket: "clock-up-top.firebasestorage.app",
    messagingSenderId: "165135532100",
    appId: "1:165135532100:web:6801b1fdd924d0314e7c11"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const db = getFirestore(app);

// Enable offline persistence with error handling
const enableOfflinePersistence = async () => {
    try {
        await enableIndexedDbPersistence(db);
        console.log('Firestore persistence enabled');
    } catch (err) {
        if (err.code === 'failed-precondition') {
            console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
        } else if (err.code === 'unimplemented') {
            console.warn('The current browser does not support all of the features required to enable persistence');
        } else {
            console.error('Error enabling Firestore persistence:', err);
        }
    }
};

// Initialize offline persistence
if (typeof window !== 'undefined') {
    enableOfflinePersistence();
}

// Export the initialized services
export { 
    app, 
    auth, 
    googleProvider, 
    db, 
    signInWithPopup 
};
