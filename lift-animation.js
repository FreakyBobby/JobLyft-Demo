document.addEventListener('DOMContentLoaded', () => {
    // Function to check if an element is in viewport
    function isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    // Function to handle scroll animation
    function handleScrollAnimation() {
        const animatedElements = document.querySelectorAll('.lift-animation');
        
        animatedElements.forEach(element => {
            if (isInViewport(element)) {
                element.classList.add('visible');
            }
        });
    }

    // Add lift-animation class to elements
    function initializeLiftAnimations() {
        // Hero section
        const heroTitle = document.querySelector('.hero-content h1');
        const heroText = document.querySelector('.hero-content p');
        const heroButton = document.querySelector('.hero-content .btn');
        
        if (heroTitle) heroTitle.classList.add('lift-animation');
        if (heroText) heroText.classList.add('lift-animation');
        if (heroButton) heroButton.classList.add('lift-animation');

        // Features section
        const featureCards = document.querySelectorAll('.feature-card');
        featureCards.forEach(card => card.classList.add('lift-animation'));

        // Testimonials section
        const testimonialCards = document.querySelectorAll('.testimonial-card');
        testimonialCards.forEach(card => card.classList.add('lift-animation'));

        // CTA section
        const ctaTitle = document.querySelector('.cta-content h2');
        const ctaText = document.querySelector('.cta-content p');
        const ctaButton = document.querySelector('.cta-content .btn');
        
        if (ctaTitle) ctaTitle.classList.add('lift-animation');
        if (ctaText) ctaText.classList.add('lift-animation');
        if (ctaButton) ctaButton.classList.add('lift-animation');

        // Footer sections
        const footerSections = document.querySelectorAll('.footer-section');
        footerSections.forEach(section => section.classList.add('lift-animation'));
    }

    // Initialize animations
    initializeLiftAnimations();

    // Handle initial animation on page load
    handleScrollAnimation();

    // Add scroll event listener
    window.addEventListener('scroll', handleScrollAnimation);

    // Add resize event listener to handle responsive changes
    window.addEventListener('resize', handleScrollAnimation);
}); 