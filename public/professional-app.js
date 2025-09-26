// BusReserva Professional - JavaScript Corporativo
// ===============================================

class BusReservaProfessional {
    constructor() {
        this.currentUser = null;
        this.searchResults = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setMinDate();
        this.loadUserSession();
    }

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
                this.performSearch();
            });
        }

        // Controles de pasajeros
        document.getElementById('increasePassengers')?.addEventListener('click', () => {
            this.updatePassengerCount(1);
        });
        
        document.getElementById('decreasePassengers')?.addEventListener('click', () => {
            this.updatePassengerCount(-1);
        });

        // Geolocalización
        document.getElementById('useLocationBtn')?.addEventListener('click', () => {
            this.useCurrentLocation();
        });

        // Autenticación
        document.getElementById('loginBtn')?.addEventListener('click', () => {
            if (this.currentUser) {
                this.showUserMenu();
            } else {
                window.location.href = '/auth.html';
            }
        });

        document.getElementById('registerBtn')?.addEventListener('click', () => {
            window.location.href = '/auth.html';
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
            document.querySelector(`[href="${sectionId}"]`)?.classList.add('active');
        }
    }

    // === BÚSQUEDA ===
    async performSearch() {
        const formData = this.getSearchFormData();
        
        if (!this.validateSearchForm(formData)) {
            return;
        }

        this.showLoadingState();

        try {
            const response = await fetch('/api/search?' + new URLSearchParams(formData));
            const results = await response.json();

            if (response.ok) {
                this.searchResults = results;
                this.displaySearchResults(results);
                this.showResultsSection();
            } else {
                this.showNotification(results.error || 'Error en la búsqueda', 'error');
            }
        } catch (error) {
            console.error('Error en búsqueda:', error);
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
            directOnly: document.getElementById('directOnly').checked
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
        const resultsList = document.getElementById('resultsList');
        if (!resultsList) return;

        resultsList.innerHTML = '';

        if (results.length === 0) {
            resultsList.innerHTML = `
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
            resultsList.appendChild(resultCard);
        });
    }

    createResultCard(schedule) {
        const card = document.createElement('div');
        card.className = 'result-card';
        
        card.innerHTML = `
            <div class="result-header">
                <div class="route-info">
                    <h3>${schedule.origin} → ${schedule.destination}</h3>
                    <div class="schedule-details">
                        <span><i class="fas fa-clock"></i> ${schedule.departure_time}</span>
                        <span><i class="fas fa-calendar"></i> ${this.formatDate(schedule.departure_date)}</span>
                        <span><i class="fas fa-users"></i> ${schedule.available_seats} disponibles</span>
                    </div>
                </div>
                <div class="price-section">
                    <div class="price">$${schedule.price}</div>
                    <button class="btn-primary" onclick="busReserva.bookSchedule(${schedule.id})">
                        Reservar
                    </button>
                </div>
            </div>
            
            <div class="result-details">
                <div class="bus-info">
                    <span class="bus-type">${this.getBusTypeLabel(schedule.bus_type)}</span>
                    <span class="bus-number">Bus ${schedule.bus_number}</span>
                </div>
                <div class="duration">
                    <i class="fas fa-route"></i>
                    Duración: ${schedule.duration || 'N/A'}
                </div>
            </div>
        `;

        return card;
    }

    // === CONTROLES ===
    updatePassengerCount(change) {
        const countElement = document.getElementById('passengerCount');
        let count = parseInt(countElement.textContent);
        count = Math.max(1, Math.min(10, count + change));
        countElement.textContent = count;
    }

    async useCurrentLocation() {
        if (!navigator.geolocation) {
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
            console.error('Error obteniendo ubicación:', error);
            this.showNotification('No se pudo obtener la ubicación', 'error');
        } finally {
            btn.innerHTML = '<i class="fas fa-crosshairs"></i>';
        }
    }

    getCurrentPosition() {
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
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
                const suggestions = document.getElementById(suggestionsId);
                if (suggestions) suggestions.innerHTML = '';
            }, 200);
        });
    }

    async showSuggestions(query, suggestionsId) {
        if (query.length < 2) {
            const suggestions = document.getElementById(suggestionsId);
            if (suggestions) suggestions.innerHTML = '';
            return;
        }

        try {
            const response = await fetch(`/api/cities?q=${encodeURIComponent(query)}`);
            const cities = await response.json();
            
            const suggestionsElement = document.getElementById(suggestionsId);
            if (!suggestionsElement) return;
            
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
            console.error('Error obteniendo sugerencias:', error);
        }
    }

    // === AUTENTICACIÓN ===
    showAuthModal(mode = 'login') {
        const modal = document.getElementById('authModal');
        const title = document.getElementById('authTitle');
        const submitBtn = document.getElementById('authSubmitBtn');
        const switchText = document.getElementById('authSwitchText');
        const nameGroup = document.getElementById('authNameGroup');
        const phoneGroup = document.getElementById('authPhoneGroup');

        if (mode === 'register') {
            title.textContent = 'Crear Cuenta';
            submitBtn.textContent = 'Registrarse';
            switchText.innerHTML = '¿Ya tienes cuenta? <a href="#" id="authSwitchLink">Iniciar sesión</a>';
            nameGroup.style.display = 'block';
            phoneGroup.style.display = 'block';
        } else {
            title.textContent = 'Iniciar Sesión';
            submitBtn.textContent = 'Iniciar Sesión';
            switchText.innerHTML = '¿No tienes cuenta? <a href="#" id="authSwitchLink">Crear cuenta</a>';
            nameGroup.style.display = 'none';
            phoneGroup.style.display = 'none';
        }

        // Re-asignar evento al nuevo enlace
        document.getElementById('authSwitchLink').addEventListener('click', (e) => {
            e.preventDefault();
            this.switchAuthMode();
        });

        modal.classList.add('active');
    }

    closeAuthModal() {
        document.getElementById('authModal').classList.remove('active');
    }

    switchAuthMode() {
        const title = document.getElementById('authTitle');
        const isLogin = title.textContent === 'Iniciar Sesión';
        this.showAuthModal(isLogin ? 'register' : 'login');
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

        const endpoint = isLogin ? '/api/users/login' : '/api/users';

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
                    localStorage.setItem('userToken', result.token);
                    this.showNotification('Sesión iniciada correctamente', 'success');
                    this.updateUIForLoggedUser();
                } else {
                    this.showNotification('Cuenta creada exitosamente', 'success');
                }
                this.closeAuthModal();
            } else {
                this.showNotification(result.error || 'Error en la autenticación', 'error');
            }
        } catch (error) {
            console.error('Error en autenticación:', error);
            this.showNotification('Error de conexión', 'error');
        }
    }

    async loadUserSession() {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const response = await fetch('/auth/verify', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    this.currentUser = data.user;
                    this.updateUIForLoggedUser();
                } else {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                }
            } catch (error) {
                console.error('Error verificando sesión:', error);
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
        }
    }

    updateUIForLoggedUser() {
        const loginBtn = document.getElementById('loginBtn');
        const registerBtn = document.getElementById('registerBtn');
        
        if (loginBtn && this.currentUser) {
            loginBtn.innerHTML = `
                <i class="fas fa-user"></i>
                ${this.currentUser.name || 'Usuario'}
            `;
        }
        if (registerBtn) {
            registerBtn.style.display = 'none';
        }
    }

    showUserMenu() {
        const menu = document.createElement('div');
        menu.className = 'user-menu';
        menu.innerHTML = `
            <div class="user-menu-content">
                <div class="user-info">
                    ${this.currentUser.profile_picture ? 
                        `<img src="${this.currentUser.profile_picture}" alt="Avatar" class="user-avatar">` : 
                        '<div class="user-avatar-placeholder"><i class="fas fa-user"></i></div>'
                    }
                    <div>
                        <div class="user-name">${this.currentUser.name}</div>
                        <div class="user-email">${this.currentUser.email}</div>
                    </div>
                </div>
                <div class="user-menu-actions">
                    <button onclick="busReserva.viewMyReservations()">
                        <i class="fas fa-ticket-alt"></i> Mis Reservas
                    </button>
                    <button onclick="busReserva.logout()">
                        <i class="fas fa-sign-out-alt"></i> Cerrar Sesión
                    </button>
                </div>
            </div>
        `;
        
        // Remover menú existente
        document.querySelector('.user-menu')?.remove();
        
        // Agregar nuevo menú
        document.body.appendChild(menu);
        
        // Cerrar al hacer clic fuera
        setTimeout(() => {
            document.addEventListener('click', (e) => {
                if (!menu.contains(e.target) && !document.getElementById('loginBtn').contains(e.target)) {
                    menu.remove();
                }
            }, { once: true });
        }, 100);
    }

    async logout() {
        try {
            await fetch('/auth/logout', { method: 'POST' });
        } catch (error) {
            console.error('Error en logout:', error);
        } finally {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            this.currentUser = null;
            window.location.reload();
        }
    }

    async viewMyReservations() {
        if (!this.currentUser) return;
        
        try {
            const response = await fetch(`/api/reservations/${this.currentUser.id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            if (response.ok) {
                const reservations = await response.json();
                this.showReservationsModal(reservations);
            } else {
                this.showNotification('Error cargando reservas', 'error');
            }
        } catch (error) {
            console.error('Error cargando reservas:', error);
            this.showNotification('Error de conexión', 'error');
        }
    }

    showReservationsModal(reservations) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay active';
        modal.innerHTML = `
            <div class="modal large">
                <div class="modal-header">
                    <h3>Mis Reservas</h3>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    ${reservations.length === 0 ? 
                        '<div class="no-reservations"><i class="fas fa-ticket-alt"></i><p>No tienes reservas aún</p></div>' :
                        reservations.map(res => `
                            <div class="reservation-card">
                                <div class="reservation-header">
                                    <h4>${res.origin} → ${res.destination}</h4>
                                    <span class="status status-${res.status}">${res.status}</span>
                                </div>
                                <div class="reservation-details">
                                    <div><i class="fas fa-calendar"></i> ${this.formatDate(res.departure_date)}</div>
                                    <div><i class="fas fa-clock"></i> ${res.departure_time}</div>
                                    <div><i class="fas fa-bus"></i> Bus ${res.bus_number}</div>
                                    <div><i class="fas fa-chair"></i> Asiento ${res.seat_number}</div>
                                    <div><i class="fas fa-dollar-sign"></i> $${res.total_price}</div>
                                </div>
                            </div>
                        `).join('')
                    }
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    // === RESERVAS ===
    async bookSchedule(scheduleId) {
        if (!this.currentUser) {
            window.location.href = '/auth.html';
            return;
        }

        const seatNumber = Math.floor(Math.random() * 40) + 1; // Asiento aleatorio
        
        try {
            const response = await fetch('/api/reservations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    user_id: this.currentUser.id,
                    schedule_id: scheduleId,
                    seat_number: seatNumber
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
            console.error('Error en reserva:', error);
            this.showNotification('Error de conexión', 'error');
        }
    }

    showBookingConfirmation(booking) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay active';
        modal.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <h3>¡Reserva Confirmada!</h3>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="booking-confirmation">
                        <div class="confirmation-icon">
                            <i class="fas fa-check-circle"></i>
                        </div>
                        <h4>Código de Reserva</h4>
                        <div class="booking-code">${booking.reservation_code || 'BR' + Date.now()}</div>
                        <div class="booking-details">
                            <p><strong>Total:</strong> $${booking.total_price}</p>
                            <p><strong>Pasajeros:</strong> ${booking.passengers}</p>
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

    // === NOTIFICACIONES ===
    showNotification(message, type = 'info') {
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

        let toastContainer = document.querySelector('.toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.className = 'toast-container';
            document.body.appendChild(toastContainer);
        }

        toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 5000);
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

    setMinDate() {
        const today = new Date().toISOString().split('T')[0];
        const departureDateInput = document.getElementById('departureDate');
        
        if (departureDateInput) {
            departureDateInput.min = today;
            departureDateInput.value = today;
        }
    }

    showLoadingState() {
        const searchBtn = document.querySelector('.btn-search');
        if (searchBtn) {
            searchBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Buscando...';
            searchBtn.disabled = true;
        }
    }

    hideLoadingState() {
        const searchBtn = document.querySelector('.btn-search');
        if (searchBtn) {
            searchBtn.innerHTML = '<i class="fas fa-search"></i> Buscar Viajes';
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
const busReserva = new BusReservaProfessional();

// Estilos adicionales para componentes dinámicos
const additionalStyles = `
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
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-lg);
    padding: 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-width: 300px;
    animation: slideInRight 0.3s ease-out;
    border-left: 4px solid;
}

.toast-success { border-left-color: var(--success); }
.toast-error { border-left-color: var(--error); }
.toast-warning { border-left-color: var(--warning); }
.toast-info { border-left-color: var(--info); }

.toast-content {
    display: flex;
    align-items: center;
    gap: 12px;
}

.toast-content i {
    font-size: 18px;
}

.toast-success i { color: var(--success); }
.toast-error i { color: var(--error); }
.toast-warning i { color: var(--warning); }
.toast-info i { color: var(--info); }

.toast-close {
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px;
    border-radius: var(--radius-sm);
    color: var(--gray-400);
}

.toast-close:hover {
    background: var(--gray-100);
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
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-sm);
    border: 1px solid var(--gray-100);
    padding: var(--space-6);
    transition: var(--transition);
}

.result-card:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
}

.result-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: var(--space-4);
}

.route-info h3 {
    font-size: var(--font-size-xl);
    font-weight: 600;
    color: var(--gray-900);
    margin-bottom: var(--space-2);
}

.schedule-details {
    display: flex;
    gap: var(--space-4);
    color: var(--gray-600);
    font-size: var(--font-size-sm);
}

.price-section {
    text-align: right;
}

.price {
    font-size: var(--font-size-2xl);
    font-weight: 700;
    color: var(--primary-color);
    margin-bottom: var(--space-2);
}

.result-details {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: var(--space-4);
    border-top: 1px solid var(--gray-100);
}

.bus-info {
    display: flex;
    gap: var(--space-3);
    align-items: center;
}

.bus-type {
    padding: var(--space-1) var(--space-3);
    background: var(--gray-100);
    color: var(--gray-700);
    border-radius: var(--radius-full);
    font-size: var(--font-size-xs);
    font-weight: 500;
    text-transform: uppercase;
}

.bus-number {
    color: var(--gray-600);
    font-size: var(--font-size-sm);
}

.duration {
    color: var(--gray-600);
    font-size: var(--font-size-sm);
}

.no-results {
    text-align: center;
    padding: var(--space-12);
    color: var(--gray-500);
}

.no-results i {
    font-size: 48px;
    margin-bottom: var(--space-4);
    opacity: 0.5;
}

.suggestions {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: white;
    border: 1px solid var(--gray-200);
    border-top: none;
    border-radius: 0 0 var(--radius-md) var(--radius-md);
    box-shadow: var(--shadow-md);
    z-index: 10;
}

.suggestion-item {
    padding: var(--space-3) var(--space-4);
    cursor: pointer;
    transition: var(--transition);
}

.suggestion-item:hover {
    background: var(--gray-50);
}

.booking-confirmation {
    text-align: center;
    padding: var(--space-6);
}

.confirmation-icon {
    font-size: 48px;
    color: var(--success);
    margin-bottom: var(--space-4);
}

.booking-code {
    font-size: var(--font-size-2xl);
    font-weight: 700;
    color: var(--primary-color);
    background: var(--gray-50);
    padding: var(--space-4);
    border-radius: var(--radius-lg);
    margin: var(--space-4) 0;
    letter-spacing: 2px;
}

.booking-details {
    margin: var(--space-4) 0;
    text-align: left;
}

.user-menu {
    position: fixed;
    top: 80px;
    right: 20px;
    background: white;
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-lg);
    border: 1px solid var(--gray-200);
    z-index: 2000;
    min-width: 280px;
    animation: slideInRight 0.2s ease-out;
}

.user-menu-content {
    padding: var(--space-4);
}

.user-info {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding-bottom: var(--space-4);
    border-bottom: 1px solid var(--gray-100);
    margin-bottom: var(--space-4);
}

.user-avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    object-fit: cover;
}

.user-avatar-placeholder {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: var(--gray-200);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--gray-500);
}

.user-name {
    font-weight: 600;
    color: var(--gray-900);
}

.user-email {
    font-size: var(--font-size-sm);
    color: var(--gray-600);
}

.user-menu-actions {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
}

.user-menu-actions button {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-3);
    background: none;
    border: none;
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: var(--transition);
    text-align: left;
    width: 100%;
}

.user-menu-actions button:hover {
    background: var(--gray-50);
}

.reservation-card {
    background: var(--gray-50);
    border-radius: var(--radius-lg);
    padding: var(--space-4);
    margin-bottom: var(--space-4);
}

.reservation-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-3);
}

.reservation-header h4 {
    font-size: var(--font-size-lg);
    font-weight: 600;
    color: var(--gray-900);
}

.status {
    padding: var(--space-1) var(--space-3);
    border-radius: var(--radius-full);
    font-size: var(--font-size-xs);
    font-weight: 500;
    text-transform: uppercase;
}

.status-confirmada {
    background: var(--success-light);
    color: var(--success);
}

.status-pendiente {
    background: var(--warning-light);
    color: var(--warning);
}

.status-cancelada {
    background: var(--error-light);
    color: var(--error);
}

.reservation-details {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: var(--space-3);
    font-size: var(--font-size-sm);
    color: var(--gray-600);
}

.reservation-details > div {
    display: flex;
    align-items: center;
    gap: var(--space-2);
}

.no-reservations {
    text-align: center;
    padding: var(--space-8);
    color: var(--gray-500);
}

.no-reservations i {
    font-size: 48px;
    margin-bottom: var(--space-4);
    opacity: 0.5;
}

.modal.large {
    max-width: 800px;
    width: 90vw;
}

:root {
    --success-light: #d4edda;
    --warning-light: #fff3cd;
    --error-light: #f8d7da;
}
</style>
`;

document.head.insertAdjacentHTML('beforeend', additionalStyles);