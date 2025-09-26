# Configuración de Google OAuth

## Pasos para configurar Google OAuth:

### 1. Crear proyecto en Google Cloud Console
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la API de Google+ o Google Identity

### 2. Configurar OAuth 2.0
1. Ve a "Credenciales" en el menú lateral
2. Haz clic en "Crear credenciales" > "ID de cliente OAuth 2.0"
3. Selecciona "Aplicación web"
4. Agrega estas URLs autorizadas:
   - **Orígenes autorizados**: `http://localhost:3000`
   - **URIs de redirección**: `http://localhost:3000/auth/google/callback`

### 3. Obtener credenciales
1. Copia el **Client ID** y **Client Secret**
2. Crea un archivo `.env` en la raíz del proyecto:
   ```
   GOOGLE_CLIENT_ID=tu-client-id-aqui
   GOOGLE_CLIENT_SECRET=tu-client-secret-aqui
   ```

### 4. Instalar dependencia adicional
```bash
npm install dotenv
```

### 5. Actualizar server.js
Agrega al inicio del archivo:
```javascript
require('dotenv').config();
```

## URLs del sistema:
- **Aplicación**: http://localhost:3000
- **Login/Registro**: http://localhost:3000/auth.html
- **Callback Google**: http://localhost:3000/auth/google/callback

## Funcionalidades implementadas:
✅ Registro tradicional con email/contraseña
✅ Login tradicional
✅ Login con Google OAuth
✅ Verificación de tokens JWT
✅ Sesiones persistentes
✅ Menú de usuario
✅ Visualización de reservas
✅ Logout
✅ Protección de rutas