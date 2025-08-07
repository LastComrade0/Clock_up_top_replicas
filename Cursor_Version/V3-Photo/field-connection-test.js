// field-connection-test.js - Test the connection between form fields and Firebase collection

console.log('=== FIELD CONNECTION TEST SCRIPT LOADED ===');
console.log('Script loaded at:', new Date().toISOString());

// Test function to verify field mapping
async function testFieldConnection() {
    console.log('\n--- Testing Form Field to Firebase Connection ---');
    
    // Simulate form data (same as what the sign-up form collects)
    const testFormData = {
        username: 'testuser123',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123'
    };
    
    console.log('📝 Form Data Collected:');
    console.log('Username:', testFormData.username);
    console.log('Email:', testFormData.email);
    console.log('Password:', testFormData.password);
    console.log('Confirm Password:', testFormData.confirmPassword);
    
    // Test UserManager field processing (same as auth.js)
    console.log('\n🔧 UserManager Processing:');
    const email = testFormData.email.trim();
    const username = testFormData.username.trim();
    const password = testFormData.password;
    
    console.log('Processed email:', email);
    console.log('Processed username:', username);
    console.log('Processed password length:', password.length);
    
    // Test UserManager user object creation (same as user-management.js)
    console.log('\n📦 User Object Creation:');
    const passwordHash = window.userManager ? window.userManager.hashPassword(password) : 'test_hash';
    
    const userObject = {
        email: email,
        password_hash: passwordHash,
        user: username,
        created_at: new Date().toISOString()
    };
    
    console.log('User object for Firebase:');
    console.log('Email:', userObject.email);
    console.log('Username (user field):', userObject.user);
    console.log('Password hash:', userObject.password_hash.substring(0, 20) + '...');
    console.log('Created at:', userObject.created_at);
    
    // Test Firebase collection structure
    console.log('\n🔥 Firebase Collection Structure:');
    console.log('Collection name: clock_user');
    console.log('Document fields expected:');
    console.log('  - email (string)');
    console.log('  - password_hash (string)');
    console.log('  - user (string)');
    console.log('  - created_at (timestamp)');
    
    // Test direct Firebase submission
    try {
        console.log('\n🚀 Testing Direct Firebase Submission:');
        
        if (window.firebase && window.firebase.firestore) {
            const userRef = window.firebase.firestore.collection('clock_user');
            const docRef = await window.firebase.firestore.addDoc(userRef, userObject);
            
            console.log('✅ Direct Firebase submission successful!');
            console.log('Document ID:', docRef.id);
            console.log('Document path: clock_user/' + docRef.id);
            
            // Verify the document was created
            const docSnapshot = await window.firebase.firestore.getDoc(docRef);
            if (docSnapshot.exists()) {
                const data = docSnapshot.data();
                console.log('✅ Document verified in Firebase:');
                console.log('  Email:', data.email);
                console.log('  Username:', data.user);
                console.log('  Password hash:', data.password_hash.substring(0, 20) + '...');
                console.log('  Created at:', data.created_at);
            } else {
                console.log('❌ Document not found in Firebase');
            }
            
            return { success: true, docId: docRef.id };
        } else {
            console.log('❌ Firebase not available');
            return { success: false, error: 'Firebase not available' };
        }
    } catch (error) {
        console.error('❌ Direct Firebase submission failed:', error);
        console.error('Error details:', error.message, error.code);
        return { success: false, error: error.message };
    }
}

// Test UserManager registration
async function testUserManagerRegistration() {
    console.log('\n--- Testing UserManager Registration ---');
    
    if (!window.userManager) {
        console.log('❌ UserManager not available');
        return { success: false, error: 'UserManager not available' };
    }
    
    try {
        const testUser = {
            email: 'testmanager@example.com',
            password: 'testpass123',
            username: 'testmanager'
        };
        
        console.log('Testing UserManager registration with:', testUser);
        const result = await window.userManager.registerUser(
            testUser.email,
            testUser.password,
            testUser.username
        );
        
        console.log('✅ UserManager registration result:', result);
        return result;
    } catch (error) {
        console.error('❌ UserManager registration failed:', error);
        return { success: false, error: error.message };
    }
}

// Run comprehensive field connection test
async function runFieldConnectionTest() {
    console.log('Starting field connection test...\n');
    
    // Wait for UserManager to be ready
    if (!window.userManager) {
        console.log('Waiting for UserManager to initialize...');
        await new Promise(resolve => {
            const check = () => {
                if (window.userManager) {
                    resolve();
                } else {
                    setTimeout(check, 100);
                }
            };
            check();
        });
    }
    
    // Test field connection
    const fieldTest = await testFieldConnection();
    
    // Test UserManager registration
    const managerTest = await testUserManagerRegistration();
    
    console.log('\n=== FIELD CONNECTION TEST RESULTS ===');
    console.log('Direct Firebase test:', fieldTest.success ? '✅ PASS' : '❌ FAIL');
    console.log('UserManager test:', managerTest.success ? '✅ PASS' : '❌ FAIL');
    
    if (fieldTest.success) {
        console.log('✅ Form fields are correctly connected to Firebase');
    } else {
        console.log('❌ Form fields connection issue:', fieldTest.error);
    }
    
    if (managerTest.success) {
        console.log('✅ UserManager registration is working');
    } else {
        console.log('❌ UserManager registration issue:', managerTest.error);
    }
}

// Export for use in browser console
if (typeof window !== 'undefined') {
    window.testFieldConnection = {
        testFieldConnection,
        testUserManagerRegistration,
        runFieldConnectionTest
    };
    
    console.log('Field connection test functions available as window.testFieldConnection');
    console.log('Run window.testFieldConnection.runFieldConnectionTest() to execute the test');
}

// Auto-run test if this script is loaded directly
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(runFieldConnectionTest, 2000); // Give time for Firebase to initialize
    });
} 