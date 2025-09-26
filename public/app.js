// Funciones JavaScript adicionales para el sistema

class BusReservationSystem {
    constructor() {
        this.currentUser = null;
        this.selectedSeats = [];
        this.init();
    }

    init() {
        this.loadCities();
        this.setupEventListeners();
    }

    async loadCities() {
        try {
            const response = await fetch('/api/cities');
            const cities = await response.json();
            
            const originSelect = document.getElementById('origin');
            const destinationSelect = document.getElementById('destination');
            
            if (originSelect && destinationSelect) {
                const options = cities.map(city => `<option value="${city}">${city}</option>`).join('');
                originSelect.innerHTML = '<option value="">Seleccionar origen</option>' + options;
                destinationSelect.innerHTML = '<option value="">Seleccionar destino</option>' + options;
            }
        } catch (error) {
            console.error('Error loading cities:', error);
        }
    }

    setupEventListeners() {
        // Auto-completar campos de usuario si están guardados
        const savedUser = localStorage.getItem('busUser');
        if (savedUser) {
            const user = JSON.parse(savedUser);
            this.currentUser = user;
            
            const nameField = document.getElementById('userName');
            const emailField = document.getElementById('userEmail');
            const phoneField = document.getElementById('userPhone');
            
            if (nameField) nameField.value = user.name || '';
            if (emailField) emailField.value = user.email || '';
            if (phoneField) phoneField.value = user.phone || '';
        }
    }

    saveUser(userData) {
        this.currentUser = userData;
        localStorage.setItem('busUser', JSON.stringify(userData));
    }

    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type} fade-in`;
        notification.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; font-size: 18px; cursor: pointer;">&times;</button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }

    generateSeatMap(capacity, occupiedSeats = []) {
        const seatMap = document.createElement('div');
        seatMap.className = 'seat-map';
        
        for (let i = 1; i <= capacity; i++) {
            const seat = document.createElement('div');
            seat.className = 'seat';
            seat.textContent = i;
            
            if (occupiedSeats.includes(i)) {
                seat.classList.add('occupied');
            } else {
                seat.classList.add('available');
                seat.onclick = () => this.selectSeat(seat, i);
            }
            
            seatMap.appendChild(seat);
        }
        
        return seatMap;
    }

    selectSeat(seatElement, seatNumber) {
        if (seatElement.classList.contains('occupied')) return;
        
        // Limpiar selección anterior
        document.querySelectorAll('.seat.selected').forEach(seat => {
            seat.classList.remove('selected');
            seat.classList.add('available');
        });
        
        // Seleccionar nuevo asiento
        seatElement.classList.remove('available');
        seatElement.classList.add('selected');
        this.selectedSeats = [seatNumber];
    }

    async getOccupiedSeats(scheduleId) {
        try {
            const response = await fetch(`/api/schedules/${scheduleId}/seats`);
            if (response.ok) {
                return await response.json();
            }
        } catch (error) {
            console.error('Error getting occupied seats:', error);
        }
        return [];
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'EUR'
        }).format(amount);
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    formatTime(timeString) {
        return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    validatePhone(phone) {
        const re = /^[\+]?[0-9\s\-\(\)]{9,}$/;
        return re.test(phone);
    }

    showLoading(element) {
        const loading = document.createElement('div');
        loading.className = 'loading';
        element.appendChild(loading);
        return loading;
    }

    hideLoading(loadingElement) {
        if (loadingElement && loadingElement.parentNode) {
            loadingElement.parentNode.removeChild(loadingElement);
        }
    }
}

// Inicializar sistema
const busSystem = new BusReservationSystem();

// Funciones globales mejoradas
async function registerUser() {
    const name = document.getElementById('userName').value.trim();
    const email = document.getElementById('userEmail').value.trim();
    const phone = document.getElementById('userPhone').value.trim();

    if (!name || !email) {
        busSystem.showNotification('Nombre y email son requeridos', 'error');
        return;
    }

    if (!busSystem.validateEmail(email)) {
        busSystem.showNotification('Email no válido', 'error');
        return;
    }

    if (phone && !busSystem.validatePhone(phone)) {
        busSystem.showNotification('Teléfono no válido', 'error');
        return;
    }

    const loadingElement = busSystem.showLoading(document.getElementById('alerts'));

    try {
        const response = await fetch('/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, phone })
        });

        const data = await response.json();
        
        if (response.ok) {
            busSystem.saveUser(data);
            busSystem.showNotification(`Usuario registrado exitosamente. Tu ID es: ${data.id}`);
            
            // Limpiar formulario
            document.getElementById('userName').value = '';
            document.getElementById('userEmail').value = '';
            document.getElementById('userPhone').value = '';
        } else {
            busSystem.showNotification(data.error, 'error');
        }
    } catch (error) {
        busSystem.showNotification('Error al registrar usuario', 'error');
    } finally {
        busSystem.hideLoading(loadingElement);
    }
}

async function searchTrips() {
    const origin = document.getElementById('origin').value;
    const destination = document.getElementById('destination').value;
    const date = document.getElementById('date').value;

    if (!origin || !destination || !date) {
        busSystem.showNotification('Todos los campos son requeridos', 'error');
        return;
    }

    if (origin === destination) {
        busSystem.showNotification('El origen y destino no pueden ser iguales', 'error');
        return;
    }

    const loadingElement = busSystem.showLoading(document.getElementById('tripsList'));

    try {
        const response = await fetch(`/api/search?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&date=${date}`);
        const trips = await response.json();

        const resultsDiv = document.getElementById('searchResults');
        const tripsList = document.getElementById('tripsList');

        if (trips.length === 0) {
            tripsList.innerHTML = '<div class="route-info"><p>No se encontraron viajes para esta ruta y fecha.</p></div>';
        } else {
            tripsList.innerHTML = trips.map(trip => `
                <div class="route-info bus-type-${trip.bus_type}">
                    <h4>🚌 ${trip.origin} → ${trip.destination}</h4>
                    <p><strong>Fecha:</strong> ${busSystem.formatDate(trip.departure_date)}</p>
                    <p><strong>Salida:</strong> ${busSystem.formatTime(trip.departure_time)} | <strong>Llegada:</strong> ${busSystem.formatTime(trip.arrival_time)}</p>
                    <p><strong>Autobús:</strong> ${trip.bus_number} (${trip.bus_type.charAt(0).toUpperCase() + trip.bus_type.slice(1)})</p>
                    <p><strong>Asientos disponibles:</strong> ${trip.available_seats}</p>
                    <div class="price-tag">${busSystem.formatCurrency(trip.price)}</div>
                    <button class="btn btn-success" onclick="makeReservation(${trip.id}, ${trip.price}, ${trip.available_seats})" ${trip.available_seats === 0 ? 'disabled' : ''}>
                        ${trip.available_seats === 0 ? '❌ Sin asientos' : '🎫 Reservar'}
                    </button>
                </div>
            `).join('');
        }

        resultsDiv.classList.remove('hidden');
    } catch (error) {
        busSystem.showNotification('Error al buscar viajes', 'error');
    } finally {
        busSystem.hideLoading(loadingElement);
    }
}

// Exportar para uso global
window.busSystem = busSystem;