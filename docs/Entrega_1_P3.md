# ElectroStore — Proyecto 3

**Repositorio:** https://github.com/IvanaFD/Electrostore-/tree/proyecto-3-BD

Extensión del Proyecto 2 con seguridad a nivel de base de datos: roles y permisos con `CREATE ROLE` / `GRANT` / `REVOKE`, stored procedures y ORM (Sequelize).

## Levantar el proyecto

```bash
git clone https://github.com/IvanaFD/Electrostore-.git
cd Electrostore-
git checkout proyecto-3
cp .env.example .env
cp docker-compose.yml.example docker-compose.yml
docker compose up --build
```

| Servicio     | URL                        |
|--------------|----------------------------|
| Frontend     | http://localhost:5173       |
| Backend API  | http://localhost:3000       |
| Swagger UI   | http://localhost:3000/api/docs |

---

## Esquema de roles en la base de datos

Los 5 roles se crean en PostgreSQL mediante `CREATE ROLE` y se les asignan permisos granulares por tabla con `GRANT` y `REVOKE` (ver [`database/03-roles.sql`](../database/03-roles.sql)).

### rol_admin

Acceso total. Administra todos los recursos del sistema.

| Tabla         | SELECT | INSERT | UPDATE | DELETE |
|---------------|--------|--------|--------|--------|
| Categoria     | ✓      | ✓      | ✓      | ✓      |
| Proveedor     | ✓      | ✓      | ✓      | ✓      |
| Usuario       | ✓      | ✓      | ✓      | ✓      |
| Empleado      | ✓      | ✓      | ✓      | ✓      |
| Cliente       | ✓      | ✓      | ✓      | ✓      |
| Producto      | ✓      | ✓      | ✓      | ✓      |
| Venta         | ✓      | ✓      | ✓      | ✓      |
| DetalleVenta  | ✓      | ✓      | ✓      | ✓      |
| OrdenCompra   | ✓      | ✓      | ✓      | ✓      |
| DetalleOrden  | ✓      | ✓      | ✓      | ✓      |

---

### rol_vendedor

Gestiona ventas. Consulta catálogo, clientes y empleados, pero no modifica inventario ni órdenes.

| Tabla         | SELECT | INSERT | UPDATE | DELETE |
|---------------|--------|--------|--------|--------|
| Producto      | ✓      |        |        |        |
| Categoria     | ✓      |        |        |        |
| Proveedor     | ✓      |        |        |        |
| Empleado      | ✓      |        |        |        |
| Cliente       | ✓      |        |        |        |
| Venta         | ✓      | ✓      | ✓      |        |
| DetalleVenta  | ✓      | ✓      |        |        |

---

### rol_cliente

Consulta el catálogo y registra sus propias compras.

| Tabla        | SELECT | INSERT | UPDATE | DELETE |
|--------------|--------|--------|--------|--------|
| Producto     | ✓      |        |        |        |
| Categoria    | ✓      |        |        |        |
| Cliente      | ✓      |        |        |        |
| Venta        | ✓      | ✓      |        |        |
| DetalleVenta | ✓      | ✓      |        |        |

---

### rol_bodeguero

Administra inventario de productos y órdenes de compra a proveedores. No tiene acceso a ventas ni datos de clientes.

| Tabla        | SELECT | INSERT | UPDATE | DELETE |
|--------------|--------|--------|--------|--------|
| Categoria    | ✓      |        |        |        |
| Proveedor    | ✓      |        |        |        |
| Empleado     | ✓      |        |        |        |
| Producto     | ✓      | ✓      | ✓      |        |
| OrdenCompra  | ✓      | ✓      | ✓      |        |
| DetalleOrden | ✓      | ✓      |        |        |

---

### rol_auditor

Solo lectura en todas las tablas. Revisa reportes, inventario y ventas sin poder modificar nada.

| Tabla         | SELECT | INSERT | UPDATE | DELETE |
|---------------|--------|--------|--------|--------|
| Todas         | ✓      |        |        |        |

---

## Usuarios de prueba (uno por rol)

| Usuario      | Contraseña | Rol        |
|--------------|-----------|------------|
| `admin`      | `admin123` | admin      |
| `empleado1`  | `em123`    | vendedor   |
| `cliente1`   | `cl123`    | cliente    |
| `bodeguero1` | `bod123`   | bodeguero  |
| `auditor1`   | `aud123`   | auditor    |



---

## Rutas protegidas por rol

### Backend (`roleGuard` middleware)

| Endpoint                     | Roles permitidos              |
|------------------------------|-------------------------------|
| `POST /api/ventas`           | admin, vendedor               |
| `PATCH /api/ventas/:id/cancelar` | admin, vendedor           |
| `GET /api/reportes/*`        | admin, vendedor, auditor      |
| `POST /api/productos`        | admin, bodeguero              |
| `PUT /api/productos/:id`     | admin, bodeguero              |
| `POST /api/ordenes`          | admin, vendedor, bodeguero    |
| `DELETE /api/empleados/:id`  | admin                         |

### Frontend (React Router guards)

| Vista           | admin | vendedor | bodeguero | auditor |
|-----------------|-------|----------|-----------|---------|
| Dashboard       | ✓     | ✓        |           | ✓       |
| Inventario      | ✓     | ✓        | ✓         | ✓       |
| Ventas          | ✓     | ✓        |           |         |
| Órdenes         | ✓     | ✓        | ✓         |         |
| Empleados       | ✓     |          |           |         |
| Mi Perfil       | ✓     | ✓        | ✓         | ✓       |
