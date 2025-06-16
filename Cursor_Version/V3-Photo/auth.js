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
    const email = form.querySelector('.auth-email').value.trim();
    const password = form.querySelector('.auth-password').value;
    const messageEl = form.querySelector('.auth-form-message');
    
    // Basic validation
    if (!email || !password) {
        showMessage(messageEl, 'Please fill in all fields', 'error');
        return;
    }
    
    if (action === 'signup') {
        const confirmPassword = form.querySelector('.auth-confirm-password').value;
        if (password !== confirmPassword) {
            showMessage(messageEl, 'Passwords do not match', 'error');
            return;
        }
        if (password.length < 6) {
            showMessage(messageEl, 'Password must be at least 6 characters', 'error');
            return;
        }
    }
    
    try {
        showMessage(messageEl, action === 'signin' ? 'Signing in...' : 'Creating account...', 'info');
        
        if (action === 'signin') {
            // Sign in with email and password
            await firebase.auth.signInWithEmailAndPassword(email, password);
        } else {
            // Create new user account
            const userCredential = await firebase.auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;
            
            // Create user document in Firestore
            await firebase.firestore.setDoc(
                firebase.firestore.doc(firebase.firestore.db, 'users', user.uid),
                {
                    email: user.email,
                    createdAt: firebase.firestore.serverTimestamp(),
                    lastLogin: firebase.firestore.serverTimestamp()
                }
            );
            
            showMessage(messageEl, 'Account created successfully!', 'success');
        }
    } catch (error) {
        console.error('Auth error:', error);
        let errorMessage = 'An error occurred. Please try again.';
        
        // Handle specific error cases
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
            errorMessage = 'Invalid email or password';
        } else if (error.code === 'auth/email-already-in-use') {
            errorMessage = 'An account with this email already exists';
        } else if (error.code === 'auth/weak-password') {
            errorMessage = 'Password should be at least 6 characters';
        } else if (error.code === 'auth/invalid-email') {
            errorMessage = 'Invalid email address';
        }
        
        showMessage(messageEl, errorMessage, 'error');
    }
}

// Update UI for authenticated user
function updateUIForAuthenticatedUser(user) {
    document.querySelectorAll('.widget-placeholder').forEach(widget => {
        const notSignedInEl = widget.querySelector('.not-signed-in');
        const authButtons = widget.querySelector('.auth-buttons');
        
        if (notSignedInEl) {
            notSignedInEl.textContent = user.email;
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
    document.querySelectorAll('.auth-form-submit').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const form = this.closest('.auth-form');
            const widget = form.closest('.widget-placeholder');
            const isSignIn = form.id === 'signin-form';
            
            handleAuth(widget, form, isSignIn ? 'signin' : 'signup');
        });
    });

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
