// Check if user is authenticated
async function checkAuth() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            return false;
        }

        const response = await fetch('/api/auth/check', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            localStorage.removeItem('token');
            return false;
        }

        return true;
    } catch (error) {
        console.error('Auth check failed:', error);
        return false;
    }
}

// Protect routes that require authentication
async function protectRoute() {
    const isAuthenticated = await checkAuth();
    const currentPath = window.location.pathname;
    
    // List of pages that don't require authentication
    const publicPages = ['/login.html', '/register.html', '/index.html'];
    
    if (!isAuthenticated && !publicPages.includes(currentPath)) {
        window.location.href = '/login.html';
        return false;
    }
    
    return true;
}

// Add event listener to check auth on page load
document.addEventListener('DOMContentLoaded', protectRoute);

// Export functions for use in other files
window.auth = {
    checkAuth,
    protectRoute
}; 