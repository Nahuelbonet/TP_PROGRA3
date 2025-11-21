---------------------------------------------------------------------
-- CREAR BASE DE DATOS (solo si no existe)
---------------------------------------------------------------------
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'electronicsStore_db')
BEGIN
    CREATE DATABASE electronicsStore_db;
END;
GO

USE electronicsStore_db;
GO

---------------------------------------------------------------------
-- CREAR TABLA productos (solo si no existe)
---------------------------------------------------------------------
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID('productos') AND type = 'U')
BEGIN
    CREATE TABLE productos (
        id INT IDENTITY(1,1) PRIMARY KEY,
        nombre VARCHAR(100),
        precio DECIMAL(10,2),
        img VARCHAR(255),
        categoria VARCHAR(100)
    );
END;
GO

---------------------------------------------------------------------
-- INSERTAR PRODUCTOS
---------------------------------------------------------------------
INSERT INTO productos (nombre, precio, img, categoria) VALUES
('iPhone 14', 95000, './assets/img/Iphon14.jpg', 'Celulares'),
('Samsung Galaxy S23', 870000, './assets/img/galaxy-s23.jpg', 'Celulares'),
('Motorola Edge 40', 520000, './assets/img/moto-edge40.jpg', 'Celulares'),
('Xiaomi Redmi Note 13', 380000, './assets/img/redminote13.jpg', 'Celulares'),
('iPhone SE (3ra Gen)', 450000, './assets/img/iphon-13promax.jpg', 'Celulares'),
('PlayStation 5', 890000, './assets/img/ps5.jpg', 'Consolas'),
('Xbox Series X', 870000, './assets/img/xbox-seriesx.jpg', 'Consolas'),
('Nintendo Switch OLED', 650000, './assets/img/switch-oled.jpg', 'Consolas'),
('PlayStation 4 Slim', 480000, './assets/img/ps4-slim.jpg', 'Consolas'),
('Xbox Series S', 520000, './assets/img/xbox-seriess.jpg', 'Consolas');
GO

---------------------------------------------------------------------
-- CONSULTA DE VERIFICACIÓN
---------------------------------------------------------------------
SELECT * FROM productos;
GO

---------------------------------------------------------------------
-- CREAR TABLA compras (solo si no existe)
---------------------------------------------------------------------
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID('compras') AND type = 'U')
BEGIN
    CREATE TABLE compras (
        id INT IDENTITY(1,1) PRIMARY KEY,
        cliente_nombre VARCHAR(100) NOT NULL,
        productos VARCHAR(MAX) NOT NULL,
        total DECIMAL(10,2) NOT NULL,
        fecha DATETIME DEFAULT GETDATE()
    );
END;
GO
