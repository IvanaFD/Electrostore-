-- ============================================================
-- Proyecto 3 — Roles y permisos a nivel de base de datos
-- ============================================================

-- 5 roles de negocio
CREATE ROLE rol_admin;
CREATE ROLE rol_vendedor;
CREATE ROLE rol_cliente;
CREATE ROLE rol_bodeguero;
CREATE ROLE rol_auditor;

-- Acceso al schema public para todos los roles
GRANT USAGE ON SCHEMA public TO rol_admin, rol_vendedor, rol_cliente, rol_bodeguero, rol_auditor;

-- ============================================================
-- rol_admin: acceso total a todas las tablas
-- ============================================================
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO rol_admin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO rol_admin;

-- ============================================================
-- rol_vendedor: gestiona ventas, consulta catálogo y clientes
-- ============================================================
GRANT SELECT ON Producto, Categoria, Proveedor, Empleado, Cliente, Usuario TO rol_vendedor;
GRANT SELECT, INSERT, UPDATE ON Venta TO rol_vendedor;
GRANT SELECT, INSERT ON DetalleVenta TO rol_vendedor;
GRANT SELECT, INSERT, DELETE ON OrdenCompra TO rol_vendedor;
GRANT SELECT, INSERT, DELETE ON DetalleOrden TO rol_vendedor;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO rol_vendedor;

-- ============================================================
-- rol_cliente: consulta catálogo y registra sus propias compras
-- ============================================================
GRANT SELECT ON Producto, Categoria TO rol_cliente;
GRANT SELECT ON Cliente TO rol_cliente;
GRANT SELECT ON Empleado TO rol_cliente;
GRANT SELECT, INSERT ON Venta TO rol_cliente;
GRANT SELECT, INSERT ON DetalleVenta TO rol_cliente;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO rol_cliente;

-- ============================================================
-- rol_bodeguero: gestiona inventario y órdenes de compra
-- ============================================================
GRANT SELECT ON Categoria, Proveedor, Empleado, Usuario TO rol_bodeguero;
GRANT SELECT, INSERT, UPDATE ON Producto TO rol_bodeguero;
GRANT SELECT, INSERT, UPDATE, DELETE ON OrdenCompra TO rol_bodeguero;
GRANT SELECT, INSERT, DELETE ON DetalleOrden TO rol_bodeguero;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO rol_bodeguero;

-- ============================================================
-- rol_auditor: solo lectura — reportes, inventario y ventas
-- ============================================================
GRANT SELECT ON ALL TABLES IN SCHEMA public TO rol_auditor;

-- ============================================================
-- Otorgar roles al usuario de la aplicación (POSTGRES_USER del .env)
-- Necesario para que el backend pueda hacer SET ROLE
-- ============================================================
DO $$
BEGIN
    EXECUTE 'GRANT rol_admin     TO ' || quote_ident(current_user);
    EXECUTE 'GRANT rol_vendedor  TO ' || quote_ident(current_user);
    EXECUTE 'GRANT rol_cliente   TO ' || quote_ident(current_user);
    EXECUTE 'GRANT rol_bodeguero TO ' || quote_ident(current_user);
    EXECUTE 'GRANT rol_auditor   TO ' || quote_ident(current_user);
END $$;
