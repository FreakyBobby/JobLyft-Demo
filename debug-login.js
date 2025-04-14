// Debug script to test login functionality
document.addEventListener('DOMContentLoaded', function() {
    console.log('Debug script loaded');
    
    // Get form elements
    const loginForm = document.getElementById('login-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const passwordError = document.getElementById('password-error');
    
    console.log('Form elements:', {
        loginForm: !!loginForm,
        emailInput: !!emailInput,
        passwordInput: !!passwordInput,
        passwordError: !!passwordError
    });
    
    // Add test button
    const testButton = document.createElement('button');
    testButton.type = 'button';
    testButton.textContent = 'Test Password Field';
    testButton.style.marginTop = '10px';
    testButton.style.backgroundColor = '#007bff';
    testButton.style.color = 'white';
    testButton.style.border = 'none';
    testButton.style.padding = '8px 15px';
    testButton.style.borderRadius = '4px';
    testButton.style.cursor = 'pointer';
    
    // Insert after the form
    loginForm.parentNode.insertBefore(testButton, loginForm.nextSibling);
    
    // Add event listener
    testButton.addEventListener('click', function() {
        console.log('Test button clicked');
        console.log('Password value:', passwordInput.value);
        console.log('Password value length:', passwordInput.value.length);
        
        // Clear error
        passwordError.textContent = '';
        
        // Check if password is empty
        if (!passwordInput.value) {
            console.log('Password is empty');
            passwordError.textContent = 'Password is required (from test)';
        } else {
            console.log('Password is NOT empty');
            alert('Password value: "' + passwordInput.value + '"');
        }
    });
    
    // Log when password changes
    passwordInput.addEventListener('input', function() {
        console.log('Password changed:', passwordInput.value);
    });
    
    // Log form submission
    loginForm.addEventListener('submit', function(e) {
        console.log('Form submitted');
        console.log('Email:', emailInput.value);
        console.log('Password:', passwordInput.value);
        
        // Don't prevent default to see if the original handler works
    });
});
