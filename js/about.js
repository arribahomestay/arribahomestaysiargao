// About page specific JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Force remove any carousel elements that might be created dynamically
    const carouselElements = document.querySelectorAll('.image-carousel, .carousel-container, .carousel-track, .carousel-slide, .mirror-preview, .carousel-btn, .carousel-indicators, .prev-btn, .next-btn, .indicator');
    carouselElements.forEach(element => {
        element.remove();
    });
    
    // Ensure only single image container exists
    const storyImage = document.querySelector('.story-image');
    if (storyImage) {
        // Remove any carousel elements from story-image
        const carouselInStory = storyImage.querySelectorAll('.image-carousel, .carousel-container, .carousel-track, .carousel-slide, .mirror-preview, .carousel-btn, .carousel-indicators, .prev-btn, .next-btn, .indicator');
        carouselInStory.forEach(element => {
            element.remove();
        });
        
        // Ensure single-image-container exists and has only one image
        let singleContainer = storyImage.querySelector('.single-image-container');
        if (!singleContainer) {
            singleContainer = document.createElement('div');
            singleContainer.className = 'single-image-container';
            storyImage.appendChild(singleContainer);
        }
        
        // Clear any existing content and add only the single image
        singleContainer.innerHTML = '<img src="images/gallery/9.jpg" alt="Arriba Homestay - Charming Two-Story Villa" class="story-img">';
    }
    
    // Add staggered animation to story content
    const storyContent = document.querySelector('.story-content');
    if (storyContent) {
        storyContent.style.opacity = '0';
        storyContent.style.transform = 'translateY(30px)';
        storyContent.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        
        setTimeout(() => {
            storyContent.style.opacity = '1';
            storyContent.style.transform = 'translateY(0)';
        }, 300);
    }
    
    // Book Your Stay button functionality
    const bookButton = document.querySelector('.contact-cta .cta-button');
    if (bookButton) {
        bookButton.addEventListener('click', function() {
            window.location.href = 'booking.html';
        });
    }
    
    // Add scroll-triggered animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Add typing effect to hero title
    const heroTitle = document.querySelector('.about-hero h1');
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
        
        setTimeout(typeWriter, 500);
    }
    
    // Add parallax effect to hero section
    const hero = document.querySelector('.about-hero');
    if (hero) {
        window.addEventListener('scroll', function() {
            const scrolled = window.pageYOffset;
            const parallax = scrolled * 0.3;
            hero.style.transform = `translateY(${parallax}px)`;
        });
    }
    
    // Add smooth scrolling for anchor links
    const anchors = document.querySelectorAll('a[href^="#"]');
    anchors.forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});