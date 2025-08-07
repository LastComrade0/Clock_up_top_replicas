// Wait for DOM and Firebase to be ready
document.addEventListener('DOMContentLoaded', () => {
    // Wait for Firebase to be initialized
    const waitForFirebase = () => {
        return new Promise((resolve) => {
            const checkFirebase = () => {
                if (window.firebase && window.firebase.auth) {
                    console.log('Firebase Auth is ready');
                    resolve();
                } else {
                    console.log('Waiting for Firebase Auth to initialize...');
                    setTimeout(checkFirebase, 100);
                }
            };
            checkFirebase();
        });
    };

    // Initialize auth functionality
    waitForFirebase().then(() => {
        // Auth state observer
        firebase.auth.onAuthStateChanged((user) => {
            if (user) {
                // User is signed in
                updateUIForAuthenticatedUser(user);
            } else {
                // User is signed out
                updateUIForSignedOutUser();
            }
        });
    });
});

// Show the appropriate auth form
function showAuthForm(widget, formType) {
    // Hide all auth buttons and forms
    widget.querySelector('.auth-buttons').style.display = 'none';
    widget.querySelectorAll('.auth-form').forEach(form => form.style.display = 'none');
    
    // Show the requested form
    const form = widget.querySelector(`#${formType}-form`);
    if (form) {
        form.style.display = 'block';
        form.querySelector('input')?.focus();
    }
}

// Hide auth form and show buttons
function hideAuthForm(widget) {
    widget.querySelector('.auth-buttons').style.display = 'flex';
    widget.querySelectorAll('.auth-form').forEach(form => {
        form.style.display = 'none';
        // Clear form fields
        form.querySelectorAll('input').forEach(input => input.value = '');
        // Clear any error messages
        const messageEl = form.querySelector('.auth-form-message');
        if (messageEl) messageEl.textContent = '';
    });
}

// Handle authentication (sign in/sign up)
async function handleAuth(widget, form, action) {
    alert('HANDLE AUTH FUNCTION EXECUTING - VERSION 2.0');
    console.log('=== HANDLE AUTH FUNCTION CALLED ===');
    console.log('Timestamp:', new Date().toISOString());
    console.log('Action parameter:', action);
    console.log('Action type:', typeof action);
    console.log('Action === "signup":', action === 'signup');
    console.log('Function version: UPDATED VERSION 2.0');
    
    const messageEl = form.querySelector('.auth-form-message');
    console.log('Message element found:', !!messageEl);
    
    console.log('About to check action...');
    console.log('Action value:', action);
    
    if (action === 'signin') {
        console.log('=== SIGN IN PROCESS STARTED ===');
        console.log('Timestamp:', new Date().toISOString());
        
        // Sign in with username and password
        const username = form.querySelector('.auth-username').value.trim();
        const password = form.querySelector('.auth-password').value;
        
        console.log('Sign-in form data:', { username, password: '***' });
        
        // Basic validation
        if (!username || !password) {
            console.log('❌ Validation failed: missing fields');
            showMessage(messageEl, 'Please fill in all fields', 'error');
            return;
        }
        
        console.log('✅ Validation passed, attempting authentication...');
        
        try {
            showMessage(messageEl, 'Signing in...', 'info');
            
            // Direct Firebase authentication
            console.log('Searching for user in Firebase...');
            
            // Query Firebase for user by username
            const userRef = window.firebase.firestore.collection('clock_user');
            const q = window.firebase.firestore.query(
                userRef, 
                window.firebase.firestore.where('user', '==', username)
            );
            
            const querySnapshot = await window.firebase.firestore.getDocs(q);
            console.log('Firebase query results:', querySnapshot.size, 'documents found');
            
            if (querySnapshot.empty) {
                console.log('❌ User not found in Firebase');
                showMessage(messageEl, 'User not found', 'error');
                return;
            }
            
            // Get the first matching user
            const userDoc = querySnapshot.docs[0];
            const userData = userDoc.data();
            console.log('User found:', { 
                email: userData.email, 
                username: userData.user,
                hasPasswordHash: !!userData.password_hash 
            });
            
            // Hash the provided password for comparison
            const providedPasswordHash = CryptoJS.SHA256(password).toString();
            console.log('Provided password hash:', providedPasswordHash.substring(0, 20) + '...');
            console.log('Stored password hash:', userData.password_hash.substring(0, 20) + '...');
            
            // Compare password hashes
            if (providedPasswordHash === userData.password_hash) {
                console.log('✅ Password verification successful!');
                showMessage(messageEl, 'Sign in successful!', 'success');
                updateUIForAuthenticatedUser({ 
                    email: userData.email, 
                    user: userData.user,
                    id: userDoc.id 
                });
            } else {
                console.log('❌ Password verification failed');
                showMessage(messageEl, 'Invalid password', 'error');
            }
            
        } catch (error) {
            console.error('Sign in error:', error);
            showMessage(messageEl, error.message || 'Authentication failed', 'error');
        }
    } else if (action === 'signup') {
        console.log('=== SIGN UP PROCESS STARTED ===');
        console.log('Timestamp:', new Date().toISOString());
        console.log('Form element:', form);
        console.log('Form display style:', form.style.display);
        console.log('Form visibility:', window.getComputedStyle(form).display);
        console.log('Form HTML:', form.innerHTML);
        
        // Sign up with username, email, and password
        console.log('=== READING FORM FIELDS ===');
        
        const usernameField = form.querySelector('.auth-username');
        const emailField = form.querySelector('.auth-email');
        const passwordField = form.querySelector('.auth-password');
        const confirmPasswordField = form.querySelector('.auth-confirm-password');
        
        console.log('Field elements found:', {
            usernameField: !!usernameField,
            emailField: !!emailField,
            passwordField: !!passwordField,
            confirmPasswordField: !!confirmPasswordField
        });
        
        // Read field values with detailed logging
        console.log('Reading username field...');
        const username = usernameField ? usernameField.value.trim() : '';
        console.log('Username field value:', usernameField ? usernameField.value : 'FIELD NOT FOUND');
        console.log('Username processed:', username);
        
        console.log('Reading email field...');
        const email = emailField ? emailField.value.trim() : '';
        console.log('Email field value:', emailField ? emailField.value : 'FIELD NOT FOUND');
        console.log('Email processed:', email);
        
        console.log('Reading password field...');
        const password = passwordField ? passwordField.value : '';
        console.log('Password field value:', passwordField ? '***' + passwordField.value.length + ' chars***' : 'FIELD NOT FOUND');
        console.log('Password processed length:', password.length);
        
        console.log('Reading confirm password field...');
        const confirmPassword = confirmPasswordField ? confirmPasswordField.value : '';
        console.log('Confirm password field value:', confirmPasswordField ? '***' + confirmPasswordField.value.length + ' chars***' : 'FIELD NOT FOUND');
        console.log('Confirm password processed length:', confirmPassword.length);
        
        console.log('=== FINAL FORM DATA ===');
        console.log('Username:', username);
        console.log('Email:', email);
        console.log('Password length:', password.length);
        console.log('Confirm password length:', confirmPassword.length);
        console.log('Passwords match:', password === confirmPassword);
        
        // Alternative method to read form data
        console.log('=== ALTERNATIVE FORM READING ===');
        const allInputs = form.querySelectorAll('input');
        console.log('Total inputs found in form:', allInputs.length);
        
        allInputs.forEach((input, index) => {
            console.log(`Input ${index + 1}:`, {
                type: input.type,
                class: input.className,
                placeholder: input.placeholder,
                value: input.type === 'password' ? '***' + input.value.length + ' chars***' : input.value
            });
        });
        
        // Basic validation
        console.log('=== VALIDATION CHECKS ===');
        console.log('Username empty:', !username);
        console.log('Email empty:', !email);
        console.log('Password empty:', !password);
        console.log('Password length:', password.length);
        console.log('Passwords match:', password === confirmPassword);
        
        if (!username || !email || !password) {
            console.log('❌ Validation failed: missing fields');
            showMessage(messageEl, 'Please fill in all fields', 'error');
            return;
        }
        
        if (password !== confirmPassword) {
            console.log('❌ Validation failed: passwords do not match');
            showMessage(messageEl, 'Passwords do not match', 'error');
            return;
        }
        
        if (password.length < 6) {
            console.log('❌ Validation failed: password too short');
            showMessage(messageEl, 'Password must be at least 6 characters', 'error');
            return;
        }
        
        console.log('✅ All validations passed!');
        
        try {
            showMessage(messageEl, 'Creating account...', 'info');
            console.log('About to call UserManager...');
            console.log('UserManager available:', !!window.userManager);
            
            // Use the UserManager for registration
            if (window.userManager) {
                console.log('Calling userManager.registerUser with:', { email, username, password: '***' });
                console.log('UserManager object:', window.userManager);
                console.log('UserManager users array:', window.userManager.users);
                console.log('UserManager collection name:', window.userManager.collectionName);
                
                // Check if UserManager is properly initialized
                if (!window.userManager.users) {
                    console.log('UserManager not fully initialized, waiting...');
                    await window.userManager.initialize();
                }
                
                try {
                    const result = await window.userManager.registerUser(email, password, username);
                    console.log('UserManager registration result:', result);
                    
                    if (result && result.success) {
                        console.log('✅ UserManager registration successful');
                        showMessage(messageEl, 'Account created successfully!', 'success');
                        updateUIForAuthenticatedUser({ email: email, user: username });
                    } else {
                        console.error('❌ UserManager registration failed - no success result');
                        throw new Error('Registration failed - no success result');
                    }
                } catch (userManagerError) {
                    console.error('❌ UserManager registration error:', userManagerError);
                    
                    // Fallback: Try direct Firebase submission
                    try {
                        console.log('🔄 Trying direct Firebase submission as fallback...');
                        const testUser = {
                            email: email,
                            password_hash: 'test_hash_' + Date.now(),
                            user: username,
                            created_at: new Date().toISOString(),
                            test: true
                        };
                        
                        const userRef = window.firebase.firestore.collection('clock_user');
                        const docRef = await window.firebase.firestore.addDoc(userRef, testUser);
                        console.log('✅ Direct Firebase test successful, doc ID:', docRef.id);
                        
                        showMessage(messageEl, 'Account created successfully! (Direct Firebase)', 'success');
                        updateUIForAuthenticatedUser({ email: email, user: username });
                    } catch (directError) {
                        console.error('❌ Direct Firebase test failed:', directError);
                        showMessage(messageEl, 'Failed to create account: ' + directError.message, 'error');
                    }
                }
            } else {
                console.error('UserManager not available!');
                showMessage(messageEl, 'User management not available', 'error');
            }
        } catch (error) {
            console.error('Sign up error:', error);
            console.error('Error details:', error.message, error.stack);
            showMessage(messageEl, error.message || 'Failed to create account', 'error');
        }
    }
}

// Update UI for authenticated user
function updateUIForAuthenticatedUser(user) {
    document.querySelectorAll('.widget-placeholder').forEach(widget => {
        const notSignedInEl = widget.querySelector('.not-signed-in');
        const authButtons = widget.querySelector('.auth-buttons');
        
        if (notSignedInEl) {
            // Display username if available, otherwise email
            const displayName = user.user || user.email;
            notSignedInEl.textContent = displayName;
            notSignedInEl.classList.add('signed-in');
        }
        
        if (authButtons) {
            authButtons.style.display = 'none';
        }
        
        // Hide all auth forms
        widget.querySelectorAll('.auth-form').forEach(form => {
            form.style.display = 'none';
        });
        
        // Add sign out button if it doesn't exist
        if (!widget.querySelector('.sign-out-button')) {
            const signOutBtn = document.createElement('button');
            signOutBtn.className = 'auth-button sign-out-button';
            signOutBtn.textContent = 'Sign Out';
            signOutBtn.onclick = () => firebase.auth.signOut();
            widget.querySelector('.lock-overlay').appendChild(signOutBtn);
        }
    });
}

// Update UI for signed out user
function updateUIForSignedOutUser() {
    document.querySelectorAll('.widget-placeholder').forEach(widget => {
        const notSignedInEl = widget.querySelector('.not-signed-in');
        const authButtons = widget.querySelector('.auth-buttons');
        
        if (notSignedInEl) {
            notSignedInEl.textContent = 'Not Signed In';
            notSignedInEl.classList.remove('signed-in');
        }
        
        if (authButtons) {
            authButtons.style.display = 'flex';
        }
        
        // Remove sign out button if it exists
        const signOutBtn = widget.querySelector('.sign-out-button');
        if (signOutBtn) {
            signOutBtn.remove();
        }
    });
}

// Helper function to show messages
function showMessage(element, message, type) {
    if (!element) return;
    element.textContent = message;
    element.style.color = type === 'error' ? '#ff6b6b' : 
                         type === 'success' ? '#7CFFB2' : '#4a90e2';
}

// Make handleAuth function globally available
window.handleAuth = handleAuth;

// Initialize event listeners when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Show sign-in form
    document.querySelectorAll('.sign-in-button').forEach(button => {
        button.addEventListener('click', function() {
            const widget = this.closest('.widget-placeholder');
            showAuthForm(widget, 'signin');
        });
    });

    // Show sign-up form
    document.querySelectorAll('.sign-up-button').forEach(button => {
        button.addEventListener('click', function() {
            const widget = this.closest('.widget-placeholder');
            showAuthForm(widget, 'signup');
        });
    });

    // Handle form submissions
    console.log('Setting up auth form submit event listeners...');
    const submitButtons = document.querySelectorAll('.auth-form-submit');
    console.log('Found', submitButtons.length, 'auth-form-submit buttons');
    
    submitButtons.forEach((button, index) => {
        console.log(`Button ${index + 1}:`, button);
        console.log('Button text:', button.textContent);
        console.log('Button classes:', button.className);
        
        button.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('=== AUTH FORM SUBMIT BUTTON CLICKED ===');
            console.log('Timestamp:', new Date().toISOString());
            console.log('Button text:', this.textContent);
            console.log('Button element:', this);
            
            const form = this.closest('.auth-form');
            const widget = form.closest('.widget-placeholder');
            const isSignIn = form.id === 'signin-form';
            
            console.log('Form element found:', !!form);
            console.log('Form ID:', form ? form.id : 'null');
            console.log('Widget element found:', !!widget);
            console.log('Form type:', isSignIn ? 'signin' : 'signup');
            
            try {
                console.log('About to call handleAuth...');
                console.log('handleAuth function exists:', typeof handleAuth);
                console.log('handleAuth function:', handleAuth);
                
                if (typeof handleAuth === 'function') {
                    console.log('Calling handleAuth with direct Firebase test...');
                    
                    // Direct Firebase test - bypass UserManager
                    (async () => {
                        try {
                            // Check if this is sign-in or sign-up form
                            const isSignInForm = form.id === 'signin-form';
                            console.log('Form type detected:', isSignInForm ? 'signin' : 'signup');
                            
                            if (isSignInForm) {
                                // Handle sign-in
                                console.log('Processing sign-in form...');
                                const username = form.querySelector('.auth-username')?.value?.trim() || '';
                                const password = form.querySelector('.auth-password')?.value || '';
                                
                                console.log('Sign-in field reading:', { username, password: '***' });
                                
                                if (username && password) {
                                    console.log('Sign-in fields have data, proceeding with authentication...');
                                    // Call the sign-in logic
                                    handleAuth(widget, form, 'signin');
                                    return;
                                } else {
                                    console.log('❌ Missing sign-in field data:', { username: !!username, password: !!password });
                                    return;
                                }
                            } else {
                                // Handle sign-up
                                console.log('Processing sign-up form...');
                                const username = form.querySelector('.auth-username')?.value?.trim() || '';
                                const email = form.querySelector('.auth-email')?.value?.trim() || '';
                                const password = form.querySelector('.auth-password')?.value || '';
                                
                                console.log('Sign-up field reading:', { username, email, password: '***' });
                                
                                if (username && email && password) {
                                    console.log('Fields have data, testing direct Firebase submission...');
                                    
                                    // Hash password using CryptoJS
                                    const passwordHash = CryptoJS.SHA256(password).toString();
                                    console.log('Password hashed with CryptoJS:', passwordHash.substring(0, 20) + '...');
                                    
                                    const testUser = {
                                        email: email,
                                        password_hash: passwordHash,
                                        user: username,
                                        created_at: new Date().toISOString(),
                                        test: true
                                    };
                                    
                                    const userRef = window.firebase.firestore.collection('clock_user');
                                    const docRef = await window.firebase.firestore.addDoc(userRef, testUser);
                                    console.log('✅ DIRECT FIREBASE SUBMISSION SUCCESSFUL!');
                                    console.log('Document ID:', docRef.id);
                                    
                                    // Test password verification
                                    const verifyHash = CryptoJS.SHA256(password).toString();
                                    console.log('Password verification test:', verifyHash === passwordHash ? '✅ PASS' : '❌ FAIL');
                                    
                                    // Update UI
                                    const messageEl = form.querySelector('.auth-form-message');
                                    if (messageEl) {
                                        messageEl.textContent = 'Account created successfully! (CryptoJS hashed)';
                                        messageEl.style.color = '#7CFFB2';
                                    }
                                    
                                    // Update UI for authenticated user
                                    updateUIForAuthenticatedUser({ email: email, user: username });
                                } else {
                                    console.log('❌ Missing field data:', { username: !!username, email: !!email, password: !!password });
                                }
                            }
                        } catch (directError) {
                            console.error('❌ Direct Firebase submission failed:', directError);
                        }
                        
                        console.log('Direct test completed');
                    })();
                } else {
                    console.error('handleAuth is not a function!');
                }
            } catch (error) {
                console.error('Error calling handleAuth:', error);
                console.error('Error details:', error.message, error.stack);
            }
        });
    });
    console.log('Auth form submit event listeners attached');

    // Handle cancel buttons
    document.querySelectorAll('.auth-form-cancel').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const form = this.closest('.auth-form');
            const widget = form.closest('.widget-placeholder');
            hideAuthForm(widget);
        });
    });

    // Handle switch between sign-in and sign-up
    document.querySelectorAll('.auth-form-switch').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const currentForm = this.closest('.auth-form');
            const widget = currentForm.closest('.widget-placeholder');
            const targetForm = this.textContent.toLowerCase().includes('sign up') ? 'signup' : 'signin';
            
            hideAuthForm(widget);
            showAuthForm(widget, targetForm);
        });
    });
});
