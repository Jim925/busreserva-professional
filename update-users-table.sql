-- Actualizar tabla de usuarios para autenticación
USE bus_reservation;

ALTER TABLE users 
ADD COLUMN password VARCHAR(255),
ADD COLUMN google_id VARCHAR(255),
ADD COLUMN profile_picture VARCHAR(500),
ADD COLUMN is_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN last_login TIMESTAMP NULL;

-- Crear índice para google_id
CREATE INDEX idx_google_id ON users(google_id);