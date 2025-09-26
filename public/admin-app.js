// Admin Panel - JavaScript Ultra Profesional
// ==========================================

class AdminPanel {
    constructor() {
        this.currentSection = 'dashboard';
        this.charts = {};
        this.data = {
            users: [],
            buses: [],
            routes: [],
            schedules: [],
            reservations: []
        };
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadDashboardData();
        this.initializeCharts();
        this.loadAllData();
    }

    setupEventListeners() {
        // Sidebar navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = item.dataset.section;
                this.showSection(section);
            });
        });

        // Sidebar toggle
        document.getElementById('sidebarToggle')?.addEventListener('click', () => {
            this.toggleSidebar();
        });

        document.getElementById('menuToggle')?.addEventListener('click', () => {
            this.toggleSidebar();
        });

        // Modal controls
        document.getElementById('modalClose')?.addEventListener('click', () => {
            this.closeModal();
        });

        document.getElementById('modalOverlay')?.addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                this.closeModal();
            }
        });

        // Add buttons
        document.getElementById('addUserBtn')?.addEventListener('click', () => {
            this.showAddUserModal();
        });

        document.getElementById('addBusBtn')?.addEventListener('click', () => {
            this.showAddBusModal();
        });

        document.getElementById('addRouteBtn')?.addEventListener('click', () => {
            this.showAddRouteModal();
        });

        document.getElementById('addScheduleBtn')?.addEventListener('click', () => {
            this.showAddScheduleModal();
        });

        // Filters
        document.getElementById('userFilter')?.addEventListener('change', () => {
            this.filterUsers();
        });

        document.getElementById('userSearch')?.addEventListener('input', () => {
            this.filterUsers();
        });

        document.getElementById('reservationStatus')?.addEventListener('change', () => {
            this.filterReservations();
        });

        // Analytics controls
        document.getElementById('analyticsRange')?.addEventListener('change', () => {
            this.updateAnalytics();
        });

        document.getElementById('exportReport')?.addEventListener('click', () => {
            this.exportReport();
        });
    }

    // === NAVIGATION ===
    showSection(sectionName) {
        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');

        // Update content
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(sectionName).classList.add('active');

        // Update page title
        const titles = {
            dashboard: 'Dashboard',
            users: 'Gestión de Usuarios',
            buses: 'Gestión de Autobuses',
            routes: 'Gestión de Rutas',
            schedules: 'Gestión de Horarios',
            reservations: 'Gestión de Reservas',
            analytics: 'Analytics y Reportes'
        };
        document.getElementById('pageTitle').textContent = titles[sectionName];

        this.currentSection = sectionName;

        // Load section-specific data
        this.loadSectionData(sectionName);
    }

    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        sidebar.classList.toggle('collapsed');
    }

    // === DATA LOADING ===
    async loadDashboardData() {
        try {
            // Load stats
            const [users, buses, reservations] = await Promise.all([
                this.fetchData('/api/users'),
                this.fetchData('/api/buses'),
                this.fetchData('/api/reservations')
            ]);

            document.getElementById('totalUsers').textContent = users.length;
            document.getElementById('totalBuses').textContent = buses.length;
            document.getElementById('totalReservations').textContent = 
                reservations.filter(r => r.reservation_date === new Date().toISOString().split('T')[0]).length;

            const totalRevenue = reservations
                .filter(r => r.status === 'confirmada')
                .reduce((sum, r) => sum + parseFloat(r.total_price || 0), 0);
            document.getElementById('totalRevenue').textContent = `€${totalRevenue.toFixed(2)}`;

            // Load recent activity
            this.loadRecentActivity();

        } catch (error) {
            console.error('Error loading dashboard data:', error);
            this.showToast('Error cargando datos del dashboard', 'error');
        }
    }

    async loadRecentActivity() {
        try {
            const reservations = await this.fetchData('/api/reservations');
            const recentReservations = reservations
                .sort((a, b) => new Date(b.reservation_date) - new Date(a.reservation_date))
                .slice(0, 5);

            const activityList = document.getElementById('recentActivity');
            activityList.innerHTML = recentReservations.map(reservation => `
                <div class="activity-item">
                    <div class="activity-icon" style="background: var(--primary);">
                        <i class="fas fa-ticket-alt"></i>
                    </div>
                    <div class="activity-content">
                        <h4>Nueva reserva #${reservation.id}</h4>
                        <p>${reservation.user_name || 'Usuario'} - ${reservation.origin} → ${reservation.destination}</p>
                    </div>
                    <div class="activity-time">
                        ${this.formatDate(reservation.reservation_date)}
                    </div>
                </div>
            `).join('');
        } catch (error) {
            console.error('Error loading recent activity:', error);
        }
    }

    async loadAllData() {
        try {
            const [users, buses, routes, schedules, reservations] = await Promise.all([
                this.fetchData('/api/users'),
                this.fetchData('/api/buses'),
                this.fetchData('/api/routes'),
                this.fetchData('/api/schedules'),
                this.fetchData('/api/reservations')
            ]);

            this.data = { users, buses, routes, schedules, reservations };
        } catch (error) {
            console.error('Error loading data:', error);
        }
    }

    async loadSectionData(section) {
        switch (section) {
            case 'users':
                await this.loadUsers();
                break;
            case 'buses':
                await this.loadBuses();
                break;
            case 'routes':
                await this.loadRoutes();
                break;
            case 'schedules':
                await this.loadSchedules();
                break;
            case 'reservations':
                await this.loadReservations();
                break;
            case 'analytics':
                await this.loadAnalytics();
                break;
        }
    }

    // === USERS MANAGEMENT ===
    async loadUsers() {
        try {
            const users = await this.fetchData('/api/users');
            this.data.users = users;
            this.renderUsersTable(users);
        } catch (error) {
            console.error('Error loading users:', error);
            this.showToast('Error cargando usuarios', 'error');
        }
    }

    renderUsersTable(users) {
        const tbody = document.getElementById('usersTableBody');
        tbody.innerHTML = users.map(user => `
            <tr>
                <td>${user.id}</td>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>${user.phone || 'N/A'}</td>
                <td>${this.formatDate(user.created_at)}</td>
                <td>
                    <span class="status-badge active">Activo</span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn edit" onclick="adminPanel.editUser(${user.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete" onclick="adminPanel.deleteUser(${user.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    filterUsers() {
        const search = document.getElementById('userSearch').value.toLowerCase();
        const filter = document.getElementById('userFilter').value;
        
        let filteredUsers = this.data.users;
        
        if (search) {
            filteredUsers = filteredUsers.filter(user => 
                user.name.toLowerCase().includes(search) ||
                user.email.toLowerCase().includes(search)
            );
        }
        
        this.renderUsersTable(filteredUsers);
    }

    showAddUserModal() {
        this.showModal('Agregar Usuario', `
            <form id="addUserForm">
                <div class="form-grid">
                    <div class="form-group">
                        <label>Nombre</label>
                        <input type="text" name="name" required>
                    </div>
                    <div class="form-group">
                        <label>Email</label>
                        <input type="email" name="email" required>
                    </div>
                    <div class="form-group">
                        <label>Teléfono</label>
                        <input type="tel" name="phone">
                    </div>
                </div>
                <div style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 2rem;">
                    <button type="button" class="btn-secondary" onclick="adminPanel.closeModal()">Cancelar</button>
                    <button type="submit" class="btn-primary">Guardar</button>
                </div>
            </form>
        `);

        document.getElementById('addUserForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addUser(new FormData(e.target));
        });
    }

    async addUser(formData) {
        try {
            const userData = {
                name: formData.get('name'),
                email: formData.get('email'),
                phone: formData.get('phone')
            };

            const response = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });

            if (response.ok) {
                this.showToast('Usuario agregado exitosamente', 'success');
                this.closeModal();
                this.loadUsers();
            } else {
                const error = await response.json();
                this.showToast(error.error || 'Error agregando usuario', 'error');
            }
        } catch (error) {
            console.error('Error adding user:', error);
            this.showToast('Error agregando usuario', 'error');
        }
    }

    async deleteUser(userId) {
        if (!confirm('¿Estás seguro de eliminar este usuario?')) return;

        try {
            const response = await fetch(`/api/users/${userId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                this.showToast('Usuario eliminado exitosamente', 'success');
                this.loadUsers();
            } else {
                this.showToast('Error eliminando usuario', 'error');
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            this.showToast('Error eliminando usuario', 'error');
        }
    }

    // === BUSES MANAGEMENT ===
    async loadBuses() {
        try {
            const buses = await this.fetchData('/api/buses');
            this.data.buses = buses;
            this.renderBusesTable(buses);
        } catch (error) {
            console.error('Error loading buses:', error);
            this.showToast('Error cargando autobuses', 'error');
        }
    }

    renderBusesTable(buses) {
        const tbody = document.getElementById('busesTableBody');
        tbody.innerHTML = buses.map(bus => `
            <tr>
                <td>${bus.id}</td>
                <td>${bus.number}</td>
                <td>
                    <span class="status-badge ${bus.type}">${this.getBusTypeLabel(bus.type)}</span>
                </td>
                <td>${bus.capacity}</td>
                <td>
                    <span class="status-badge active">Activo</span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn edit" onclick="adminPanel.editBus(${bus.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete" onclick="adminPanel.deleteBus(${bus.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    showAddBusModal() {
        this.showModal('Agregar Autobús', `
            <form id="addBusForm">
                <div class="form-grid">
                    <div class="form-group">
                        <label>Número</label>
                        <input type="text" name="number" required>
                    </div>
                    <div class="form-group">
                        <label>Tipo</label>
                        <select name="type" required>
                            <option value="economico">Económico</option>
                            <option value="ejecutivo">Ejecutivo</option>
                            <option value="premium">Premium</option>
                            <option value="vip">VIP</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Capacidad</label>
                        <input type="number" name="capacity" min="20" max="60" required>
                    </div>
                </div>
                <div style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 2rem;">
                    <button type="button" class="btn-secondary" onclick="adminPanel.closeModal()">Cancelar</button>
                    <button type="submit" class="btn-primary">Guardar</button>
                </div>
            </form>
        `);

        document.getElementById('addBusForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addBus(new FormData(e.target));
        });
    }

    async addBus(formData) {
        try {
            const busData = {
                number: formData.get('number'),
                type: formData.get('type'),
                capacity: parseInt(formData.get('capacity'))
            };

            const response = await fetch('/api/buses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(busData)
            });

            if (response.ok) {
                this.showToast('Autobús agregado exitosamente', 'success');
                this.closeModal();
                this.loadBuses();
            } else {
                const error = await response.json();
                this.showToast(error.error || 'Error agregando autobús', 'error');
            }
        } catch (error) {
            console.error('Error adding bus:', error);
            this.showToast('Error agregando autobús', 'error');
        }
    }

    // === ROUTES MANAGEMENT ===
    async loadRoutes() {
        try {
            const routes = await this.fetchData('/api/routes');
            this.data.routes = routes;
            this.renderRoutesTable(routes);
        } catch (error) {
            console.error('Error loading routes:', error);
            this.showToast('Error cargando rutas', 'error');
        }
    }

    renderRoutesTable(routes) {
        const tbody = document.getElementById('routesTableBody');
        tbody.innerHTML = routes.map(route => `
            <tr>
                <td>${route.id}</td>
                <td>${route.origin}</td>
                <td>${route.destination}</td>
                <td>${route.distance || 'N/A'} km</td>
                <td>${route.duration || 'N/A'}</td>
                <td>€${route.price}</td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn edit" onclick="adminPanel.editRoute(${route.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete" onclick="adminPanel.deleteRoute(${route.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    showAddRouteModal() {
        this.showModal('Agregar Ruta', `
            <form id="addRouteForm">
                <div class="form-grid">
                    <div class="form-group">
                        <label>Origen</label>
                        <input type="text" name="origin" required>
                    </div>
                    <div class="form-group">
                        <label>Destino</label>
                        <input type="text" name="destination" required>
                    </div>
                    <div class="form-group">
                        <label>Distancia (km)</label>
                        <input type="number" name="distance" step="0.1">
                    </div>
                    <div class="form-group">
                        <label>Duración</label>
                        <input type="time" name="duration">
                    </div>
                    <div class="form-group">
                        <label>Precio (€)</label>
                        <input type="number" name="price" step="0.01" required>
                    </div>
                </div>
                <div style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 2rem;">
                    <button type="button" class="btn-secondary" onclick="adminPanel.closeModal()">Cancelar</button>
                    <button type="submit" class="btn-primary">Guardar</button>
                </div>
            </form>
        `);

        document.getElementById('addRouteForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addRoute(new FormData(e.target));
        });
    }

    async addRoute(formData) {
        try {
            const routeData = {
                origin: formData.get('origin'),
                destination: formData.get('destination'),
                distance: formData.get('distance') ? parseFloat(formData.get('distance')) : null,
                duration: formData.get('duration') || null,
                price: parseFloat(formData.get('price'))
            };

            const response = await fetch('/api/routes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(routeData)
            });

            if (response.ok) {
                this.showToast('Ruta agregada exitosamente', 'success');
                this.closeModal();
                this.loadRoutes();
            } else {
                const error = await response.json();
                this.showToast(error.error || 'Error agregando ruta', 'error');
            }
        } catch (error) {
            console.error('Error adding route:', error);
            this.showToast('Error agregando ruta', 'error');
        }
    }

    // === SCHEDULES MANAGEMENT ===
    async loadSchedules() {
        try {
            const schedules = await this.fetchData('/api/schedules');
            this.data.schedules = schedules;
            this.renderSchedulesTable(schedules);
        } catch (error) {
            console.error('Error loading schedules:', error);
            this.showToast('Error cargando horarios', 'error');
        }
    }

    renderSchedulesTable(schedules) {
        const tbody = document.getElementById('schedulesTableBody');
        tbody.innerHTML = schedules.map(schedule => `
            <tr>
                <td>${schedule.id}</td>
                <td>${schedule.origin} → ${schedule.destination}</td>
                <td>Bus ${schedule.bus_number}</td>
                <td>${this.formatDate(schedule.departure_date)}</td>
                <td>${schedule.departure_time}</td>
                <td>${schedule.available_seats}</td>
                <td>€${schedule.price}</td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn edit" onclick="adminPanel.editSchedule(${schedule.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete" onclick="adminPanel.deleteSchedule(${schedule.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    // === RESERVATIONS MANAGEMENT ===
    async loadReservations() {
        try {
            const reservations = await this.fetchData('/api/reservations');
            this.data.reservations = reservations;
            this.renderReservationsTable(reservations);
        } catch (error) {
            console.error('Error loading reservations:', error);
            this.showToast('Error cargando reservas', 'error');
        }
    }

    renderReservationsTable(reservations) {
        const tbody = document.getElementById('reservationsTableBody');
        tbody.innerHTML = reservations.map(reservation => `
            <tr>
                <td>${reservation.id}</td>
                <td>${reservation.user_name || 'N/A'}</td>
                <td>${reservation.origin} → ${reservation.destination}</td>
                <td>${this.formatDate(reservation.departure_date)}</td>
                <td>${reservation.seat_number || 'N/A'}</td>
                <td>€${reservation.total_price}</td>
                <td>
                    <span class="status-badge ${reservation.status}">${this.getStatusLabel(reservation.status)}</span>
                </td>
                <td>
                    <div class="action-buttons">
                        ${reservation.status === 'confirmada' ? 
                            `<button class="action-btn delete" onclick="adminPanel.cancelReservation(${reservation.id})">
                                <i class="fas fa-times"></i>
                            </button>` : ''
                        }
                    </div>
                </td>
            </tr>
        `).join('');
    }

    filterReservations() {
        const status = document.getElementById('reservationStatus').value;
        let filteredReservations = this.data.reservations;
        
        if (status) {
            filteredReservations = filteredReservations.filter(r => r.status === status);
        }
        
        this.renderReservationsTable(filteredReservations);
    }

    async cancelReservation(reservationId) {
        if (!confirm('¿Estás seguro de cancelar esta reserva?')) return;

        try {
            const response = await fetch(`/api/reservations/${reservationId}/cancel`, {
                method: 'PUT'
            });

            if (response.ok) {
                this.showToast('Reserva cancelada exitosamente', 'success');
                this.loadReservations();
            } else {
                this.showToast('Error cancelando reserva', 'error');
            }
        } catch (error) {
            console.error('Error cancelling reservation:', error);
            this.showToast('Error cancelando reserva', 'error');
        }
    }

    // === ANALYTICS ===
    async loadAnalytics() {
        try {
            const popularRoutes = await this.fetchData('/api/analytics/popular-routes');
            this.renderPopularRoutes(popularRoutes);
            this.updateAnalyticsCharts();
        } catch (error) {
            console.error('Error loading analytics:', error);
            this.showToast('Error cargando analytics', 'error');
        }
    }

    renderPopularRoutes(routes) {
        const container = document.getElementById('popularRoutes');
        container.innerHTML = routes.map(route => `
            <div class="route-item">
                <div class="route-info">${route.origin} → ${route.destination}</div>
                <div class="route-count">${route.bookings} viajes</div>
            </div>
        `).join('');
    }

    // === CHARTS ===
    initializeCharts() {
        // Reservations Chart
        const reservationsCtx = document.getElementById('reservationsChart');
        if (reservationsCtx) {
            this.charts.reservations = new Chart(reservationsCtx, {
                type: 'line',
                data: {
                    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
                    datasets: [{
                        label: 'Reservas',
                        data: [65, 59, 80, 81, 56, 55],
                        borderColor: 'rgb(59, 130, 246)',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }
    }

    updateAnalyticsCharts() {
        // Update charts with real data
        // This would be implemented with actual data from the API
    }

    // === UTILITIES ===
    async fetchData(url) {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    }

    showModal(title, content) {
        document.getElementById('modalTitle').textContent = title;
        document.getElementById('modalBody').innerHTML = content;
        document.getElementById('modalOverlay').classList.add('active');
    }

    closeModal() {
        document.getElementById('modalOverlay').classList.remove('active');
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };

        toast.innerHTML = `
            <div class="toast-icon">
                <i class="${icons[type]}"></i>
            </div>
            <div class="toast-content">
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;

        document.getElementById('toastContainer').appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 5000);
    }

    formatDate(dateString) {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES');
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

    getStatusLabel(status) {
        const labels = {
            confirmada: 'Confirmada',
            pendiente: 'Pendiente',
            cancelada: 'Cancelada'
        };
        return labels[status] || status;
    }

    exportReport() {
        this.showToast('Exportando reporte...', 'info');
        // Implement export functionality
    }
}

// Initialize admin panel
const adminPanel = new AdminPanel();

// Make it globally available
window.adminPanel = adminPanel;