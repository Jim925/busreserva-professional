// Sistema Inteligente de Reserva de Autobuses
class SmartBusSystem {
    constructor() {
        this.token = localStorage.getItem('busToken');
        this.user = JSON.parse(localStorage.getItem('busUser') || 'null');
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadUserInterface();
        this.enableSmartFeatures();
    }

    // === AUTENTICACIÓN INTELIGENTE ===
    async login(email, password) {
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();
            
            if (response.ok) {
                this.token = data.token;
                this.user = data.user;
                localStorage.setItem('busToken', this.token);
                localStorage.setItem('busUser', JSON.stringify(this.user));
                this.showNotification('¡Bienvenido de vuelta!', 'success');
                this.loadUserInterface();
                return true;
            } else {
                this.showNotification(data.error, 'error');
                return false;
            }
        } catch (error) {
            this.showNotification('Error de conexión', 'error');
            return false;
        }
    }

    async register(userData) {
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });

            const data = await response.json();
            
            if (response.ok) {
                this.token = data.token;
                this.user = data.user;
                localStorage.setItem('busToken', this.token);
                localStorage.setItem('busUser', JSON.stringify(this.user));
                this.showNotification('¡Cuenta creada exitosamente!', 'success');
                this.loadUserInterface();
                return true;
            } else {
                this.showNotification(data.error, 'error');
                return false;
            }
        } catch (error) {
            this.showNotification('Error de conexión', 'error');
            return false;
        }
    }

    logout() {
        this.token = null;
        this.user = null;
        localStorage.removeItem('busToken');
        localStorage.removeItem('busUser');
        this.loadUserInterface();
        this.showNotification('Sesión cerrada', 'info');
    }

    // === BÚSQUEDA INTELIGENTE ===
    async smartSearch(criteria) {
        const { origin, destination, date, passengers, maxPrice, busType } = criteria;
        
        try {
            const params = new URLSearchParams({
                origin, destination, date, passengers: passengers || 1
            });
            
            if (maxPrice) params.append('maxPrice', maxPrice);
            if (busType) params.append('busType', busType);

            const response = await fetch(`/api/search?${params}`);
            const trips = await response.json();

            if (response.ok) {
                return this.enhanceSearchResults(trips);
            } else {
                this.showNotification(trips.error, 'error');
                return [];
            }
        } catch (error) {
            this.showNotification('Error en la búsqueda', 'error');
            return [];
        }
    }

    enhanceSearchResults(trips) {
        return trips.map(trip => ({
            ...trip,
            // Análisis de precio
            priceCategory: this.categorizePriceLevel(trip.price),
            // Análisis de disponibilidad
            availabilityLevel: this.categorizeAvailability(trip.available_seats, trip.capacity),
            // Recomendación personalizada
            personalizedScore: this.calculatePersonalizedScore(trip),
            // Etiquetas inteligentes
            tags: this.generateSmartTags(trip)
        }));
    }

    categorizePriceLevel(price) {
        if (price < 25) return { level: 'económico', color: 'green' };
        if (price < 50) return { level: 'moderado', color: 'orange' };
        return { level: 'premium', color: 'red' };
    }

    categorizeAvailability(available, capacity) {
        const percentage = (available / capacity) * 100;
        if (percentage > 50) return { level: 'alta', color: 'green', text: 'Muchos asientos' };
        if (percentage > 20) return { level: 'media', color: 'orange', text: 'Pocos asientos' };
        return { level: 'baja', color: 'red', text: 'Últimos asientos' };
    }

    calculatePersonalizedScore(trip) {
        let score = trip.recommendation_score || 0;
        
        // Preferencias del usuario (simuladas)
        const userPreferences = this.getUserPreferences();
        
        if (userPreferences.preferredTime) {
            const tripHour = parseInt(trip.departure_time.split(':')[0]);
            const prefHour = parseInt(userPreferences.preferredTime.split(':')[0]);
            if (Math.abs(tripHour - prefHour) <= 2) score += 10;
        }
        
        if (userPreferences.maxPrice && trip.price <= userPreferences.maxPrice) {
            score += 15;
        }
        
        if (userPreferences.preferredBusType === trip.bus_type) {
            score += 20;
        }
        
        return score;
    }

    generateSmartTags(trip) {
        const tags = [];
        
        if (trip.is_express) tags.push({ text: 'Expreso', color: 'blue' });
        if (trip.available_seats <= 5) tags.push({ text: 'Últimos asientos', color: 'red' });
        if (trip.bus_type === 'premium') tags.push({ text: 'Lujo', color: 'purple' });
        if (trip.price_per_km < 0.08) tags.push({ text: 'Mejor precio', color: 'green' });
        if (trip.comfort_level >= 4) tags.push({ text: 'Confort', color: 'indigo' });
        
        const hour = parseInt(trip.departure_time.split(':')[0]);
        if (hour >= 6 && hour <= 9) tags.push({ text: 'Madrugador', color: 'yellow' });
        if (hour >= 22 || hour <= 5) tags.push({ text: 'Nocturno', color: 'dark' });
        
        return tags;
    }

    // === RESERVA INTELIGENTE ===
    async smartReservation(reservationData) {
        if (!this.token) {
            this.showNotification('Debes iniciar sesión para reservar', 'error');
            return false;
        }

        try {
            const response = await fetch('/api/reservations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify(reservationData)
            });

            const data = await response.json();
            
            if (response.ok) {
                this.showReservationSuccess(data);
                return data;
            } else {
                this.showNotification(data.error, 'error');
                return false;
            }
        } catch (error) {
            this.showNotification('Error al procesar la reserva', 'error');
            return false;
        }
    }

    showReservationSuccess(reservation) {
        const message = `
            ¡Reserva confirmada!
            Código: ${reservation.reservation_code}
            Total: €${reservation.total_price}
            Viaje: ${reservation.trip.origin} → ${reservation.trip.destination}
            Fecha: ${reservation.trip.date} a las ${reservation.trip.time}
        `;
        this.showNotification(message, 'success', 8000);
    }

    // === FUNCIONES INTELIGENTES ===
    enableSmartFeatures() {
        this.enableAutoComplete();
        this.enableSmartFilters();
        this.enablePredictiveSearch();
        this.enableOfflineMode();
    }

    enableAutoComplete() {
        const originInput = document.getElementById('origin');
        const destinationInput = document.getElementById('destination');
        
        if (originInput && destinationInput) {
            this.setupAutoComplete(originInput);
            this.setupAutoComplete(destinationInput);
        }
    }

    async setupAutoComplete(input) {
        const cities = await this.getCities();
        
        input.addEventListener('input', (e) => {
            const value = e.target.value.toLowerCase();
            const matches = cities.filter(city => 
                city.toLowerCase().includes(value)
            ).slice(0, 5);
            
            this.showAutoCompleteResults(input, matches);
        });
    }

    async getCities() {
        try {
            const response = await fetch('/api/cities');
            return response.ok ? await response.json() : [];
        } catch {
            return ['Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Bilbao'];
        }
    }

    enableSmartFilters() {
        // Filtros dinámicos basados en resultados
        const filterContainer = document.getElementById('smartFilters');
        if (filterContainer) {
            filterContainer.innerHTML = `
                <div class="smart-filters">
                    <button class="filter-btn" data-filter="price-low">Precio bajo</button>
                    <button class="filter-btn" data-filter="comfort">Más cómodo</button>
                    <button class="filter-btn" data-filter="fast">Más rápido</button>
                    <button class="filter-btn" data-filter="available">Más disponible</button>
                </div>
            `;
        }
    }

    enablePredictiveSearch() {
        // Búsqueda predictiva basada en historial
        const searchHistory = JSON.parse(localStorage.getItem('searchHistory') || '[]');
        
        if (searchHistory.length > 0) {
            this.showSearchSuggestions(searchHistory.slice(-3));
        }
    }

    enableOfflineMode() {
        // Modo offline básico
        window.addEventListener('online', () => {
            this.showNotification('Conexión restaurada', 'success');
        });
        
        window.addEventListener('offline', () => {
            this.showNotification('Modo offline activado', 'warning');
        });
    }

    // === INTERFAZ INTELIGENTE ===
    loadUserInterface() {
        const userSection = document.getElementById('userSection');
        if (userSection) {
            if (this.user) {
                userSection.innerHTML = `
                    <div class="user-info">
                        <span>Hola, ${this.user.name}</span>
                        <button onclick="smartBus.logout()" class="btn btn-sm">Cerrar sesión</button>
                    </div>
                `;
            } else {
                userSection.innerHTML = `
                    <div class="auth-buttons">
                        <button onclick="showLoginModal()" class="btn">Iniciar sesión</button>
                        <button onclick="showRegisterModal()" class="btn btn-outline">Registrarse</button>
                    </div>
                `;
            }
        }
    }

    showNotification(message, type = 'info', duration = 5000) {
        const notification = document.createElement('div');
        notification.className = `smart-notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${this.getNotificationIcon(type)}</span>
                <span class="notification-message">${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, duration);
    }

    getNotificationIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        return icons[type] || icons.info;
    }

    getUserPreferences() {
        return JSON.parse(localStorage.getItem('userPreferences') || '{}');
    }

    saveUserPreferences(preferences) {
        localStorage.setItem('userPreferences', JSON.stringify(preferences));
    }

    // === ANÁLISIS Y MÉTRICAS ===
    trackUserAction(action, data = {}) {
        const event = {
            action,
            data,
            timestamp: new Date().toISOString(),
            user: this.user?.id || 'anonymous'
        };
        
        const analytics = JSON.parse(localStorage.getItem('analytics') || '[]');
        analytics.push(event);
        
        // Mantener solo los últimos 100 eventos
        if (analytics.length > 100) {
            analytics.splice(0, analytics.length - 100);
        }
        
        localStorage.setItem('analytics', JSON.stringify(analytics));
    }

    getAnalytics() {
        return JSON.parse(localStorage.getItem('analytics') || '[]');
    }
}

// Inicializar sistema inteligente
const smartBus = new SmartBusSystem();

// Funciones globales para compatibilidad
window.smartBus = smartBus;

// Funciones de interfaz
function showLoginModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal">
            <h3>Iniciar Sesión</h3>
            <form onsubmit="handleLogin(event)">
                <input type="email" id="loginEmail" placeholder="Email" required>
                <input type="password" id="loginPassword" placeholder="Contraseña" required>
                <button type="submit" class="btn">Iniciar Sesión</button>
                <button type="button" onclick="this.closest('.modal-overlay').remove()" class="btn btn-outline">Cancelar</button>
            </form>
        </div>
    `;
    document.body.appendChild(modal);
}

function showRegisterModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal">
            <h3>Crear Cuenta</h3>
            <form onsubmit="handleRegister(event)">
                <input type="text" id="registerName" placeholder="Nombre completo" required>
                <input type="email" id="registerEmail" placeholder="Email" required>
                <input type="password" id="registerPassword" placeholder="Contraseña (mín. 6 caracteres)" required>
                <input type="tel" id="registerPhone" placeholder="Teléfono (opcional)">
                <button type="submit" class="btn">Crear Cuenta</button>
                <button type="button" onclick="this.closest('.modal-overlay').remove()" class="btn btn-outline">Cancelar</button>
            </form>
        </div>
    `;
    document.body.appendChild(modal);
}

async function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    const success = await smartBus.login(email, password);
    if (success) {
        event.target.closest('.modal-overlay').remove();
    }
}

async function handleRegister(event) {
    event.preventDefault();
    const userData = {
        name: document.getElementById('registerName').value,
        email: document.getElementById('registerEmail').value,
        password: document.getElementById('registerPassword').value,
        phone: document.getElementById('registerPhone').value
    };
    
    const success = await smartBus.register(userData);
    if (success) {
        event.target.closest('.modal-overlay').remove();
    }
}

// Búsqueda inteligente mejorada
async function smartSearchTrips() {
    const criteria = {
        origin: document.getElementById('origin')?.value,
        destination: document.getElementById('destination')?.value,
        date: document.getElementById('date')?.value,
        passengers: document.getElementById('passengers')?.value || 1,
        maxPrice: document.getElementById('maxPrice')?.value,
        busType: document.getElementById('busType')?.value
    };
    
    if (!criteria.origin || !criteria.destination || !criteria.date) {
        smartBus.showNotification('Completa todos los campos requeridos', 'error');
        return;
    }
    
    smartBus.trackUserAction('search', criteria);
    
    const trips = await smartBus.smartSearch(criteria);
    displaySmartResults(trips);
}

function displaySmartResults(trips) {
    const resultsContainer = document.getElementById('tripsList');
    if (!resultsContainer) return;
    
    if (trips.length === 0) {
        resultsContainer.innerHTML = '<p class="no-results">No se encontraron viajes para tu búsqueda.</p>';
        return;
    }
    
    resultsContainer.innerHTML = trips.map(trip => `
        <div class="smart-trip-card" data-score="${trip.personalizedScore}">
            <div class="trip-header">
                <h4>${trip.origin} → ${trip.destination}</h4>
                <div class="trip-tags">
                    ${trip.tags.map(tag => `<span class="tag tag-${tag.color}">${tag.text}</span>`).join('')}
                </div>
            </div>
            <div class="trip-details">
                <div class="trip-time">
                    <span>🕐 ${trip.departure_time} - ${trip.arrival_time}</span>
                    <span class="duration">(${trip.duration_hours}h)</span>
                </div>
                <div class="trip-info">
                    <span class="bus-info">🚌 ${trip.bus_number} (${trip.bus_type})</span>
                    <span class="availability availability-${trip.availabilityLevel.level}">
                        ${trip.availabilityLevel.text} (${trip.available_seats})
                    </span>
                </div>
                <div class="trip-price">
                    <span class="price price-${trip.priceCategory.level}">€${trip.price}</span>
                    ${trip.price_per_km ? `<span class="price-per-km">€${trip.price_per_km}/km</span>` : ''}
                </div>
            </div>
            <div class="trip-actions">
                <button class="btn btn-primary" onclick="smartReserve(${trip.id}, ${trip.price})">
                    Reservar Ahora
                </button>
                <div class="recommendation-score">
                    Puntuación: ${trip.personalizedScore}/100
                </div>
            </div>
        </div>
    `).join('');
}

async function smartReserve(scheduleId, price) {
    const seatNumber = prompt('Número de asiento (1-50):');
    const passengers = parseInt(prompt('Número de pasajeros (1-4):') || '1');
    
    if (!seatNumber || passengers < 1 || passengers > 4) {
        smartBus.showNotification('Datos inválidos', 'error');
        return;
    }
    
    const reservationData = {
        schedule_id: scheduleId,
        seat_number: parseInt(seatNumber),
        passengers
    };
    
    smartBus.trackUserAction('reservation_attempt', reservationData);
    
    const result = await smartBus.smartReservation(reservationData);
    if (result) {
        smartBus.trackUserAction('reservation_success', result);
    }
}