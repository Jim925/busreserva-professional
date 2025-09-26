# 🔒 Política de Seguridad

## Versiones Soportadas

| Versión | Soporte |
| ------- | ------- |
| 1.0.x   | ✅ |

## Reportar Vulnerabilidades

Si encuentras una vulnerabilidad de seguridad, por favor NO la reportes públicamente. En su lugar:

### 📧 Contacto Privado
- Email: security@busreserva.com
- Asunto: [SECURITY] Descripción breve

### 📋 Información a Incluir
- Descripción detallada de la vulnerabilidad
- Pasos para reproducir el problema
- Impacto potencial
- Versión afectada
- Cualquier información adicional relevante

### ⏱️ Tiempo de Respuesta
- Confirmación inicial: 24 horas
- Evaluación completa: 72 horas
- Resolución: Según criticidad

### 🛡️ Medidas de Seguridad Implementadas

#### Autenticación
- Hashing seguro de contraseñas con bcrypt
- Validación de entrada en todos los endpoints
- Protección contra inyección SQL

#### Servidor
- Rate limiting para prevenir ataques DDoS
- Headers de seguridad con Helmet
- Validación de datos con express-validator

#### Base de Datos
- Consultas preparadas para prevenir SQL injection
- Conexiones seguras con pool de conexiones
- Backup automático de datos

### 🚨 Vulnerabilidades Conocidas
Actualmente no hay vulnerabilidades conocidas.

### 📜 Historial de Seguridad
- 2024-12-19: Implementación inicial de medidas de seguridad