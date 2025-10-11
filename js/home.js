// Home page specific JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Book Now button functionality
    const bookButton = document.querySelector('.cta-button');
    if (bookButton) {
        bookButton.addEventListener('click', function() {
            window.location.href = 'booking.html';
        });
    }
    
    // Add parallax effect to hero section (desktop only)
    const hero = document.querySelector('.hero');
    if (hero && window.innerWidth > 768) {
        let ticking = false;
        
        function updateParallax() {
            const scrolled = window.pageYOffset;
            const parallax = scrolled * 0.3; // Reduced intensity for smoother effect
            hero.style.transform = `translateY(${parallax}px)`;
            ticking = false;
        }
        
        function requestTick() {
            if (!ticking) {
                requestAnimationFrame(updateParallax);
                ticking = true;
            }
        }
        
        window.addEventListener('scroll', requestTick, { passive: true });
        
        // Remove parallax on mobile
        window.addEventListener('resize', function() {
            if (window.innerWidth <= 768) {
                hero.style.transform = 'none';
            }
        });
    }
    
    // Add hover effects to feature cards (desktop only)
    const featureCards = document.querySelectorAll('.feature-card');
    if (window.innerWidth > 768) {
        featureCards.forEach(card => {
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-10px) scale(1.02)';
            });
            
            card.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0) scale(1)';
            });
        });
    }
    
    // Add typing effect to hero title
    const heroTitle = document.querySelector('.hero-content h1');
    if (heroTitle) {
        const text = heroTitle.textContent;
        heroTitle.textContent = '';
        
        let i = 0;
        const typeWriter = function() {
            if (i < text.length) {
                heroTitle.textContent += text.charAt(i);
                i++;
                setTimeout(typeWriter, 100);
            }
        };
        
        // Start typing effect after a short delay
        setTimeout(typeWriter, 500);
    }
    
    // Add smooth scrolling behavior
    document.documentElement.style.scrollBehavior = 'smooth';
    
    // Optimize scroll performance on mobile
    if (window.innerWidth <= 768) {
        // Disable parallax and complex animations on mobile
        hero.style.transform = 'none';
        hero.style.willChange = 'auto';
        
        // Add touch-friendly interactions
        featureCards.forEach(card => {
            card.addEventListener('touchstart', function() {
                this.style.transform = 'scale(0.98)';
            });
            
            card.addEventListener('touchend', function() {
                this.style.transform = 'scale(1)';
            });
        });
    }
});