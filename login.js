// Simple login script
document.addEventListener('DOMContentLoaded', function() {
    // Get form elements
    const loginForm = document.getElementById('login-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const rememberMe = document.getElementById('remember');
    const submitBtn = document.getElementById('submit-btn');
    const emailError = document.getElementById('email-error');
    const passwordError = document.getElementById('password-error');
    const togglePassword = document.getElementById('toggle-password');
    
    // Toggle password visibility
    if (togglePassword) {
        togglePassword.addEventListener('click', function() {
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                togglePassword.querySelector('i').className = 'fas fa-eye-slash';
            } else {
                passwordInput.type = 'password';
                togglePassword.querySelector('i').className = 'fas fa-eye';
            }
        });
    }
    
    // Check for remembered email
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
        emailInput.value = savedEmail;
        if (rememberMe) rememberMe.checked = true;
    }
    
    // Handle form submission
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Clear previous errors
        emailError.textContent = '';
        passwordError.textContent = '';
        
        // Get input values
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        
        // Validate email
        if (!email) {
            emailError.textContent = 'Email is required';
            return;
        }
        
        // Validate password
        if (!password) {
            passwordError.textContent = 'Password is required';
            return;
        }
        
        // Disable button and show loading
        submitBtn.disabled = true;
        const btnText = submitBtn.querySelector('.btn-text');
        if (btnText) {
            btnText.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
        } else {
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
        }
        
        // Send login request
        fetch('/api/users/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.token) {
                // Login successful
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                
                // Save email if remember me is checked
                if (rememberMe && rememberMe.checked) {
                    localStorage.setItem('rememberedEmail', email);
                } else {
                    localStorage.removeItem('rememberedEmail');
                }
                
                // Show success message
                showNotification('Login successful! Redirecting...', 'success');
                
                // Redirect based on user role
                setTimeout(() => {
                    const user = data.user;
                    if (user.role === 'employer') {
                        window.location.href = 'employer-dashboard.html';
                    } else if (user.role === 'jobseeker') {
                        window.location.href = 'student-dashboard.html';
                    } else {
                        window.location.href = 'index.html';
                    }
                }, 1500);
            } else {
                // Login failed
                throw new Error(data.message || 'Invalid email or password');
            }
        })
        .catch(error => {
            console.error('Login error:', error);
            showNotification(error.message || 'Login failed. Please try again.', 'error');
            
            // Clear password
            passwordInput.value = '';
        })
        .finally(() => {
            // Re-enable button
            submitBtn.disabled = false;
            if (btnText) {
                btnText.textContent = 'Login';
            } else {
                submitBtn.textContent = 'Login';
            }
        });
    });
    
    // Show notification function
    function showNotification(message, type = 'success') {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(n => n.remove());
        
        // Create notification
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            ${message}
        `;
        
        // Add to body
        document.body.appendChild(notification);
        
        // Remove after delay
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
});
