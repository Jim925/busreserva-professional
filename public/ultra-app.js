// BusReserva Ultra - JavaScript de Nueva Generación
// ================================================

class BusReservaUltra {
    constructor() {
        this.currentUser = null;
        this.searchResults = [];
        this.websocket = null;
        this.geolocation = null;
        this.notifications = [];
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initWebSocket();
        this.loadUserSession();
        this.setupGeolocation();
        this.initNotifications();
        this.setupAnimations();
    }

    // === CONFIGURACIÓN INICIAL ===
    setupEventListeners() {
        // Navegación
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.navigateToSection(link.getAttribute('href'));
            });
        });

        // Búsqueda
        const searchForm = document.getElementById('searchForm');
        if (searchForm) {
            searchForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.performIntelligentSearch();
            });
        }

        // Tabs de búsqueda
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.switchSearchTab(btn.dataset.tab);
            });
        });

        // Controles de pasajeros
        document.getElementById('increasePassengers')?.addEventListener('click', () => {
            this.updatePassengerCount(1);
        });
        
        document.getElementById('decreasePassengers')?.addEventListener('click', () => {
            this.updatePassengerCount(-1);
        });

        // Intercambiar origen/destino
        document.getElementById('swapBtn')?.addEventListener('click', () => {
            this.swapLocations();
        });

        // Geolocalización
        document.getElementById('useLocationBtn')?.addEventListener('click', () => {
            this.useCurrentLocation();
        });

        // Notificaciones
        document.getElementById('notificationBtn')?.addEventListener('click', () => {
            this.toggleNotificationPanel();
        });

        document.getElementById('closeNotifications')?.addEventListener('click', () => {
            this.closeNotificationPanel();
        });

        // Autenticación
        document.getElementById('profileBtn')?.addEventListener('click', () => {
            this.showAuthModal();
        });

        document.getElementById('closeAuthModal')?.addEventListener('click', () => {
            this.closeAuthModal();
        });

        document.getElementById('authSwitchLink')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.switchAuthMode();
        });

        const authForm = document.getElementById('authForm');
        if (authForm) {
            authForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleAuth();
            });
        }

        // Autocompletado
        this.setupAutocomplete();

        // Fecha mínima
        this.setMinDate();
    }

    initWebSocket() {
        try {
            this.websocket = new WebSocket(`ws://localhost:3000`);
            
            this.websocket.onopen = () => {
                console.log('🔌 WebSocket conectado');
                this.showNotification('Conectado al sistema en tiempo real', 'success');
            };

            this.websocket.onmessage = (event) => {
                const data = JSON.parse(event.data);
                this.handleWebSocketMessage(data);
            };

            this.websocket.onclose = () => {
                console.log('🔌 WebSocket desconectado');
                // Reconectar después de 3 segundos
                setTimeout(() => this.initWebSocket(), 3000);
            };

            this.websocket.onerror = (error) => {
                console.error('❌ Error WebSocket:', error);
            };
        } catch (error) {
            console.error('❌ Error inicializando WebSocket:', error);
        }
    }

    setupGeolocation() {
        if ('geolocation' in navigator) {
            this.geolocation = navigator.geolocation;
        }
    }

    initNotifications() {
        if ('Notification' in window && 'serviceWorker' in navigator) {
            Notification.requestPermission();
        }
    }

    setupAnimations() {
        // Intersection Observer para animaciones
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-slide-up');
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.feature-card').forEach(card => {
            observer.observe(card);
        });
    }

    // === NAVEGACIÓN ===
    navigateToSection(sectionId) {
        const section = document.querySelector(sectionId);
        if (section) {
            section.scrollIntoView({ behavior: 'smooth' });
            
            // Actualizar navegación activa
            document.querySelectorAll('.nav-link').forEach(link => {
                link.classList.remove('active');
            });
            document.querySelector(`[href="${sectionId}"]`).classList.add('active');
        }
    }

    // === BÚSQUEDA INTELIGENTE ===
    async performIntelligentSearch() {
        const formData = this.getSearchFormData();
        
        if (!this.validateSearchForm(formData)) {
            return;
        }

        this.showLoadingState();

        try {
            const response = await fetch('/api/search/intelligent?' + new URLSearchParams(formData));
            const results = await response.json();

            if (response.ok) {
                this.searchResults = results;
                this.displaySearchResults(results);
                this.showResultsSection();
                
                // Enviar evento de búsqueda via WebSocket
                if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
                    this.websocket.send(JSON.stringify({
                        type: 'search_performed',
                        data: formData
                    }));
                }
            } else {
                this.showNotification(results.error || 'Error en la búsqueda', 'error');
            }
        } catch (error) {
            console.error('❌ Error en búsqueda:', error);
            this.showNotification('Error de conexión', 'error');
        } finally {
            this.hideLoadingState();
        }
    }

    getSearchFormData() {
        return {
            origin: document.getElementById('origin').value,
            destination: document.getElementById('destination').value,
            date: document.getElementById('departureDate').value,
            passengers: document.getElementById('passengerCount').textContent,
            flexible: document.getElementById('flexibleDates').checked,
            onlyDirect: document.getElementById('onlyDirect').checked,
            priceAlerts: document.getElementById('priceAlerts').checked
        };
    }

    validateSearchForm(data) {
        if (!data.origin) {
            this.showNotification('Selecciona el origen', 'warning');
            return false;
        }
        if (!data.destination) {
            this.showNotification('Selecciona el destino', 'warning');
            return false;
        }
        if (!data.date) {
            this.showNotification('Selecciona la fecha', 'warning');
            return false;
        }
        if (data.origin === data.destination) {
            this.showNotification('El origen y destino deben ser diferentes', 'warning');
            return false;
        }
        return true;
    }

    displaySearchResults(results) {
        const resultsGrid = document.getElementById('resultsGrid');
        if (!resultsGrid) return;

        resultsGrid.innerHTML = '';

        if (results.length === 0) {
            resultsGrid.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-search"></i>
                    <h3>No se encontraron viajes</h3>
                    <p>Intenta con fechas diferentes o activa las fechas flexibles</p>
                </div>
            `;
            return;
        }

        results.forEach(schedule => {
            const resultCard = this.createResultCard(schedule);
            resultsGrid.appendChild(resultCard);
        });
    }

    createResultCard(schedule) {
        const card = document.createElement('div');
        card.className = 'result-card';
        
        const availabilityClass = schedule.availability_level === 'low' ? 'low' : 
                                 schedule.availability_level === 'medium' ? 'medium' : 'high';
        
        const priceRecommendation = schedule.price_prediction?.trend === 'increasing' ? 
                                   'Precio en aumento' : 'Precio estable';

        card.innerHTML = `
            <div class="result-header">
                <div class="route-info">
                    <h3>${schedule.origin} → ${schedule.destination}</h3>
                    <div class="schedule-info">
                        <span><i class="fas fa-clock"></i> ${schedule.departure_time}</span>
                        <span><i class="fas fa-calendar"></i> ${this.formatDate(schedule.departure_date)}</span>
                    </div>
                </div>
                <div class="price-info">
                    <div class="current-price">$${schedule.price}</div>
                    ${schedule.price_prediction ? `
                        <div class="price-prediction">
                            Predicción: $${schedule.price_prediction.predicted}
                        </div>
                    ` : ''}
                </div>
            </div>
            
            <div class="result-body">
                <div class="bus-info">
                    <span class="bus-type ${schedule.bus_type}">${this.getBusTypeLabel(schedule.bus_type)}</span>
                    <span class="bus-number">Bus ${schedule.bus_number}</span>
                </div>
                
                <div class="amenities">
                    ${this.renderAmenities(schedule.amenities)}
                </div>
                
                <div class="availability">
                    <span class="availability-indicator ${availabilityClass}"></span>
                    <span>${schedule.available_seats} asientos disponibles</span>
                </div>
                
                ${schedule.avg_rating ? `
                    <div class="rating">
                        <div class="stars">${this.renderStars(schedule.avg_rating)}</div>
                        <span>(${schedule.avg_rating.toFixed(1)})</span>
                    </div>
                ` : ''}
            </div>
            
            <div class="result-footer">
                <div class="recommendation">
                    <i class="fas fa-lightbulb"></i>
                    <span>${priceRecommendation}</span>
                </div>
                <button class="book-btn" onclick="busReserva.bookSchedule(${schedule.id})">
                    <i class="fas fa-ticket-alt"></i>
                    Reservar Ahora
                </button>
            </div>
        `;

        return card;
    }

    // === CONTROLES DE INTERFAZ ===
    switchSearchTab(tabType) {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabType}"]`).classList.add('active');

        const returnDateGroup = document.getElementById('returnDateGroup');
        if (tabType === 'round-trip') {
            returnDateGroup.style.display = 'block';
        } else {
            returnDateGroup.style.display = 'none';
        }
    }

    updatePassengerCount(change) {
        const countElement = document.getElementById('passengerCount');
        let count = parseInt(countElement.textContent);
        count = Math.max(1, Math.min(10, count + change));
        countElement.textContent = count;
    }

    swapLocations() {
        const origin = document.getElementById('origin');
        const destination = document.getElementById('destination');
        
        const temp = origin.value;
        origin.value = destination.value;
        destination.value = temp;
        
        // Animación
        document.getElementById('swapBtn').style.transform = 'rotate(180deg)';
        setTimeout(() => {
            document.getElementById('swapBtn').style.transform = 'rotate(0deg)';
        }, 300);
    }

    async useCurrentLocation() {
        if (!this.geolocation) {
            this.showNotification('Geolocalización no disponible', 'warning');
            return;
        }

        const btn = document.getElementById('useLocationBtn');
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

        try {
            const position = await this.getCurrentPosition();
            const location = await this.reverseGeocode(position.coords.latitude, position.coords.longitude);
            
            document.getElementById('origin').value = location;
            this.showNotification('Ubicación detectada', 'success');
        } catch (error) {
            console.error('❌ Error obteniendo ubicación:', error);
            this.showNotification('No se pudo obtener la ubicación', 'error');
        } finally {
            btn.innerHTML = '<i class="fas fa-crosshairs"></i>';
        }
    }

    getCurrentPosition() {
        return new Promise((resolve, reject) => {
            this.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000
            });
        });
    }

    async reverseGeocode(lat, lng) {
        // Simulación de geocodificación inversa
        const cities = ['Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Bilbao'];
        return cities[Math.floor(Math.random() * cities.length)];
    }

    // === AUTOCOMPLETADO ===
    setupAutocomplete() {
        const originInput = document.getElementById('origin');
        const destinationInput = document.getElementById('destination');

        if (originInput) {
            this.setupInputAutocomplete(originInput, 'originSuggestions');
        }
        if (destinationInput) {
            this.setupInputAutocomplete(destinationInput, 'destinationSuggestions');
        }
    }

    setupInputAutocomplete(input, suggestionsId) {
        let timeout;
        
        input.addEventListener('input', (e) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                this.showSuggestions(e.target.value, suggestionsId);
            }, 300);
        });

        input.addEventListener('blur', () => {
            setTimeout(() => {
                document.getElementById(suggestionsId).innerHTML = '';
            }, 200);
        });
    }

    async showSuggestions(query, suggestionsId) {
        if (query.length < 2) {
            document.getElementById(suggestionsId).innerHTML = '';
            return;
        }

        try {
            const response = await fetch(`/api/cities?q=${encodeURIComponent(query)}`);
            const cities = await response.json();
            
            const suggestionsElement = document.getElementById(suggestionsId);
            suggestionsElement.innerHTML = '';

            cities.slice(0, 5).forEach(city => {
                const suggestion = document.createElement('div');
                suggestion.className = 'suggestion-item';
                suggestion.textContent = city;
                suggestion.addEventListener('click', () => {
                    document.getElementById(suggestionsId.replace('Suggestions', '')).value = city;
                    suggestionsElement.innerHTML = '';
                });
                suggestionsElement.appendChild(suggestion);
            });
        } catch (error) {
            console.error('❌ Error obteniendo sugerencias:', error);
        }
    }

    // === NOTIFICACIONES ===
    toggleNotificationPanel() {
        const panel = document.getElementById('notificationPanel');
        panel.classList.toggle('active');
    }

    closeNotificationPanel() {
        document.getElementById('notificationPanel').classList.remove('active');
    }

    showNotification(message, type = 'info') {
        // Crear notificación toast
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <i class="fas fa-${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
            <button class="toast-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;

        // Agregar al DOM
        let toastContainer = document.querySelector('.toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.className = 'toast-container';
            document.body.appendChild(toastContainer);
        }

        toastContainer.appendChild(toast);

        // Auto-remover después de 5 segundos
        setTimeout(() => {
            toast.remove();
        }, 5000);

        // Notificación del navegador
        if (Notification.permission === 'granted' && type === 'success') {
            new Notification('BusReserva Ultra', {
                body: message,
                icon: '/favicon.ico'
            });
        }
    }

    getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    // === AUTENTICACIÓN ===
    showAuthModal() {
        document.getElementById('authModal').classList.add('active');
    }

    closeAuthModal() {
        document.getElementById('authModal').classList.remove('active');
    }

    switchAuthMode() {
        const title = document.getElementById('authTitle');
        const submitBtn = document.getElementById('authSubmitBtn');
        const switchText = document.getElementById('authSwitchText');
        const switchLink = document.getElementById('authSwitchLink');
        const nameGroup = document.getElementById('authNameGroup');
        const phoneGroup = document.getElementById('authPhoneGroup');

        if (title.textContent === 'Iniciar Sesión') {
            title.textContent = 'Crear Cuenta';
            submitBtn.textContent = 'Registrarse';
            switchText.innerHTML = '¿Ya tienes cuenta? <a href="#" id="authSwitchLink">Inicia sesión</a>';
            nameGroup.style.display = 'block';
            phoneGroup.style.display = 'block';
        } else {
            title.textContent = 'Iniciar Sesión';
            submitBtn.textContent = 'Iniciar Sesión';
            switchText.innerHTML = '¿No tienes cuenta? <a href="#" id="authSwitchLink">Regístrate</a>';
            nameGroup.style.display = 'none';
            phoneGroup.style.display = 'none';
        }

        // Re-asignar evento al nuevo enlace
        document.getElementById('authSwitchLink').addEventListener('click', (e) => {
            e.preventDefault();
            this.switchAuthMode();
        });
    }

    async handleAuth() {
        const isLogin = document.getElementById('authTitle').textContent === 'Iniciar Sesión';
        const formData = {
            email: document.getElementById('authEmail').value,
            password: document.getElementById('authPassword').value
        };

        if (!isLogin) {
            formData.name = document.getElementById('authName').value;
            formData.phone = document.getElementById('authPhone').value;
        }

        const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (response.ok) {
                if (isLogin) {
                    this.currentUser = result.user;
                    localStorage.setItem('accessToken', result.accessToken);
                    localStorage.setItem('refreshToken', result.refreshToken);
                    this.showNotification('Sesión iniciada correctamente', 'success');
                    this.updateUIForLoggedUser();
                } else {
                    this.showNotification('Cuenta creada. Verifica tu email.', 'success');
                }
                this.closeAuthModal();
            } else {
                this.showNotification(result.error || 'Error en la autenticación', 'error');
            }
        } catch (error) {
            console.error('❌ Error en autenticación:', error);
            this.showNotification('Error de conexión', 'error');
        }
    }

    loadUserSession() {
        const token = localStorage.getItem('accessToken');
        if (token) {
            // Verificar token y cargar usuario
            this.verifyToken(token);
        }
    }

    async verifyToken(token) {
        try {
            const response = await fetch('/api/auth/verify', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const user = await response.json();
                this.currentUser = user;
                this.updateUIForLoggedUser();
            } else {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
            }
        } catch (error) {
            console.error('❌ Error verificando token:', error);
        }
    }

    updateUIForLoggedUser() {
        const profileBtn = document.getElementById('profileBtn');
        if (profileBtn && this.currentUser) {
            profileBtn.innerHTML = `<span>${this.currentUser.name}</span>`;
        }
    }

    // === RESERVAS ===
    async bookSchedule(scheduleId) {
        if (!this.currentUser) {
            this.showAuthModal();
            return;
        }

        const passengers = parseInt(document.getElementById('passengerCount').textContent);
        
        try {
            const response = await fetch('/api/reservations/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                },
                body: JSON.stringify({
                    schedule_id: scheduleId,
                    passengers: passengers
                })
            });

            const result = await response.json();

            if (response.ok) {
                this.showNotification('¡Reserva creada exitosamente!', 'success');
                this.showBookingConfirmation(result);
            } else {
                this.showNotification(result.error || 'Error creando la reserva', 'error');
            }
        } catch (error) {
            console.error('❌ Error en reserva:', error);
            this.showNotification('Error de conexión', 'error');
        }
    }

    showBookingConfirmation(booking) {
        // Mostrar modal de confirmación con detalles de la reserva
        const modal = document.createElement('div');
        modal.className = 'modal-overlay active';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>¡Reserva Confirmada!</h3>
                    <button class="close-btn" onclick="this.closest('.modal-overlay').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="booking-confirmation">
                        <div class="confirmation-icon">
                            <i class="fas fa-check-circle"></i>
                        </div>
                        <h4>Código de Reserva</h4>
                        <div class="booking-code">${booking.reservation_code}</div>
                        <div class="booking-details">
                            <p><strong>Asientos:</strong> ${booking.seats.join(', ')}</p>
                            <p><strong>Total:</strong> $${booking.total_price}</p>
                        </div>
                        <button class="btn-primary" onclick="this.closest('.modal-overlay').remove()">
                            Entendido
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    // === WEBSOCKET ===
    handleWebSocketMessage(data) {
        switch (data.type) {
            case 'seat_update':
                this.updateSeatAvailability(data.schedule_id, data.available_seats);
                break;
            case 'price_change':
                this.updatePriceDisplay(data.schedule_id, data.new_price);
                break;
            case 'notification':
                this.showNotification(data.message, data.level);
                break;
        }
    }

    updateSeatAvailability(scheduleId, availableSeats) {
        const resultCards = document.querySelectorAll('.result-card');
        resultCards.forEach(card => {
            // Actualizar disponibilidad en tiempo real
            const availabilityElement = card.querySelector('.availability span');
            if (availabilityElement) {
                availabilityElement.textContent = `${availableSeats} asientos disponibles`;
            }
        });
    }

    // === UTILIDADES ===
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            weekday: 'short',
            day: 'numeric',
            month: 'short'
        });
    }

    getBusTypeLabel(type) {
        const labels = {
            economico: 'Económico',
            ejecutivo: 'Ejecutivo',
            premium: 'Premium',
            vip: 'VIP'
        };
        return labels[type] || type;
    }

    renderAmenities(amenities) {
        if (!amenities || amenities.length === 0) return '';
        
        const amenityIcons = {
            'WiFi': 'fas fa-wifi',
            'AC': 'fas fa-snowflake',
            'Baño': 'fas fa-restroom',
            'USB': 'fas fa-plug',
            'Entretenimiento': 'fas fa-tv'
        };

        return amenities.slice(0, 3).map(amenity => 
            `<span class="amenity"><i class="${amenityIcons[amenity] || 'fas fa-check'}"></i> ${amenity}</span>`
        ).join('');
    }

    renderStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        let stars = '';

        for (let i = 0; i < fullStars; i++) {
            stars += '<i class="fas fa-star"></i>';
        }
        if (hasHalfStar) {
            stars += '<i class="fas fa-star-half-alt"></i>';
        }
        for (let i = fullStars + (hasHalfStar ? 1 : 0); i < 5; i++) {
            stars += '<i class="far fa-star"></i>';
        }

        return stars;
    }

    setMinDate() {
        const today = new Date().toISOString().split('T')[0];
        const departureDateInput = document.getElementById('departureDate');
        const returnDateInput = document.getElementById('returnDate');
        
        if (departureDateInput) {
            departureDateInput.min = today;
            departureDateInput.value = today;
        }
        if (returnDateInput) {
            returnDateInput.min = today;
        }
    }

    showLoadingState() {
        const searchBtn = document.querySelector('.search-btn');
        if (searchBtn) {
            searchBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Buscando...';
            searchBtn.disabled = true;
        }
    }

    hideLoadingState() {
        const searchBtn = document.querySelector('.search-btn');
        if (searchBtn) {
            searchBtn.innerHTML = '<i class="fas fa-search"></i> Buscar Viajes Inteligentes';
            searchBtn.disabled = false;
        }
    }

    showResultsSection() {
        const resultsSection = document.getElementById('resultsSection');
        if (resultsSection) {
            resultsSection.style.display = 'block';
            resultsSection.scrollIntoView({ behavior: 'smooth' });
        }
    }
}

// Inicializar la aplicación
const busReserva = new BusReservaUltra();

// Estilos adicionales para toasts
const toastStyles = `
<style>
.toast-container {
    position: fixed;
    top: 90px;
    right: 20px;
    z-index: 3000;
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.toast {
    background: white;
    border-radius: 12px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
    padding: 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-width: 300px;
    animation: slideInRight 0.3s ease-out;
    border-left: 4px solid;
}

.toast-success { border-left-color: #10b981; }
.toast-error { border-left-color: #ef4444; }
.toast-warning { border-left-color: #f59e0b; }
.toast-info { border-left-color: #3b82f6; }

.toast-content {
    display: flex;
    align-items: center;
    gap: 12px;
}

.toast-content i {
    font-size: 18px;
}

.toast-success i { color: #10b981; }
.toast-error i { color: #ef4444; }
.toast-warning i { color: #f59e0b; }
.toast-info i { color: #3b82f6; }

.toast-close {
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
    color: #64748b;
}

.toast-close:hover {
    background: #f1f5f9;
}

@keyframes slideInRight {
    from {
        transform: translateX(100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}

.result-card {
    background: white;
    border-radius: 16px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    border: 1px solid rgba(0, 0, 0, 0.05);
    padding: 24px;
    margin-bottom: 20px;
    transition: all 0.3s ease;
}

.result-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.result-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 20px;
}

.route-info h3 {
    font-size: 20px;
    font-weight: 700;
    color: #0f172a;
    margin-bottom: 8px;
}

.schedule-info {
    display: flex;
    gap: 16px;
    color: #64748b;
    font-size: 14px;
}

.price-info {
    text-align: right;
}

.current-price {
    font-size: 28px;
    font-weight: 800;
    color: #6366f1;
}

.price-prediction {
    font-size: 12px;
    color: #64748b;
}

.result-body {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    align-items: center;
    margin-bottom: 20px;
}

.bus-type {
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
}

.bus-type.economico { background: #fef3c7; color: #92400e; }
.bus-type.ejecutivo { background: #dbeafe; color: #1e40af; }
.bus-type.premium { background: #f3e8ff; color: #7c3aed; }
.bus-type.vip { background: #fce7f3; color: #be185d; }

.amenities {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
}

.amenity {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    color: #64748b;
}

.availability {
    display: flex;
    align-items: center;
    gap: 8px;
}

.availability-indicator {
    width: 8px;
    height: 8px;
    border-radius: 50%;
}

.availability-indicator.high { background: #10b981; }
.availability-indicator.medium { background: #f59e0b; }
.availability-indicator.low { background: #ef4444; }

.result-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 20px;
    border-top: 1px solid #f1f5f9;
}

.recommendation {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #64748b;
    font-size: 14px;
}

.book-btn {
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 8px;
}

.book-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 10px 25px rgba(99, 102, 241, 0.3);
}

.no-results {
    text-align: center;
    padding: 60px 20px;
    color: #64748b;
}

.no-results i {
    font-size: 48px;
    margin-bottom: 20px;
    opacity: 0.5;
}

.booking-confirmation {
    text-align: center;
    padding: 20px;
}

.confirmation-icon {
    font-size: 48px;
    color: #10b981;
    margin-bottom: 20px;
}

.booking-code {
    font-size: 24px;
    font-weight: 800;
    color: #6366f1;
    background: #f8fafc;
    padding: 16px;
    border-radius: 12px;
    margin: 20px 0;
    letter-spacing: 2px;
}

.booking-details {
    margin: 20px 0;
    text-align: left;
}

.btn-primary {
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    color: white;
    border: none;
    padding: 12px 32px;
    border-radius: 12px;
    font-weight: 600;
    cursor: pointer;
    margin-top: 20px;
}
</style>
`;

document.head.insertAdjacentHTML('beforeend', toastStyles);