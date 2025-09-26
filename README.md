# 🚌 Sistema de Reserva de Autobuses

Sistema completo de gestión y reserva de autobuses con interfaz web moderna y base de datos MySQL.

## 🚀 Características

- **Búsqueda de viajes** por origen, destino y fecha
- **Registro de usuarios** con validación
- **Sistema de reservas** en tiempo real
- **Panel de administración** completo
- **Gestión de autobuses, rutas y horarios**
- **Estadísticas y reportes**
- **Interfaz responsive** y moderna

## 📋 Requisitos

- Node.js 14+
- MySQL 5.7+
- Navegador web moderno

## ⚡ Instalación Rápida

1. **Instalar dependencias:**
```bash
npm install
```

2. **Configurar MySQL:**
   - Crear base de datos: `bus_reservation`
   - Ajustar credenciales en `server.js` si es necesario

3. **Iniciar servidor:**
```bash
npm start
```

4. **Inicializar base de datos:**
   - Visitar: http://localhost:3000/init-db

## 🌐 URLs del Sistema

- **Principal:** http://localhost:3000
- **Admin:** http://localhost:3000/admin.html
- **Inicializar BD:** http://localhost:3000/init-db

## 📊 Estructura de Base de Datos

### Tablas Principales:
- `users` - Usuarios del sistema
- `buses` - Flota de autobuses
- `routes` - Rutas disponibles
- `schedules` - Horarios programados
- `reservations` - Reservas realizadas

## 🎯 Funcionalidades

### Para Usuarios:
- Buscar viajes disponibles
- Registrarse en el sistema
- Hacer reservas
- Ver historial de reservas

### Para Administradores:
- Gestionar autobuses
- Crear y modificar rutas
- Programar horarios
- Ver estadísticas del sistema
- Gestionar reservas

## 🔧 API Endpoints

### Usuarios
- `GET /api/users` - Listar usuarios
- `POST /api/users` - Crear usuario

### Búsqueda
- `GET /api/search` - Buscar viajes

### Reservas
- `POST /api/reservations` - Crear reserva
- `GET /api/reservations/:userId` - Ver reservas de usuario

### Administración
- `GET /api/admin/stats` - Estadísticas del sistema

## 🎨 Tecnologías

- **Backend:** Node.js + Express
- **Base de datos:** MySQL
- **Frontend:** HTML5 + CSS3 + JavaScript
- **Estilos:** CSS Grid + Flexbox

## 📱 Responsive Design

El sistema está optimizado para:
- 💻 Desktop
- 📱 Móviles
- 📟 Tablets

## 🔒 Características de Seguridad

- Validación de datos
- Prevención de SQL injection
- Manejo de errores robusto
- Códigos de estado HTTP apropiados

## 🚀 Desarrollo

Para desarrollo con auto-reload:
```bash
npm run dev
```

## 📈 Próximas Mejoras

- [ ] Autenticación JWT
- [ ] Pagos en línea
- [ ] Notificaciones email/SMS
- [ ] App móvil
- [ ] Sistema de puntos/descuentos

---

**¡Sistema listo para producción!** 🎉