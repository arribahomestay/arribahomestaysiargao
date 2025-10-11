// Gallery page specific JavaScript

document.addEventListener('DOMContentLoaded', function() {
    console.log('Gallery.js loaded');
    
    // Debug account button
    const accountBtn = document.getElementById('accountBtn');
    const modal = document.getElementById('loginModal');
    console.log('Gallery - Account button:', accountBtn);
    console.log('Gallery - Modal:', modal);
    // Gallery filtering functionality
    const filterButtons = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            
            const filter = this.getAttribute('data-filter');
            
            galleryItems.forEach(item => {
                if (filter === 'all' || item.getAttribute('data-category') === filter) {
                    item.style.display = 'block';
                    item.style.animation = 'fadeInUp 0.5s ease';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });
    
    // Lightbox functionality
    const lightbox = document.getElementById('lightbox');
    const lightboxImage = document.getElementById('lightbox-image');
    const lightboxTitle = document.getElementById('lightbox-title');
    const lightboxDescription = document.getElementById('lightbox-description');
    const lightboxClose = document.querySelector('.lightbox-close');
    
    if (lightbox && lightboxImage && lightboxTitle && lightboxDescription && lightboxClose) {
        galleryItems.forEach(item => {
            item.addEventListener('click', function() {
                const overlay = this.querySelector('.gallery-overlay');
                const img = this.querySelector('.gallery-img');
                if (overlay && img) {
                    const title = overlay.querySelector('h3').textContent;
                    const description = overlay.querySelector('p').textContent;
                    
                    // Set lightbox content
                    lightboxTitle.textContent = title;
                    lightboxDescription.textContent = description;
                    
                    // Use the actual image source from the gallery item
                    lightboxImage.src = img.src;
                    lightboxImage.alt = img.alt;
                    
                    // Show lightbox
                    lightbox.style.display = 'block';
                    document.body.style.overflow = 'hidden';
                }
            });
        });
        
        // Close lightbox
        lightboxClose.addEventListener('click', function() {
            lightbox.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
        
        // Close lightbox when clicking outside the image
        lightbox.addEventListener('click', function(e) {
            if (e.target === lightbox) {
                lightbox.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
        
        // Close lightbox with Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && lightbox.style.display === 'block') {
                lightbox.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
    }
    
    // Add staggered animation to gallery items
    galleryItems.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(30px)';
        item.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        
        setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
        }, index * 100);
    });
    
    // Remove hover zoom effects for better image display
    
    // Add animation for filter changes
    function animateGalleryItems() {
        galleryItems.forEach((item, index) => {
            if (item.style.display !== 'none') {
                item.style.animation = 'none';
                setTimeout(() => {
                    item.style.animation = 'fadeInUp 0.5s ease';
                }, index * 50);
            }
        });
    }
    
    // Override the filter button click to include animation
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            setTimeout(animateGalleryItems, 100);
        });
    });
});

// CSS animation for fadeInUp
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);