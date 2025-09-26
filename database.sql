-- Script SQL para crear la base de datos completa del sistema de reserva de autobuses

-- Crear base de datos
CREATE DATABASE IF NOT EXISTS bus_reservation;
USE bus_reservation;

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de autobuses
CREATE TABLE IF NOT EXISTS buses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    number VARCHAR(20) UNIQUE NOT NULL,
    capacity INT NOT NULL,
    type ENUM('economico', 'ejecutivo', 'premium') DEFAULT 'economico',
    status ENUM('activo', 'mantenimiento', 'inactivo') DEFAULT 'activo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de rutas
CREATE TABLE IF NOT EXISTS routes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    origin VARCHAR(100) NOT NULL,
    destination VARCHAR(100) NOT NULL,
    distance_km INT,
    duration_hours DECIMAL(3,1),
    price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_origin_destination (origin, destination)
);

-- Tabla de horarios
CREATE TABLE IF NOT EXISTS schedules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bus_id INT NOT NULL,
    route_id INT NOT NULL,
    departure_time TIME NOT NULL,
    arrival_time TIME NOT NULL,
    departure_date DATE NOT NULL,
    available_seats INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (bus_id) REFERENCES buses(id) ON DELETE CASCADE,
    FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE CASCADE,
    INDEX idx_departure_date (departure_date),
    INDEX idx_route_date (route_id, departure_date)
);

-- Tabla de reservas
CREATE TABLE IF NOT EXISTS reservations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    schedule_id INT NOT NULL,
    seat_number INT NOT NULL,
    status ENUM('confirmada', 'cancelada', 'pendiente') DEFAULT 'pendiente',
    total_price DECIMAL(10,2) NOT NULL,
    reservation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (schedule_id) REFERENCES schedules(id) ON DELETE CASCADE,
    UNIQUE KEY unique_seat_schedule (schedule_id, seat_number),
    INDEX idx_user_reservations (user_id),
    INDEX idx_schedule_reservations (schedule_id)
);

-- Datos de ejemplo
INSERT IGNORE INTO buses (number, capacity, type, status) VALUES 
('BUS001', 40, 'economico', 'activo'),
('BUS002', 35, 'ejecutivo', 'activo'),
('BUS003', 30, 'premium', 'activo'),
('BUS004', 45, 'economico', 'activo'),
('BUS005', 32, 'ejecutivo', 'mantenimiento');

INSERT IGNORE INTO routes (origin, destination, distance_km, duration_hours, price) VALUES 
('Madrid', 'Barcelona', 620, 6.5, 45.00),
('Madrid', 'Valencia', 350, 3.5, 30.00),
('Barcelona', 'Sevilla', 900, 9.0, 65.00),
('Madrid', 'Sevilla', 530, 5.5, 40.00),
('Valencia', 'Barcelona', 350, 3.5, 28.00),
('Barcelona', 'Madrid', 620, 6.5, 45.00),
('Sevilla', 'Madrid', 530, 5.5, 40.00),
('Valencia', 'Madrid', 350, 3.5, 30.00);

-- Horarios para los próximos días
INSERT IGNORE INTO schedules (bus_id, route_id, departure_time, arrival_time, departure_date, available_seats) VALUES 
-- Hoy
(1, 1, '08:00:00', '14:30:00', CURDATE(), 40),
(2, 2, '10:00:00', '13:30:00', CURDATE(), 35),
(3, 3, '22:00:00', '07:00:00', DATE_ADD(CURDATE(), INTERVAL 1 DAY), 30),
(4, 4, '09:00:00', '14:30:00', CURDATE(), 45),

-- Mañana
(1, 6, '08:00:00', '14:30:00', DATE_ADD(CURDATE(), INTERVAL 1 DAY), 40),
(2, 8, '10:00:00', '13:30:00', DATE_ADD(CURDATE(), INTERVAL 1 DAY), 35),
(3, 7, '15:00:00', '20:30:00', DATE_ADD(CURDATE(), INTERVAL 1 DAY), 30),
(4, 5, '11:00:00', '14:30:00', DATE_ADD(CURDATE(), INTERVAL 1 DAY), 45),

-- Pasado mañana
(1, 1, '08:00:00', '14:30:00', DATE_ADD(CURDATE(), INTERVAL 2 DAY), 40),
(2, 2, '10:00:00', '13:30:00', DATE_ADD(CURDATE(), INTERVAL 2 DAY), 35),
(3, 3, '22:00:00', '07:00:00', DATE_ADD(CURDATE(), INTERVAL 3 DAY), 30),
(4, 4, '16:00:00', '21:30:00', DATE_ADD(CURDATE(), INTERVAL 2 DAY), 45);

-- Usuarios de ejemplo
INSERT IGNORE INTO users (name, email, phone) VALUES 
('Juan Pérez', 'juan@email.com', '+34 600 123 456'),
('María García', 'maria@email.com', '+34 600 234 567'),
('Carlos López', 'carlos@email.com', '+34 600 345 678'),
('Ana Martín', 'ana@email.com', '+34 600 456 789');

-- Reservas de ejemplo
INSERT IGNORE INTO reservations (user_id, schedule_id, seat_number, status, total_price) VALUES 
(1, 1, 15, 'confirmada', 45.00),
(2, 2, 8, 'confirmada', 30.00),
(3, 4, 22, 'confirmada', 40.00),
(4, 1, 10, 'confirmada', 45.00);

-- Actualizar asientos disponibles después de las reservas
UPDATE schedules SET available_seats = available_seats - 1 WHERE id IN (1, 2, 4);

-- Vistas útiles para reportes
CREATE OR REPLACE VIEW reservation_details AS
SELECT 
    r.id as reservation_id,
    u.name as user_name,
    u.email as user_email,
    u.phone as user_phone,
    rt.origin,
    rt.destination,
    s.departure_date,
    s.departure_time,
    s.arrival_time,
    b.number as bus_number,
    b.type as bus_type,
    r.seat_number,
    r.status,
    r.total_price,
    r.reservation_date
FROM reservations r
JOIN users u ON r.user_id = u.id
JOIN schedules s ON r.schedule_id = s.id
JOIN routes rt ON s.route_id = rt.id
JOIN buses b ON s.bus_id = b.id;

CREATE OR REPLACE VIEW daily_stats AS
SELECT 
    DATE(reservation_date) as date,
    COUNT(*) as total_reservations,
    SUM(CASE WHEN status = 'confirmada' THEN 1 ELSE 0 END) as confirmed_reservations,
    SUM(CASE WHEN status = 'cancelada' THEN 1 ELSE 0 END) as cancelled_reservations,
    SUM(CASE WHEN status = 'confirmada' THEN total_price ELSE 0 END) as daily_revenue
FROM reservations
GROUP BY DATE(reservation_date)
ORDER BY date DESC;

-- Índices adicionales para optimización
CREATE INDEX idx_reservations_date ON reservations(reservation_date);
CREATE INDEX idx_schedules_bus_date ON schedules(bus_id, departure_date);
CREATE INDEX idx_users_email ON users(email);

-- Procedimientos almacenados útiles
DELIMITER //

CREATE PROCEDURE GetAvailableTrips(
    IN p_origin VARCHAR(100),
    IN p_destination VARCHAR(100),
    IN p_date DATE
)
BEGIN
    SELECT 
        s.id,
        s.departure_time,
        s.arrival_time,
        s.available_seats,
        r.origin,
        r.destination,
        r.price,
        b.number as bus_number,
        b.type as bus_type
    FROM schedules s
    JOIN routes r ON s.route_id = r.id
    JOIN buses b ON s.bus_id = b.id
    WHERE r.origin LIKE CONCAT('%', p_origin, '%')
    AND r.destination LIKE CONCAT('%', p_destination, '%')
    AND s.departure_date = p_date
    AND s.available_seats > 0
    AND b.status = 'activo'
    ORDER BY s.departure_time;
END //

CREATE PROCEDURE GetUserReservations(IN p_user_id INT)
BEGIN
    SELECT * FROM reservation_details 
    WHERE user_id = p_user_id 
    ORDER BY departure_date DESC, departure_time DESC;
END //

DELIMITER ;

-- Triggers para mantener integridad
DELIMITER //

CREATE TRIGGER update_available_seats_after_reservation
AFTER INSERT ON reservations
FOR EACH ROW
BEGIN
    IF NEW.status = 'confirmada' THEN
        UPDATE schedules 
        SET available_seats = available_seats - 1 
        WHERE id = NEW.schedule_id;
    END IF;
END //

CREATE TRIGGER update_available_seats_after_cancellation
AFTER UPDATE ON reservations
FOR EACH ROW
BEGIN
    IF OLD.status = 'confirmada' AND NEW.status = 'cancelada' THEN
        UPDATE schedules 
        SET available_seats = available_seats + 1 
        WHERE id = NEW.schedule_id;
    END IF;
END //

DELIMITER ;

-- Comentarios finales
-- Este script crea una base de datos completa para el sistema de reserva de autobuses
-- Incluye todas las tablas necesarias, datos de ejemplo, vistas, procedimientos y triggers
-- Para ejecutar: mysql -u root -p < database.sql