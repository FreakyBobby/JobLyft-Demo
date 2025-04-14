document.addEventListener('DOMContentLoaded', function() {
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80, // Adjust for fixed header
                    behavior: 'smooth'
                });
            }
        });
    });

    // Search functionality
    const searchBox = document.querySelector('.search-box input');
    const searchButton = document.querySelector('.search-box .btn');
    
    if (searchBox && searchButton) {
        searchButton.addEventListener('click', function() {
            const searchQuery = searchBox.value.trim();
            if (searchQuery) {
                window.location.href = `job-search.html?q=${encodeURIComponent(searchQuery)}`;
            }
        });
        
        searchBox.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                const searchQuery = searchBox.value.trim();
                if (searchQuery) {
                    window.location.href = `job-search.html?q=${encodeURIComponent(searchQuery)}`;
                }
            }
        });
    }

    // Add hover animations for feature cards
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });

    // Add hover animations for testimonial cards
    const testimonialCards = document.querySelectorAll('.testimonial');
    testimonialCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.02)';
            this.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.1)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
            this.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
        });
    });
}); 