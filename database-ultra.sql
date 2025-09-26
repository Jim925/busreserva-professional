-- BusReserva Ultra - Base de Datos de Nueva Generación
-- =====================================================

DROP DATABASE IF EXISTS bus_reservation_ultra;
CREATE DATABASE bus_reservation_ultra CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE bus_reservation_ultra;

-- Tabla de usuarios con campos avanzados
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    date_of_birth DATE,
    gender ENUM('M', 'F', 'Other'),
    profile_image VARCHAR(255),
    role ENUM('user', 'admin', 'driver', 'operator') DEFAULT 'user',
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    preferences JSON,
    loyalty_points INT DEFAULT 0,
    total_trips INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    status ENUM('active', 'suspended', 'deleted') DEFAULT 'active',
    INDEX idx_email (email),
    INDEX idx_status (status),
    INDEX idx_role (role)
);

-- Tabla de autobuses mejorada
CREATE TABLE buses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    number VARCHAR(20) UNIQUE NOT NULL,
    type ENUM('economico', 'ejecutivo', 'premium', 'vip') DEFAULT 'economico',
    capacity INT NOT NULL DEFAULT 50,
    amenities JSON,
    features JSON,
    year_manufactured YEAR,
    license_plate VARCHAR(20) UNIQUE,
    insurance_expiry DATE,
    last_maintenance DATE,
    next_maintenance DATE,
    fuel_type ENUM('diesel', 'gas', 'electric', 'hybrid') DEFAULT 'diesel',
    emissions_rating VARCHAR(10),
    wifi_available BOOLEAN DEFAULT FALSE,
    ac_available BOOLEAN DEFAULT TRUE,
    restroom_available BOOLEAN DEFAULT FALSE,
    entertainment_system BOOLEAN DEFAULT FALSE,
    gps_tracking BOOLEAN DEFAULT TRUE,
    status ENUM('active', 'maintenance', 'retired') DEFAULT 'active',
    driver_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_type (type)
);

-- Tabla de rutas expandida
CREATE TABLE routes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    origin VARCHAR(100) NOT NULL,
    destination VARCHAR(100) NOT NULL,
    distance DECIMAL(8,2),
    duration TIME,
    price DECIMAL(10,2) NOT NULL,
    base_price DECIMAL(10,2) NOT NULL,
    dynamic_pricing BOOLEAN DEFAULT TRUE,
    stops JSON,
    route_map_url VARCHAR(500),
    difficulty_level ENUM('easy', 'medium', 'hard') DEFAULT 'easy',
    scenic_rating TINYINT DEFAULT 0,
    traffic_level ENUM('low', 'medium', 'high') DEFAULT 'medium',
    toll_cost DECIMAL(8,2) DEFAULT 0,
    fuel_cost_estimate DECIMAL(8,2),
    carbon_footprint DECIMAL(8,2),
    status ENUM('active', 'seasonal', 'suspended') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_origin_destination (origin, destination),
    INDEX idx_status (status),
    INDEX idx_price (price)
);

-- Tabla de horarios avanzada
CREATE TABLE schedules (
    id INT PRIMARY KEY AUTO_INCREMENT,
    route_id INT NOT NULL,
    bus_id INT NOT NULL,
    departure_date DATE NOT NULL,
    departure_time TIME NOT NULL,
    arrival_time TIME,
    available_seats INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    dynamic_price DECIMAL(10,2),
    weather_factor DECIMAL(3,2) DEFAULT 1.0,
    demand_factor DECIMAL(3,2) DEFAULT 1.0,
    special_event BOOLEAN DEFAULT FALSE,
    driver_id INT,
    co_driver_id INT,
    estimated_arrival DATETIME,
    actual_departure DATETIME,
    actual_arrival DATETIME,
    delay_minutes INT DEFAULT 0,
    cancellation_reason TEXT,
    status ENUM('scheduled', 'boarding', 'departed', 'arrived', 'cancelled', 'delayed') DEFAULT 'scheduled',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE CASCADE,
    FOREIGN KEY (bus_id) REFERENCES buses(id) ON DELETE CASCADE,
    INDEX idx_departure_date (departure_date),
    INDEX idx_route_date (route_id, departure_date),
    INDEX idx_status (status)
);

-- Tabla de reservas mejorada
CREATE TABLE reservations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    schedule_id INT NOT NULL,
    reservation_code VARCHAR(20) UNIQUE NOT NULL,
    passengers INT NOT NULL DEFAULT 1,
    passenger_details JSON,
    total_price DECIMAL(10,2) NOT NULL,
    discount_applied DECIMAL(10,2) DEFAULT 0,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    payment_method ENUM('cash', 'card', 'digital_wallet', 'bank_transfer', 'points') DEFAULT 'cash',
    payment_status ENUM('pending', 'paid', 'refunded', 'failed') DEFAULT 'pending',
    payment_reference VARCHAR(100),
    booking_source ENUM('web', 'mobile', 'phone', 'counter') DEFAULT 'web',
    special_requests TEXT,
    insurance_opted BOOLEAN DEFAULT FALSE,
    meal_preference ENUM('none', 'vegetarian', 'non_vegetarian', 'vegan') DEFAULT 'none',
    contact_preference ENUM('email', 'sms', 'whatsapp') DEFAULT 'email',
    check_in_status ENUM('pending', 'checked_in', 'no_show') DEFAULT 'pending',
    check_in_time TIMESTAMP NULL,
    rating TINYINT,
    review TEXT,
    status ENUM('pending', 'confirmada', 'cancelada', 'completed', 'no_show') DEFAULT 'pending',
    cancellation_reason TEXT,
    refund_amount DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (schedule_id) REFERENCES schedules(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_schedule_id (schedule_id),
    INDEX idx_reservation_code (reservation_code),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);

-- Tabla de asientos de reserva
CREATE TABLE reservation_seats (
    id INT PRIMARY KEY AUTO_INCREMENT,
    reservation_id INT NOT NULL,
    seat_number INT NOT NULL,
    passenger_name VARCHAR(100),
    passenger_age INT,
    passenger_gender ENUM('M', 'F', 'Other'),
    special_needs TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reservation_id) REFERENCES reservations(id) ON DELETE CASCADE,
    UNIQUE KEY unique_reservation_seat (reservation_id, seat_number),
    INDEX idx_reservation_id (reservation_id)
);

-- Tabla de reseñas y calificaciones
CREATE TABLE reviews (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    schedule_id INT NOT NULL,
    reservation_id INT NOT NULL,
    rating TINYINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    service_rating TINYINT,
    comfort_rating TINYINT,
    punctuality_rating TINYINT,
    cleanliness_rating TINYINT,
    driver_rating TINYINT,
    would_recommend BOOLEAN DEFAULT TRUE,
    photos JSON,
    helpful_votes INT DEFAULT 0,
    verified_purchase BOOLEAN DEFAULT TRUE,
    response_from_company TEXT,
    response_date TIMESTAMP NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (schedule_id) REFERENCES schedules(id) ON DELETE CASCADE,
    FOREIGN KEY (reservation_id) REFERENCES reservations(id) ON DELETE CASCADE,
    INDEX idx_schedule_rating (schedule_id, rating),
    INDEX idx_user_id (user_id),
    INDEX idx_status (status)
);

-- Tabla de alertas de precio
CREATE TABLE price_alerts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    route_id INT NOT NULL,
    target_price DECIMAL(10,2) NOT NULL,
    current_price DECIMAL(10,2),
    alert_type ENUM('below', 'above', 'change') DEFAULT 'below',
    is_active BOOLEAN DEFAULT TRUE,
    notification_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE CASCADE,
    INDEX idx_user_route (user_id, route_id),
    INDEX idx_active (is_active)
);

-- Tabla de promociones y descuentos
CREATE TABLE promotions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    discount_type ENUM('percentage', 'fixed', 'bogo') NOT NULL,
    discount_value DECIMAL(10,2) NOT NULL,
    min_purchase_amount DECIMAL(10,2) DEFAULT 0,
    max_discount_amount DECIMAL(10,2),
    usage_limit INT,
    usage_count INT DEFAULT 0,
    user_usage_limit INT DEFAULT 1,
    applicable_routes JSON,
    applicable_user_types JSON,
    start_date DATETIME NOT NULL,
    end_date DATETIME NOT NULL,
    terms_conditions TEXT,
    status ENUM('active', 'inactive', 'expired') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_code (code),
    INDEX idx_status_dates (status, start_date, end_date)
);

-- Tabla de uso de promociones
CREATE TABLE promotion_usage (
    id INT PRIMARY KEY AUTO_INCREMENT,
    promotion_id INT NOT NULL,
    user_id INT NOT NULL,
    reservation_id INT NOT NULL,
    discount_amount DECIMAL(10,2) NOT NULL,
    used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (promotion_id) REFERENCES promotions(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reservation_id) REFERENCES reservations(id) ON DELETE CASCADE,
    INDEX idx_promotion_user (promotion_id, user_id)
);

-- Tabla de notificaciones
CREATE TABLE notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    type ENUM('booking', 'payment', 'schedule_change', 'promotion', 'reminder', 'system') NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    data JSON,
    is_read BOOLEAN DEFAULT FALSE,
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    delivery_method ENUM('in_app', 'email', 'sms', 'push') DEFAULT 'in_app',
    scheduled_for TIMESTAMP NULL,
    sent_at TIMESTAMP NULL,
    read_at TIMESTAMP NULL,
    expires_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_unread (user_id, is_read),
    INDEX idx_type (type),
    INDEX idx_priority (priority)
);

-- Tabla de configuración del sistema
CREATE TABLE system_config (
    id INT PRIMARY KEY AUTO_INCREMENT,
    config_key VARCHAR(100) UNIQUE NOT NULL,
    config_value TEXT,
    data_type ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    updated_by INT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_key (config_key),
    INDEX idx_public (is_public)
);

-- Tabla de logs del sistema
CREATE TABLE system_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    level ENUM('info', 'warning', 'error', 'critical') NOT NULL,
    category VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    data JSON,
    user_id INT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_level_category (level, category),
    INDEX idx_created_at (created_at),
    INDEX idx_user_id (user_id)
);

-- =====================================================
-- VISTAS PARA CONSULTAS OPTIMIZADAS
-- =====================================================

-- Vista de horarios con información completa
CREATE VIEW schedule_details AS
SELECT 
    s.id,
    s.departure_date,
    s.departure_time,
    s.arrival_time,
    s.available_seats,
    s.price,
    s.status as schedule_status,
    r.origin,
    r.destination,
    r.distance,
    r.duration,
    b.number as bus_number,
    b.type as bus_type,
    b.amenities,
    b.capacity,
    (b.capacity - s.available_seats) as occupied_seats,
    ROUND((b.capacity - s.available_seats) / b.capacity * 100, 2) as occupancy_rate
FROM schedules s
JOIN routes r ON s.route_id = r.id
JOIN buses b ON s.bus_id = b.id
WHERE s.status = 'scheduled';

-- Vista de estadísticas de reservas
CREATE VIEW reservation_stats AS
SELECT 
    DATE(r.created_at) as date,
    COUNT(*) as total_reservations,
    SUM(r.total_price) as total_revenue,
    AVG(r.total_price) as avg_booking_value,
    COUNT(DISTINCT r.user_id) as unique_customers,
    SUM(r.passengers) as total_passengers
FROM reservations r
WHERE r.status = 'confirmada'
GROUP BY DATE(r.created_at);

-- Vista de rutas populares
CREATE VIEW popular_routes AS
SELECT 
    rt.id,
    rt.origin,
    rt.destination,
    COUNT(res.id) as total_bookings,
    SUM(res.total_price) as total_revenue,
    AVG(res.total_price) as avg_price,
    AVG(rev.rating) as avg_rating,
    COUNT(rev.id) as total_reviews
FROM routes rt
LEFT JOIN schedules s ON rt.id = s.route_id
LEFT JOIN reservations res ON s.id = res.schedule_id AND res.status = 'confirmada'
LEFT JOIN reviews rev ON s.id = rev.schedule_id
GROUP BY rt.id, rt.origin, rt.destination;

-- =====================================================
-- PROCEDIMIENTOS ALMACENADOS
-- =====================================================

DELIMITER //

-- Procedimiento para búsqueda inteligente
CREATE PROCEDURE SearchSchedules(
    IN p_origin VARCHAR(100),
    IN p_destination VARCHAR(100),
    IN p_date DATE,
    IN p_passengers INT,
    IN p_flexible BOOLEAN
)
BEGIN
    DECLARE date_condition VARCHAR(200);
    
    IF p_flexible THEN
        SET date_condition = CONCAT('s.departure_date BETWEEN "', p_date, '" AND DATE_ADD("', p_date, '", INTERVAL 3 DAY)');
    ELSE
        SET date_condition = CONCAT('DATE(s.departure_date) = "', p_date, '"');
    END IF;
    
    SET @sql = CONCAT('
        SELECT 
            s.id, s.departure_time, s.departure_date, s.available_seats, s.price,
            r.origin, r.destination, r.duration, r.distance,
            b.number as bus_number, b.type as bus_type, b.amenities,
            CASE 
                WHEN s.available_seats < 5 THEN "low"
                WHEN s.available_seats < 15 THEN "medium"
                ELSE "high"
            END as availability_level,
            (SELECT AVG(rating) FROM reviews WHERE schedule_id = s.id) as avg_rating,
            (SELECT COUNT(*) FROM reservations WHERE schedule_id = s.id AND status = "confirmada") as total_bookings
        FROM schedules s
        JOIN routes r ON s.route_id = r.id
        JOIN buses b ON s.bus_id = b.id
        WHERE r.origin = "', p_origin, '" AND r.destination = "', p_destination, '"
        AND ', date_condition, '
        AND s.available_seats >= ', p_passengers, '
        AND s.departure_date >= CURDATE()
        ORDER BY s.departure_date, s.departure_time
    ');
    
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
END //

-- Procedimiento para calcular precio dinámico
CREATE PROCEDURE CalculateDynamicPrice(
    IN p_schedule_id INT,
    OUT p_dynamic_price DECIMAL(10,2)
)
BEGIN
    DECLARE base_price DECIMAL(10,2);
    DECLARE demand_factor DECIMAL(3,2) DEFAULT 1.0;
    DECLARE availability_factor DECIMAL(3,2) DEFAULT 1.0;
    DECLARE time_factor DECIMAL(3,2) DEFAULT 1.0;
    DECLARE available_seats INT;
    DECLARE total_capacity INT;
    DECLARE days_until_departure INT;
    DECLARE recent_bookings INT;
    
    -- Obtener información básica
    SELECT s.price, s.available_seats, b.capacity,
           DATEDIFF(s.departure_date, CURDATE())
    INTO base_price, available_seats, total_capacity, days_until_departure
    FROM schedules s
    JOIN buses b ON s.bus_id = b.id
    WHERE s.id = p_schedule_id;
    
    -- Calcular factor de disponibilidad
    SET availability_factor = CASE
        WHEN available_seats / total_capacity < 0.2 THEN 1.3
        WHEN available_seats / total_capacity < 0.5 THEN 1.15
        ELSE 1.0
    END;
    
    -- Calcular factor de tiempo
    SET time_factor = CASE
        WHEN days_until_departure <= 1 THEN 1.2
        WHEN days_until_departure <= 3 THEN 1.1
        WHEN days_until_departure <= 7 THEN 1.05
        ELSE 1.0
    END;
    
    -- Calcular factor de demanda
    SELECT COUNT(*) INTO recent_bookings
    FROM reservations r
    JOIN schedules s ON r.schedule_id = s.id
    WHERE s.route_id = (SELECT route_id FROM schedules WHERE id = p_schedule_id)
    AND r.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
    AND r.status = 'confirmada';
    
    SET demand_factor = CASE
        WHEN recent_bookings > 20 THEN 1.2
        WHEN recent_bookings > 10 THEN 1.1
        ELSE 1.0
    END;
    
    -- Calcular precio final
    SET p_dynamic_price = base_price * demand_factor * availability_factor * time_factor;
END //

DELIMITER ;

-- =====================================================
-- TRIGGERS PARA AUTOMATIZACIÓN
-- =====================================================

-- Trigger para actualizar puntos de lealtad
DELIMITER //
CREATE TRIGGER update_loyalty_points
AFTER UPDATE ON reservations
FOR EACH ROW
BEGIN
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        UPDATE users 
        SET loyalty_points = loyalty_points + FLOOR(NEW.total_price / 10),
            total_trips = total_trips + 1
        WHERE id = NEW.user_id;
    END IF;
END //
DELIMITER ;

-- Trigger para log de cambios importantes
DELIMITER //
CREATE TRIGGER log_reservation_changes
AFTER UPDATE ON reservations
FOR EACH ROW
BEGIN
    IF OLD.status != NEW.status THEN
        INSERT INTO system_logs (level, category, message, data, user_id)
        VALUES ('info', 'reservation', 
                CONCAT('Reservation status changed from ', OLD.status, ' to ', NEW.status),
                JSON_OBJECT('reservation_id', NEW.id, 'old_status', OLD.status, 'new_status', NEW.status),
                NEW.user_id);
    END IF;
END //
DELIMITER ;

-- =====================================================
-- DATOS DE EJEMPLO MEJORADOS
-- =====================================================

-- Insertar configuración del sistema
INSERT INTO system_config (config_key, config_value, data_type, description, is_public) VALUES
('site_name', 'BusReserva Ultra', 'string', 'Nombre del sitio web', true),
('max_advance_booking_days', '90', 'number', 'Días máximos para reserva anticipada', true),
('cancellation_fee_percentage', '10', 'number', 'Porcentaje de tarifa de cancelación', true),
('loyalty_points_rate', '10', 'number', 'Puntos por cada peso gastado', false),
('dynamic_pricing_enabled', 'true', 'boolean', 'Habilitar precios dinámicos', false);

-- Insertar usuarios de ejemplo
INSERT INTO users (name, email, password, phone, role, email_verified, preferences) VALUES
('Admin Ultra', 'admin@busreserva.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qm', '+1234567890', 'admin', true, '{"notifications": true, "language": "es"}'),
('Juan Pérez', 'juan@email.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qm', '+1234567891', 'user', true, '{"seat_preference": "window", "meal": "vegetarian"}'),
('María García', 'maria@email.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qm', '+1234567892', 'user', true, '{"notifications": true, "language": "es"}'),
('Carlos López', 'carlos@email.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qm', '+1234567893', 'user', true, '{"seat_preference": "aisle"}');

-- Insertar autobuses mejorados
INSERT INTO buses (number, type, capacity, amenities, features, year_manufactured, license_plate, wifi_available, ac_available, restroom_available, entertainment_system) VALUES
('BUS-001', 'vip', 40, '["WiFi", "AC", "Baño", "Entretenimiento", "Asientos reclinables", "USB"]', '["GPS", "Cámaras de seguridad", "Sistema de audio"]', 2023, 'ABC-123', true, true, true, true),
('BUS-002', 'premium', 45, '["WiFi", "AC", "USB", "Asientos cómodos"]', '["GPS", "Sistema de audio"]', 2022, 'DEF-456', true, true, false, false),
('BUS-003', 'ejecutivo', 50, '["AC", "USB"]', '["GPS"]', 2021, 'GHI-789', false, true, false, false),
('BUS-004', 'economico', 55, '["AC"]', '["GPS"]', 2020, 'JKL-012', false, true, false, false);

-- Insertar rutas mejoradas
INSERT INTO routes (origin, destination, distance, duration, price, base_price, stops, scenic_rating, traffic_level) VALUES
('Madrid', 'Barcelona', 621.50, '06:30:00', 45.00, 40.00, '["Zaragoza", "Lleida"]', 4, 'medium'),
('Barcelona', 'Valencia', 349.20, '03:45:00', 32.00, 28.00, '["Tarragona", "Castellón"]', 5, 'low'),
('Madrid', 'Sevilla', 534.80, '05:15:00', 38.00, 35.00, '["Córdoba"]', 3, 'medium'),
('Valencia', 'Alicante', 166.30, '02:00:00', 22.00, 20.00, '[]', 4, 'low'),
('Madrid', 'Bilbao', 395.70, '04:30:00', 35.00, 32.00, '["Burgos", "Vitoria"]', 3, 'high');

-- Insertar horarios
INSERT INTO schedules (route_id, bus_id, departure_date, departure_time, arrival_time, available_seats, price) VALUES
(1, 1, '2024-12-20', '08:00:00', '14:30:00', 35, 45.00),
(1, 2, '2024-12-20', '15:00:00', '21:30:00', 40, 42.00),
(2, 3, '2024-12-20', '09:30:00', '13:15:00', 45, 32.00),
(3, 4, '2024-12-21', '07:00:00', '12:15:00', 50, 38.00),
(4, 2, '2024-12-21', '16:00:00', '18:00:00', 42, 22.00);

-- Insertar promociones
INSERT INTO promotions (code, title, description, discount_type, discount_value, min_purchase_amount, start_date, end_date, status) VALUES
('WELCOME20', 'Bienvenida 20%', 'Descuento del 20% para nuevos usuarios', 'percentage', 20.00, 30.00, '2024-12-01 00:00:00', '2024-12-31 23:59:59', 'active'),
('EARLY50', 'Madrugador', 'Descuento fijo para viajes antes de las 8 AM', 'fixed', 5.00, 0.00, '2024-12-01 00:00:00', '2024-12-31 23:59:59', 'active'),
('WEEKEND15', 'Fin de Semana', '15% de descuento en viajes de fin de semana', 'percentage', 15.00, 25.00, '2024-12-01 00:00:00', '2024-12-31 23:59:59', 'active');

-- Insertar reservas de ejemplo
INSERT INTO reservations (user_id, schedule_id, reservation_code, passengers, total_price, payment_status, status) VALUES
(2, 1, 'BR20241201001', 2, 90.00, 'paid', 'confirmada'),
(3, 2, 'BR20241201002', 1, 42.00, 'paid', 'confirmada'),
(4, 3, 'BR20241201003', 3, 96.00, 'pending', 'pending');

-- Insertar asientos de reserva
INSERT INTO reservation_seats (reservation_id, seat_number, passenger_name) VALUES
(1, 15, 'Juan Pérez'),
(1, 16, 'Ana Pérez'),
(2, 8, 'María García'),
(3, 20, 'Carlos López'),
(3, 21, 'Elena López'),
(3, 22, 'Pedro López');

-- Insertar reseñas
INSERT INTO reviews (user_id, schedule_id, reservation_id, rating, review_text, service_rating, comfort_rating, punctuality_rating) VALUES
(2, 1, 1, 5, 'Excelente servicio, muy cómodo y puntual', 5, 5, 5),
(3, 2, 2, 4, 'Buen viaje, aunque el autobús llegó con un poco de retraso', 4, 4, 3);

-- Actualizar asientos disponibles
UPDATE schedules SET available_seats = available_seats - 2 WHERE id = 1;
UPDATE schedules SET available_seats = available_seats - 1 WHERE id = 2;
UPDATE schedules SET available_seats = available_seats - 3 WHERE id = 3;

-- =====================================================
-- ÍNDICES ADICIONALES PARA OPTIMIZACIÓN
-- =====================================================

CREATE INDEX idx_reservations_date_status ON reservations(created_at, status);
CREATE INDEX idx_schedules_route_date ON schedules(route_id, departure_date, status);
CREATE INDEX idx_users_email_status ON users(email, status);
CREATE INDEX idx_reviews_schedule_rating ON reviews(schedule_id, rating, status);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read, created_at);

-- =====================================================
-- CONFIGURACIÓN FINAL
-- =====================================================

-- Configurar zona horaria
SET time_zone = '+00:00';

-- Habilitar el log de consultas lentas
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 2;

SELECT 'Base de datos BusReserva Ultra inicializada correctamente' as status;