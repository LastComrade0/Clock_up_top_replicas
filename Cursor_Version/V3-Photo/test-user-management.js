// test-user-management.js - Test script for user management functionality

// This script demonstrates how to use the UserManager class
// Run this in the browser console or as a Node.js script

console.log('=== User Management Test ===');

// Test password hashing
function testPasswordHashing() {
    console.log('\n--- Testing Password Hashing ---');
    
    const testPassword = 'testpassword123';
    const hash = window.userManager.hashPassword(testPassword);
    
    console.log('Original password:', testPassword);
    console.log('Hashed password:', hash);
    console.log('Hash length:', hash.length);
    
    // Test verification
    const isValid = window.userManager.verifyPassword(testPassword, hash);
    console.log('Password verification:', isValid ? '✓ PASS' : '✗ FAIL');
    
    // Test wrong password
    const isWrongValid = window.userManager.verifyPassword('wrongpassword', hash);
    console.log('Wrong password verification:', isWrongValid ? '✗ FAIL' : '✓ PASS');
}

// Test user registration
async function testUserRegistration() {
    console.log('\n--- Testing User Registration ---');
    
    try {
        const testUser = {
            email: 'test@example.com',
            password: 'testpass123',
            username: 'testuser'
        };
        
        console.log('Registering user:', testUser.email);
        const result = await window.userManager.registerUser(
            testUser.email, 
            testUser.password, 
            testUser.username
        );
        
        console.log('Registration result:', result);
        console.log('✓ Registration successful');
        
        return result;
    } catch (error) {
        console.error('✗ Registration failed:', error.message);
        return null;
    }
}

// Test user authentication
async function testUserAuthentication() {
    console.log('\n--- Testing User Authentication ---');
    
    try {
        const testUser = {
            email: 'test@example.com',
            password: 'testpass123'
        };
        
        console.log('Authenticating user:', testUser.email);
        const result = await window.userManager.authenticateUser(
            testUser.email, 
            testUser.password
        );
        
        console.log('Authentication result:', result);
        console.log('✓ Authentication successful');
        
        return result;
    } catch (error) {
        console.error('✗ Authentication failed:', error.message);
        return null;
    }
}

// Test loading users from Firebase
async function testLoadUsers() {
    console.log('\n--- Testing Load Users from Firebase ---');
    
    try {
        const users = await window.userManager.loadUsersFromFirebase();
        console.log('Users loaded:', users.length);
        
        users.forEach((user, index) => {
            console.log(`User ${index + 1}:`);
            console.log('  ID:', user.id);
            console.log('  Email:', user.email);
            console.log('  Username:', user.user);
            console.log('  Password Hash:', user.password_hash.substring(0, 20) + '...');
        });
        
        console.log('✓ Load users successful');
        return users;
    } catch (error) {
        console.error('✗ Load users failed:', error.message);
        return [];
    }
}

// Test current user functionality
function testCurrentUser() {
    console.log('\n--- Testing Current User ---');
    
    const currentUser = window.userManager.getCurrentUser();
    
    if (currentUser) {
        console.log('Current user:', currentUser);
        console.log('✓ Current user set');
    } else {
        console.log('No current user');
    }
    
    // Test logout
    window.userManager.logoutUser();
    const afterLogout = window.userManager.getCurrentUser();
    console.log('After logout:', afterLogout ? 'User still logged in' : 'No user');
    console.log('✓ Logout successful');
}

// Test user profile update
async function testUpdateUser() {
    console.log('\n--- Testing User Profile Update ---');
    
    try {
        // First, authenticate a user
        await window.userManager.authenticateUser('test@example.com', 'testpass123');
        const currentUser = window.userManager.getCurrentUser();
        
        if (currentUser) {
            console.log('Updating user profile for:', currentUser.email);
            
            const updates = {
                user: 'updated_username',
                last_updated: new Date().toISOString()
            };
            
            const result = await window.userManager.updateUserProfile(currentUser.id, updates);
            console.log('Update result:', result);
            console.log('✓ Profile update successful');
            
            return result;
        } else {
            console.log('No user to update');
            return null;
        }
    } catch (error) {
        console.error('✗ Profile update failed:', error.message);
        return null;
    }
}

// Test user deletion
async function testDeleteUser() {
    console.log('\n--- Testing User Deletion ---');
    
    try {
        const users = window.userManager.getAllUsers();
        if (users.length > 0) {
            const userToDelete = users[0];
            console.log('Deleting user:', userToDelete.email);
            
            const result = await window.userManager.deleteUser(userToDelete.id);
            console.log('Delete result:', result);
            console.log('✓ User deletion successful');
            
            return result;
        } else {
            console.log('No users to delete');
            return null;
        }
    } catch (error) {
        console.error('✗ User deletion failed:', error.message);
        return null;
    }
}

// Run all tests
async function runAllTests() {
    console.log('Starting comprehensive user management tests...\n');
    
    // Wait for user manager to be ready
    if (!window.userManager) {
        console.log('Waiting for User Manager to initialize...');
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
    
    // Run tests in sequence
    testPasswordHashing();
    await testLoadUsers();
    await testUserRegistration();
    await testUserAuthentication();
    testCurrentUser();
    await testUpdateUser();
    await testDeleteUser();
    
    console.log('\n=== All Tests Completed ===');
}

// Export functions for use in browser console
if (typeof window !== 'undefined') {
    window.testUserManagement = {
        testPasswordHashing,
        testUserRegistration,
        testUserAuthentication,
        testLoadUsers,
        testCurrentUser,
        testUpdateUser,
        testDeleteUser,
        runAllTests
    };
    
    console.log('User management test functions available as window.testUserManagement');
    console.log('Run window.testUserManagement.runAllTests() to execute all tests');
}

// Auto-run tests if this script is loaded directly
if (typeof document !== 'undefined') {
    // Wait for DOM and user manager to be ready
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(runAllTests, 2000); // Give time for Firebase to initialize
    });
} 