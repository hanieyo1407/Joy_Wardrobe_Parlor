//HANIEYO1407
document.addEventListener('DOMContentLoaded', () => {

   
    const preloader = document.getElementById('preloader');
    const backToTopBtn = document.getElementById('back-to-top');
    const navLinks = document.querySelectorAll('.main-nav a');
    const sections = document.querySelectorAll('main section, .marquee');
    const productContainer = document.getElementById('product-container');
    const modalOverlay = document.getElementById('product-modal-overlay');
    const modalBody = document.getElementById('modal-body-content');
    const closeModalBtn = document.getElementById('modal-close-btn');
    const customCursor = document.querySelector('.custom-cursor');
    const magneticBtn = document.querySelector('.magnetic-btn');

    
    document.body.classList.add('loading');
    window.addEventListener('load', () => {
        setTimeout(() => {
            if (preloader) {
                preloader.classList.add('hidden');
                document.body.classList.remove('loading');
            }
        }, 300); 
    });

    
    const handleScroll = () => {
        const scrollY = window.scrollY;

        
        if (backToTopBtn) {
            if (scrollY > 300) {
                backToTopBtn.classList.add('active');
            } else {
                backToTopBtn.classList.remove('active');
            }
        }

        
        let currentSectionId = '';
        sections.forEach(section => {
            if (section.id) { 
                const sectionTop = section.offsetTop - 150; 
                if (scrollY >= sectionTop) {
                    currentSectionId = section.getAttribute('id');
                }
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            const linkHref = link.getAttribute('href');
            if (linkHref && linkHref.substring(1) === currentSectionId) {
                link.classList.add('active');
            }
        });
    };

    window.addEventListener('scroll', handleScroll);

    
    if (window.matchMedia("(pointer: fine)").matches) {
        window.addEventListener('mousemove', e => {
            customCursor.style.top = `${e.clientY}px`;
            customCursor.style.left = `${e.clientX}px`;
        });

        const interactiveElements = document.querySelectorAll('a, button, .product-card, .modal-thumbnail');
        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', () => customCursor.classList.add('grow'));
            el.addEventListener('mouseleave', () => customCursor.classList.remove('grow'));
        });

        if (magneticBtn) {
            magneticBtn.addEventListener('mousemove', function(e) {
                const rect = this.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                this.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
            });
            magneticBtn.addEventListener('mouseleave', function() {
                this.style.transform = 'translate(0, 0)';
            });
        }
    }

    
    if (productContainer) {
        let isDown = false;
        let startX;
        let scrollLeft;

        productContainer.addEventListener('mousedown', (e) => {
            isDown = true;
            productContainer.style.cursor = 'grabbing';
            startX = e.pageX - productContainer.offsetLeft;
            scrollLeft = productContainer.scrollLeft;
        });
        productContainer.addEventListener('mouseleave', () => {
            isDown = false;
            productContainer.style.cursor = 'grab';
        });
        productContainer.addEventListener('mouseup', () => {
            isDown = false;
            productContainer.style.cursor = 'grab';
        });
        productContainer.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - productContainer.offsetLeft;
            const walk = (x - startX) * 2; 
            productContainer.scrollLeft = scrollLeft - walk;
        });
    }

   
    async function displayProducts() {
        try {
            const response = await fetch('products.json');
            if (!response.ok) throw new Error('Network response was not ok');
            const products = await response.json();
            
            productContainer.innerHTML = '';
            products.forEach(product => {
                const productCard = document.createElement('div');
                productCard.className = 'product-card animate-on-scroll';
                productCard.innerHTML = `
                    <div class="product-card-image-wrapper">
                        <img src="${product.image1}" alt="${product.name}">
                    </div>
                    <div class="product-info">
                        <h3>${product.name}</h3>
                        <p class="product-price">${product.price}</p>
                    </div>
                `;
                productCard.addEventListener('click', () => openModal(product));
                productContainer.appendChild(productCard);
            });
            setupScrollObserver();

        } catch (error) {
            console.error('Fetch error:', error);
            productContainer.innerHTML = '<p class="error-message">Failed to load products. Please try again later.</p>';
        }
    }

   
    function openModal(product) {
        modalBody.innerHTML = `
            <div class="modal-images">
                <img src="${product.image1}" alt="${product.name}" class="modal-main-image" id="modal-main-img">
                <div class="modal-thumbnail-group">
                    <img src="${product.image1}" alt="Front view" class="modal-thumbnail active" data-src="${product.image1}">
                    <img src="${product.image2}" alt="Back view" class="modal-thumbnail" data-src="${product.image2}">
                </div>
            </div>
            <div class="modal-details">
                <h2>${product.name}</h2>
                <p class="product-price">${product.price}</p>
                <p>${product.details}</p>
                <a href="https://chat.whatsapp.com/CNEucXwrEdM4RROozJLSfl" target="_blank" class="btn btn-primary">Inquire on WhatsApp</a>
            </div>
        `;
        modalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';

        const thumbnails = modalBody.querySelectorAll('.modal-thumbnail');
        thumbnails.forEach(thumb => {
            thumb.addEventListener('click', (e) => switchModalImage(e, thumbnails));
        });
    }
    
    function closeModal() {
        modalOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    function switchModalImage(e, thumbnails) {
        const mainImage = document.getElementById('modal-main-img');
        mainImage.src = e.target.dataset.src;
        thumbnails.forEach(thumb => thumb.classList.remove('active'));
        e.target.classList.add('active');
    }
    
    function setupScrollObserver() {
        const animatedElements = document.querySelectorAll('.animate-on-scroll');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        animatedElements.forEach(el => observer.observe(el));
    }

   
    closeModalBtn.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) closeModal();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
            closeModal();
        }
    });

    
    displayProducts();
    setupScrollObserver();
    handleScroll(); 
});

//HANIEYO1407