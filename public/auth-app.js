// Gestión de autenticación
class AuthManager {
    constructor() {
        this.baseURL = 'http://localhost:3000';
        this.checkAuthStatus();
    }

    // Mostrar toast
    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = `toast ${type} show`;
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    // Verificar estado de autenticación
    checkAuthStatus() {
        const token = localStorage.getItem('token');
        if (token) {
            this.verifyToken(token);
        }
    }

    // Verificar token
    async verifyToken(token) {
        try {
            const response = await fetch(`${this.baseURL}/auth/verify`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.redirectToApp(data.user);
            } else {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
        } catch (error) {
            console.error('Error verificando token:', error);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
    }

    // Registro
    async register(userData) {
        try {
            const response = await fetch(`${this.baseURL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                this.showToast('¡Cuenta creada exitosamente!');
                setTimeout(() => this.redirectToApp(data.user), 1500);
            } else {
                this.showToast(data.error, 'error');
            }
        } catch (error) {
            this.showToast('Error de conexión', 'error');
        }
    }

    // Login
    async login(credentials) {
        try {
            const response = await fetch(`${this.baseURL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(credentials)
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                this.showToast('¡Bienvenido de vuelta!');
                setTimeout(() => this.redirectToApp(data.user), 1500);
            } else {
                this.showToast(data.error, 'error');
            }
        } catch (error) {
            this.showToast('Error de conexión', 'error');
        }
    }

    // Redireccionar a la aplicación
    redirectToApp(user) {
        window.location.href = '/';
    }
}

// Instancia global
const authManager = new AuthManager();

// Funciones de UI
function showLogin() {
    document.getElementById('loginForm').classList.add('active');
    document.getElementById('registerForm').classList.remove('active');
}

function showRegister() {
    document.getElementById('registerForm').classList.add('active');
    document.getElementById('loginForm').classList.remove('active');
}

// Manejar login
function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    authManager.login({ email, password });
}

// Manejar registro
function handleRegister(event) {
    event.preventDefault();
    
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const phone = document.getElementById('registerPhone').value;
    const password = document.getElementById('registerPassword').value;
    
    if (password.length < 6) {
        authManager.showToast('La contraseña debe tener al menos 6 caracteres', 'error');
        return;
    }
    
    authManager.register({ name, email, phone, password });
}

// Login con Google
function loginWithGoogle() {
    window.location.href = `${authManager.baseURL}/auth/google`;
}

// Verificar parámetros URL (para callback de Google)
window.addEventListener('load', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const user = urlParams.get('user');
    
    if (token && user) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', user);
        authManager.showToast('¡Inicio de sesión exitoso!');
        setTimeout(() => {
            window.location.href = '/';
        }, 1500);
    }
});