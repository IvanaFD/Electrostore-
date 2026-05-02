CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE Categoria (
    id_categoria SERIAL PRIMARY KEY,
    nombre       VARCHAR(100) NOT NULL,
    descripcion  TEXT         NOT NULL
);

CREATE TABLE Proveedor (
    id_proveedor    SERIAL PRIMARY KEY,
    nombre          VARCHAR(150) NOT NULL,
    nombre_contacto VARCHAR(100) NOT NULL,
    telefono        VARCHAR(20)  NOT NULL,
    email           VARCHAR(100) NOT NULL,
    direccion       TEXT         NOT NULL
);

CREATE TABLE Usuario (
    id_usuario    SERIAL PRIMARY KEY,
    username      VARCHAR(50)  NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    rol           VARCHAR(20)  NOT NULL CHECK (rol IN ('admin', 'vendedor', 'cliente')),
    created_at    TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TABLE Empleado (
    id_empleado SERIAL PRIMARY KEY,
    nombre      VARCHAR(100) NOT NULL,
    apellido    VARCHAR(100) NOT NULL,
    email       VARCHAR(100) NOT NULL UNIQUE,
    telefono    VARCHAR(20)  NOT NULL,
    cargo       VARCHAR(20)  NOT NULL CHECK (cargo IN ('vendedor', 'supervisor', 'bodeguero')),
    id_usuario  INTEGER      UNIQUE REFERENCES Usuario(id_usuario),
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TABLE Cliente (
    id_cliente SERIAL PRIMARY KEY,
    nombre     VARCHAR(100) NOT NULL,
    apellido   VARCHAR(100) NOT NULL,
    email      VARCHAR(100) NOT NULL UNIQUE,
    telefono   VARCHAR(20)  NOT NULL,
    direccion  TEXT         NOT NULL,
    id_usuario INTEGER      UNIQUE REFERENCES Usuario(id_usuario),
    created_at TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TABLE Producto (
    id_producto  SERIAL PRIMARY KEY,
    sku          VARCHAR(50)   NOT NULL UNIQUE,
    nombre       VARCHAR(200)  NOT NULL,
    marca        VARCHAR(100)  NOT NULL,
    precio_venta NUMERIC(10,2) NOT NULL CHECK (precio_venta > 0),
    precio_costo NUMERIC(10,2) NOT NULL CHECK (precio_costo > 0),
    stock_actual INTEGER       NOT NULL DEFAULT 0 CHECK (stock_actual >= 0),
    stock_minimo INTEGER       NOT NULL DEFAULT 5 CHECK (stock_minimo >= 0),
    descripcion  TEXT          NOT NULL,
    imagen_url   VARCHAR(500),
    id_categoria INTEGER       NOT NULL REFERENCES Categoria(id_categoria),
    id_proveedor INTEGER       NOT NULL REFERENCES Proveedor(id_proveedor),
    created_at   TIMESTAMP     NOT NULL DEFAULT NOW()
);

CREATE TABLE Venta (
    id_venta    SERIAL PRIMARY KEY,
    fecha_venta TIMESTAMP     NOT NULL DEFAULT NOW(),
    total       NUMERIC(10,2) NOT NULL CHECK (total >= 0),
    estado      VARCHAR(20)   NOT NULL DEFAULT 'completada' CHECK (estado IN ('completada', 'cancelada')),
    id_cliente  INTEGER       NOT NULL REFERENCES Cliente(id_cliente),
    id_empleado INTEGER       REFERENCES Empleado(id_empleado)
);

CREATE TABLE DetalleVenta (
    id_venta        INTEGER       NOT NULL REFERENCES Venta(id_venta) ON DELETE CASCADE,
    id_producto     INTEGER       NOT NULL REFERENCES Producto(id_producto),
    cantidad        INTEGER       NOT NULL CHECK (cantidad > 0),
    precio_unitario NUMERIC(10,2) NOT NULL CHECK (precio_unitario > 0),
    subtotal        NUMERIC(10,2) NOT NULL CHECK (subtotal >= 0),
    PRIMARY KEY (id_venta, id_producto)
);

CREATE TABLE OrdenCompra (
    id_orden     SERIAL PRIMARY KEY,
    fecha_orden  TIMESTAMP   NOT NULL DEFAULT NOW(),
    estado       VARCHAR(20) NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'recibida')),
    id_proveedor INTEGER     NOT NULL REFERENCES Proveedor(id_proveedor),
    id_empleado  INTEGER     NOT NULL REFERENCES Empleado(id_empleado)
);

CREATE TABLE DetalleOrden (
    id_orden      INTEGER       NOT NULL REFERENCES OrdenCompra(id_orden) ON DELETE CASCADE,
    id_producto   INTEGER       NOT NULL REFERENCES Producto(id_producto),
    cantidad      INTEGER       NOT NULL CHECK (cantidad > 0),
    precio_compra NUMERIC(10,2) NOT NULL CHECK (precio_compra > 0),
    PRIMARY KEY (id_orden, id_producto)
);

CREATE INDEX idx_producto_sku     ON Producto(sku);
CREATE INDEX idx_producto_nombre  ON Producto(nombre);
CREATE INDEX idx_venta_fecha      ON Venta(fecha_venta);
CREATE INDEX idx_cliente_telefono ON Cliente(telefono);
