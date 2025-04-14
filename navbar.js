// Navbar script to handle user profile and authentication
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const userDataString = localStorage.getItem('user');
    
    // Get navbar elements
    const userMenu = document.querySelector('.user-menu');
    const userEmail = document.getElementById('user-email');
    const welcomeName = document.getElementById('welcome-name');
    const logoutBtn = document.getElementById('logout-btn');
    
    if (token && userDataString) {
        try {
            // Parse user data
            const userData = JSON.parse(userDataString);
            
            // Update user email in navbar
            if (userEmail) {
                userEmail.textContent = userData.email || 'User';
            }
            
            // Update welcome message if it exists
            if (welcomeName) {
                welcomeName.textContent = userData.name || 'User';
            }
            
            // Show user menu
            if (userMenu) {
                userMenu.style.display = 'flex';
            }
            
            // Handle logout
            if (logoutBtn) {
                logoutBtn.addEventListener('click', () => {
                    // Clear local storage
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    
                    // Redirect to login page
                    window.location.href = 'login.html';
                });
            }
        } catch (error) {
            console.error('Error parsing user data:', error);
        }
    } else {
        // User is not logged in
        if (userMenu) {
            // Check if we're on a page that requires authentication
            const requiresAuth = [
                'employer-dashboard.html',
                'student-dashboard.html',
                'post-job.html',
                'my-jobs.html'
            ];
            
            const currentPage = window.location.pathname.split('/').pop();
            
            if (requiresAuth.includes(currentPage)) {
                // Redirect to login page
                window.location.href = 'login.html';
            } else {
                // Show login/register links instead of user menu
                userMenu.innerHTML = `
                    <div class="auth-links">
                        <a href="login.html" class="btn btn-outline">Login</a>
                        <a href="register.html" class="btn btn-primary">Register</a>
                    </div>
                `;
            }
        }
    }
});
