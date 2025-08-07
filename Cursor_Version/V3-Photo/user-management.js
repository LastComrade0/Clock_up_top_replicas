// user-management.js - User management and authentication functionality

// Import crypto-js for password hashing
// Note: In browser environment, we'll use a CDN version
// const CryptoJS = require('crypto-js');

// User management class
class UserManager {
    constructor() {
        this.users = [];
        this.currentUser = null;
        this.collectionName = 'clock_user';
    }

    // Initialize user management
    async initialize() {
        try {
            console.log('Initializing User Manager...');
            await this.loadUsersFromFirebase();
            console.log('User Manager initialized successfully');
        } catch (error) {
            console.error('Error initializing User Manager:', error);
        }
    }

    // Load users from Firebase collection
    async loadUsersFromFirebase() {
        try {
            console.log('Loading users from Firebase...');
            
            // Check if Firebase is available
            if (!window.firebase || !window.firebase.firestore) {
                throw new Error('Firebase not initialized');
            }

            const usersRef = window.firebase.firestore.collection(this.collectionName);
            const snapshot = await window.firebase.firestore.getDocs(usersRef);
            
            this.users = [];
            snapshot.forEach(doc => {
                const userData = doc.data();
                this.users.push({
                    id: doc.id,
                    email: userData.email,
                    password_hash: userData.password_hash,
                    user: userData.user
                });
            });

            console.log(`Loaded ${this.users.length} users from Firebase`);
            return this.users;
        } catch (error) {
            console.error('Error loading users from Firebase:', error);
            throw error;
        }
    }

    // Hash password using SHA-256
    hashPassword(password) {
        // Use crypto-js for consistent hashing
        if (typeof CryptoJS !== 'undefined') {
            const hash = CryptoJS.SHA256(password).toString();
            console.log('UserManager: Password hashed with CryptoJS:', hash.substring(0, 20) + '...');
            return hash;
        } else {
            console.error('CryptoJS not available, using fallback hash');
            // Fallback to simple hash function
            let hash = 0;
            for (let i = 0; i < password.length; i++) {
                const char = password.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash; // Convert to 32-bit integer
            }
            return hash.toString(16);
        }
    }

    // Verify password
    verifyPassword(password, hashedPassword) {
        const hashedInput = this.hashPassword(password);
        return hashedInput === hashedPassword;
    }

    // Register new user
    async registerUser(email, password, username) {
        try {
            console.log('=== USER MANAGER REGISTRATION ===');
            console.log('Registering new user:', { email, username, password: '***' });

            // Check if user already exists
            const existingUser = this.users.find(user => user.email === email);
            if (existingUser) {
                throw new Error('User with this email already exists');
            }

            // Hash the password
            const passwordHash = this.hashPassword(password);

            // Create user object
            const newUser = {
                email: email,
                password_hash: passwordHash,
                user: username,
                created_at: new Date().toISOString()
            };

            // Add to Firebase
            console.log('Submitting to Firebase collection:', this.collectionName);
            console.log('User data to submit:', { ...newUser, password_hash: '***' });
            console.log('Firebase available:', !!window.firebase);
            console.log('Firestore available:', !!window.firebase.firestore);
            
            try {
                const userRef = window.firebase.firestore.collection(this.collectionName);
                console.log('Collection reference created:', userRef);
                console.log('Collection path:', this.collectionName);
                
                // Test if we can access the collection
                console.log('Testing collection access...');
                const testSnapshot = await window.firebase.firestore.getDocs(userRef);
                console.log('Collection access test successful, existing docs:', testSnapshot.size);
                
                const docRef = await window.firebase.firestore.addDoc(userRef, newUser);
                console.log('Firebase submission successful, document ID:', docRef.id);
            } catch (firebaseError) {
                console.error('Firebase submission error:', firebaseError);
                console.error('Error details:', firebaseError.message, firebaseError.code);
                console.error('Error name:', firebaseError.name);
                console.error('Full error object:', firebaseError);
                throw firebaseError;
            }

            // Add to local array
            this.users.push({
                id: docRef.id,
                ...newUser
            });

            console.log('✅ User registered successfully:', email);
            console.log('✅ Added to local users array, total users:', this.users.length);
            return { success: true, userId: docRef.id };
        } catch (error) {
            console.error('Error registering user:', error);
            throw error;
        }
    }

    // Authenticate user
    async authenticateUser(username, password) {
        try {
            console.log('Authenticating user:', username);

            // Find user by username
            const user = this.users.find(u => u.user === username);
            if (!user) {
                throw new Error('User not found');
            }

            // Verify password
            if (!this.verifyPassword(password, user.password_hash)) {
                throw new Error('Invalid password');
            }

            // Set current user
            this.currentUser = user;
            console.log('User authenticated successfully:', username);
            return { success: true, user: user };
        } catch (error) {
            console.error('Authentication error:', error);
            throw error;
        }
    }

    // Get current user
    getCurrentUser() {
        return this.currentUser;
    }

    // Logout user
    logoutUser() {
        this.currentUser = null;
        console.log('User logged out');
    }

    // Get all users (for admin purposes)
    getAllUsers() {
        return this.users;
    }

    // Update user profile
    async updateUserProfile(userId, updates) {
        try {
            console.log('Updating user profile:', userId);

            // Update in Firebase
            const userRef = window.firebase.firestore.doc(
                `${this.collectionName}/${userId}`
            );
            await window.firebase.firestore.updateDoc(userRef, updates);

            // Update local array
            const userIndex = this.users.findIndex(u => u.id === userId);
            if (userIndex !== -1) {
                this.users[userIndex] = { ...this.users[userIndex], ...updates };
            }

            console.log('User profile updated successfully');
            return { success: true };
        } catch (error) {
            console.error('Error updating user profile:', error);
            throw error;
        }
    }

    // Delete user
    async deleteUser(userId) {
        try {
            console.log('Deleting user:', userId);

            // Delete from Firebase
            const userRef = window.firebase.firestore.doc(
                `${this.collectionName}/${userId}`
            );
            await window.firebase.firestore.deleteDoc(userRef);

            // Remove from local array
            this.users = this.users.filter(u => u.id !== userId);

            console.log('User deleted successfully');
            return { success: true };
        } catch (error) {
            console.error('Error deleting user:', error);
            throw error;
        }
    }
}

// Create global user manager instance
window.userManager = new UserManager();

// Initialize user manager when Firebase is ready
document.addEventListener('DOMContentLoaded', async () => {
    // Wait for Firebase to be initialized
    const waitForFirebase = () => {
        return new Promise((resolve) => {
            const checkFirebase = () => {
                if (window.firebase && window.firebase.firestore) {
                    console.log('Firebase is ready, initializing User Manager');
                    resolve();
                } else {
                    console.log('Waiting for Firebase to initialize...');
                    setTimeout(checkFirebase, 100);
                }
            };
            checkFirebase();
        });
    };

    try {
        await waitForFirebase();
        await window.userManager.initialize();
        console.log('User Manager ready');
    } catch (error) {
        console.error('Error initializing User Manager:', error);
    }
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UserManager;
} 