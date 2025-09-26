// Gestor de Imágenes para BusReserva Professional
class ImageManager {
    constructor() {
        this.cache = new Map();
        this.loadingImages = new Set();
    }

    // Cargar imágenes por categoría
    async loadCategoryImages(category, count = 6) {
        const cacheKey = `${category}_${count}`;
        
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        try {
            const response = await fetch(`/api/images/category/${category}?count=${count}`);
            const images = await response.json();
            
            this.cache.set(cacheKey, images);
            return images;
        } catch (error) {
            console.error('Error loading images:', error);
            return this.getFallbackImages(category, count);
        }
    }

    // Cargar imagen aleatoria por tema
    async loadRandomImage(theme) {
        try {
            const response = await fetch(`/api/images/random/${theme}`);
            const image = await response.json();
            return image;
        } catch (error) {
            console.error('Error loading random image:', error);
            return { url: this.getFallbackImages(theme, 1)[0].url, alt: `Imagen de ${theme}` };
        }
    }

    // Aplicar imágenes al hero
    async applyHeroImages() {
        const heroImages = await this.loadCategoryImages('hero', 2);
        const heroSection = document.querySelector('.hero, .hero-ultra');
        
        if (heroSection && heroImages.length > 0) {
            const randomImage = heroImages[Math.floor(Math.random() * heroImages.length)];
            heroSection.style.backgroundImage = `linear-gradient(rgba(30, 60, 114, 0.7), rgba(42, 82, 152, 0.7)), url('${randomImage.url}')`;
            heroSection.style.backgroundSize = 'cover';
            heroSection.style.backgroundPosition = 'center';
        }
    }

    // Aplicar imágenes a servicios
    async applyServiceImages() {
        const serviceImages = await this.loadCategoryImages('services', 6);
        const serviceCards = document.querySelectorAll('.service-card, .feature-card');
        
        serviceCards.forEach((card, index) => {
            if (serviceImages[index]) {
                const img = document.createElement('img');
                img.src = serviceImages[index].url;
                img.alt = serviceImages[index].alt;
                img.style.cssText = `
                    width: 100%;
                    height: 200px;
                    object-fit: cover;
                    border-radius: 12px;
                    margin-bottom: 1rem;
                `;
                
                const existingImg = card.querySelector('img');
                if (existingImg) {
                    existingImg.replaceWith(img);
                } else {
                    card.insertBefore(img, card.firstChild);
                }
            }
        });
    }

    // Aplicar imágenes a testimonios
    async applyTestimonialImages() {
        const testimonialImages = await this.loadCategoryImages('testimonials', 6);
        const testimonials = document.querySelectorAll('.testimonial, .review-card');
        
        testimonials.forEach((testimonial, index) => {
            if (testimonialImages[index]) {
                let avatar = testimonial.querySelector('.avatar, .testimonial-avatar');
                if (!avatar) {
                    avatar = document.createElement('img');
                    avatar.className = 'testimonial-avatar';
                    testimonial.insertBefore(avatar, testimonial.firstChild);
                }
                
                avatar.src = testimonialImages[index].url;
                avatar.alt = testimonialImages[index].alt;
                avatar.style.cssText = `
                    width: 60px;
                    height: 60px;
                    border-radius: 50%;
                    object-fit: cover;
                    margin-right: 1rem;
                `;
            }
        });
    }

    // Aplicar imágenes a tarjetas de viaje
    async applyTripImages() {
        const busImages = await this.loadCategoryImages('buses', 10);
        const tripCards = document.querySelectorAll('.trip-card, .smart-trip-card, .route-card');
        
        tripCards.forEach((card, index) => {
            if (busImages[index % busImages.length]) {
                const img = document.createElement('img');
                img.src = busImages[index % busImages.length].url;
                img.alt = busImages[index % busImages.length].alt;
                img.style.cssText = `
                    width: 100%;
                    height: 150px;
                    object-fit: cover;
                    border-radius: 12px;
                    margin-bottom: 1rem;
                `;
                
                const existingImg = card.querySelector('img');
                if (existingImg) {
                    existingImg.replaceWith(img);
                } else {
                    card.insertBefore(img, card.firstChild);
                }
            }
        });
    }

    // Aplicar imagen de fondo a secciones
    async applyBackgroundImages() {
        const cityImages = await this.loadCategoryImages('cities', 3);
        const sections = document.querySelectorAll('.search-section, .features-section, .services-section');
        
        sections.forEach((section, index) => {
            if (cityImages[index]) {
                section.style.backgroundImage = `linear-gradient(rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.9)), url('${cityImages[index].url}')`;
                section.style.backgroundSize = 'cover';
                section.style.backgroundPosition = 'center';
                section.style.backgroundAttachment = 'fixed';
            }
        });
    }

    // Crear galería de imágenes
    async createImageGallery(containerId, category, count = 6) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const images = await this.loadCategoryImages(category, count);
        
        container.innerHTML = `
            <div class="image-gallery" style="
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 1rem;
                margin: 2rem 0;
            ">
                ${images.map(img => `
                    <div class="gallery-item" style="
                        border-radius: 12px;
                        overflow: hidden;
                        box-shadow: 0 8px 25px rgba(30, 60, 114, 0.1);
                        transition: transform 0.3s ease;
                    ">
                        <img src="${img.url}" alt="${img.alt}" style="
                            width: 100%;
                            height: 200px;
                            object-fit: cover;
                            transition: transform 0.3s ease;
                        ">
                        <div style="padding: 1rem; background: rgba(255, 255, 255, 0.95);">
                            <p style="margin: 0; color: #1e3c72; font-weight: 500;">${img.alt}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        // Agregar efectos hover
        container.querySelectorAll('.gallery-item').forEach(item => {
            item.addEventListener('mouseenter', () => {
                item.style.transform = 'translateY(-5px)';
                item.querySelector('img').style.transform = 'scale(1.05)';
            });
            
            item.addEventListener('mouseleave', () => {
                item.style.transform = 'translateY(0)';
                item.querySelector('img').style.transform = 'scale(1)';
            });
        });
    }

    // Imágenes de respaldo
    getFallbackImages(category, count) {
        const fallbacks = {
            hero: [
                { url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1200&q=80', alt: 'Autobús profesional' }
            ],
            buses: [
                { url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&q=80', alt: 'Autobús moderno' },
                { url: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&q=80', alt: 'Interior de autobús' }
            ],
            services: [
                { url: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&q=80', alt: 'Servicio de calidad' }
            ],
            testimonials: [
                { url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80', alt: 'Cliente satisfecho' }
            ]
        };
        
        const images = fallbacks[category] || fallbacks.services;
        return images.slice(0, count);
    }

    // Inicializar todas las imágenes
    async initializeAllImages() {
        try {
            await Promise.all([
                this.applyHeroImages(),
                this.applyServiceImages(),
                this.applyTestimonialImages(),
                this.applyTripImages(),
                this.applyBackgroundImages()
            ]);
            
            console.log('✅ Todas las imágenes cargadas exitosamente');
        } catch (error) {
            console.error('❌ Error al cargar imágenes:', error);
        }
    }

    // Lazy loading para imágenes
    setupLazyLoading() {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    observer.unobserve(img);
                }
            });
        });

        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }
}

// Instancia global del gestor de imágenes
const imageManager = new ImageManager();

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    // Esperar un poco para que otros scripts se carguen
    setTimeout(() => {
        imageManager.initializeAllImages();
        imageManager.setupLazyLoading();
    }, 1000);
});

// Exportar para uso global
window.ImageManager = ImageManager;
window.imageManager = imageManager;