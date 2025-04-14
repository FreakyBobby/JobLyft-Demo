document.addEventListener('DOMContentLoaded', () => {
    // Get form elements
    const registerForm = document.getElementById('register-form');
    const fullnameInput = document.getElementById('fullname');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const roleSelect = document.getElementById('role');
    const phoneInput = document.getElementById('phone');
    const termsCheckbox = document.getElementById('terms');
    
    // Get error message elements
    const fullnameError = document.getElementById('fullname-error');
    const emailError = document.getElementById('email-error');
    const passwordError = document.getElementById('password-error');
    const confirmPasswordError = document.getElementById('confirm-password-error');
    const roleError = document.getElementById('role-error');
    const phoneError = document.getElementById('phone-error');
    const termsError = document.getElementById('terms-error');
    
    // Password toggle functionality
    const togglePassword = document.getElementById('toggle-password');
    if (togglePassword) {
        togglePassword.addEventListener('click', () => {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            togglePassword.classList.toggle('fa-eye');
            togglePassword.classList.toggle('fa-eye-slash');
        });
    }
    
    // Add real-time password validation
    passwordInput.addEventListener('input', () => {
        const password = passwordInput.value;
        const isValid = validatePassword(password);
        
        // Show/hide error message
        if (password && !isValid) {
            showError(passwordError, 'Password must meet all requirements');
        } else {
            clearError(passwordError);
        }
    });

    // Add confirm password validation
    confirmPasswordInput.addEventListener('input', () => {
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        
        if (confirmPassword && password !== confirmPassword) {
            showError(confirmPasswordError, 'Passwords do not match');
        } else {
            clearError(confirmPasswordError);
        }
    });
    
    // Validation functions
    function validateEmail(email) {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }
    
    function validatePassword(password) {
        const minLength = password.length >= 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        // Update password requirement indicators
        document.getElementById('length-check').classList.toggle('valid', minLength);
        document.getElementById('uppercase-check').classList.toggle('valid', hasUpperCase);
        document.getElementById('lowercase-check').classList.toggle('valid', hasLowerCase);
        document.getElementById('number-check').classList.toggle('valid', hasNumber);
        document.getElementById('special-check').classList.toggle('valid', hasSpecial);

        return minLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecial;
    }
    
    function validateFullName(name) {
        return name.length >= 2;
    }
    
    function validatePhone(phone) {
        if (!phone) return true; // Phone is optional
        const re = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
        return re.test(String(phone));
    }
    
    // Show error message
    function showError(element, message) {
        if (element) {
            element.textContent = message;
            element.style.display = 'block';
        }
    }
    
    // Clear error message
    function clearError(element) {
        if (element) {
            element.textContent = '';
            element.style.display = 'none';
        }
    }
    
    // Clear all error messages
    function clearAllErrors() {
        const errorElements = [fullnameError, emailError, passwordError, confirmPasswordError, roleError, phoneError, termsError];
        errorElements.forEach(element => {
            if (element) {
                clearError(element);
            }
        });
    }
    
    // Form submission
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Clear previous error messages
            clearAllErrors();
            
            // Get form values
            const fullname = fullnameInput ? fullnameInput.value.trim() : '';
            const email = emailInput ? emailInput.value.trim() : '';
            const password = passwordInput ? passwordInput.value : '';
            const confirmPassword = confirmPasswordInput ? confirmPasswordInput.value : '';
            const role = roleSelect ? roleSelect.value : 'jobseeker'; // Default to jobseeker if role select doesn't exist
            const phone = phoneInput ? phoneInput.value.trim() : ''; // Optional field
            const terms = termsCheckbox ? termsCheckbox.checked : false;
            
            // Validate full name
            if (!fullname) {
                showError(fullnameError, 'Full name is required');
                return;
            }
            
            if (!validateFullName(fullname)) {
                showError(fullnameError, 'Please enter a valid full name');
                return;
            }
            
            // Validate email
            if (!email) {
                showError(emailError, 'Email is required');
                return;
            }
            
            if (!validateEmail(email)) {
                showError(emailError, 'Please enter a valid email address');
                return;
            }
            
            // Validate password
            if (!password) {
                showError(passwordError, 'Password is required');
                return;
            }
            
            if (!validatePassword(password)) {
                showError(passwordError, 'Password must meet all requirements');
                return;
            }
            
            // Validate confirm password
            if (password !== confirmPassword) {
                showError(confirmPasswordError, 'Passwords do not match');
                return;
            }
            
            // Validate terms
            if (!terms) {
                showError(termsError, 'You must agree to the Terms of Service and Privacy Policy');
                return;
            }
            
            try {
                // Disable submit button and show loading state
                const submitButton = registerForm.querySelector('button[type="submit"]');
                submitButton.disabled = true;
                submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating Account...';
                
                // Send registration request
                const response = await fetch('/api/users/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        name: fullname,
                        email,
                        password,
                        role,
                        phone
                    })
                });
                
                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(data.message || 'Registration failed');
                }
                
                // Store the token
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                
                // Show success message
                showSuccessMessage();
                
                // Redirect based on role
                setTimeout(() => {
                    window.location.href = data.user.role === 'employer' ? 'employer-dashboard.html' : 'job-search.html';
                }, 2000);
            } catch (error) {
                console.error('Registration error:', error);
                
                // Reset button state
                const submitButton = registerForm.querySelector('button[type="submit"]');
                submitButton.disabled = false;
                submitButton.innerHTML = 'Create Account';
                
                // Show error message
                if (error.message.includes('Email already registered')) {
                    showError(emailError, 'This email is already registered');
                } else {
                    showError(passwordError, error.message || 'Registration failed. Please try again.');
                }
            }
        });
    }
    
    // Show success message
    function showSuccessMessage() {
        if (!registerForm) return;
        
        // Create success message element
        const successMessage = document.createElement('div');
        successMessage.className = 'success-message';
        successMessage.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <p>Registration successful! Redirecting to dashboard...</p>
            <p class="login-link">Or <a href="/login.html">click here</a> to login</p>
        `;
        
        // Add success message to the form
        registerForm.appendChild(successMessage);
        
        // Disable form inputs
        if (fullnameInput) fullnameInput.disabled = true;
        if (emailInput) emailInput.disabled = true;
        if (passwordInput) passwordInput.disabled = true;
        if (confirmPasswordInput) confirmPasswordInput.disabled = true;
        if (roleSelect) roleSelect.disabled = true;
        if (phoneInput) phoneInput.disabled = true;
        if (termsCheckbox) termsCheckbox.disabled = true;
        
        const submitButton = registerForm.querySelector('.form-actions button');
        if (submitButton) submitButton.disabled = true;
    }
});
