# ElectroStore

Aplicación web fullstack para gestionar inventario y ventas de una tienda de componentes electrónicos. Implementa seguridad a nivel de base de datos mediante roles, stored procedures y ORM (Proyecto 3 — cc3088 Bases de Datos 1).

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18 + Vite |
| Backend | Node.js + Express 5 |
| Base de datos | PostgreSQL 16 |
| ORM | Sequelize 6 |
| Contenedores | Docker + Docker Compose |
| Autenticación | JWT |

## Levantar el proyecto desde cero

**Requisitos:** Docker y Git instalados.

```bash
git clone https://github.com/IvanaFD/Electrostore-.git
cd Electrostore-
git checkout proyecto-3
cp .env.example .env
cp docker-compose.yml.example docker-compose.yml
docker compose up --build
```

Cuando veas `Servidor corriendo en puerto 3000` y `VITE ready`:

| Servicio | URL |
|----------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:3000 |
| Swagger UI | http://localhost:3000/api/docs |

> Si el proyecto no levanta por error de red en db-init:
> ```bash
> docker compose down && docker network prune -f && docker compose up
> ```

## Variables de entorno

Copiar `.env.example` a `.env` — todas las variables ya están configuradas con las credenciales de calificación:

```env
POSTGRES_USER=proy3
POSTGRES_PASSWORD=secret
POSTGRES_DB=electrostore

DB_HOST=db
DB_PORT=5432
DB_USER=proy3
DB_PASSWORD=secret
DB_NAME=electrostore

JWT_SECRET=electrostore_jwt_secret_2026_proy3
PORT=3000
```

## Usuarios de prueba

Un usuario funcional por cada rol:

| Usuario | Contraseña | Rol |
|---------|-----------|-----|
| `admin` | `admin123` | Administrador |
| `empleado1` | `em123` | Vendedor |
| `bodeguero1` | `bod123` | Bodeguero |
| `auditor1` | `aud123` | Auditor |
| `cliente1` | `cl123` | Cliente |

## Roles de base de datos

Definidos en `database/03-roles.sql` mediante `CREATE ROLE` con permisos granulares por tabla y operación.

### `rol_admin`
Acceso total (`ALL PRIVILEGES`) sobre todas las tablas y secuencias.

### `rol_vendedor`

| Tabla | Operaciones |
|-------|------------|
| Producto, Categoria, Proveedor, Empleado, Cliente, Usuario | SELECT |
| Venta | SELECT, INSERT, UPDATE |
| DetalleVenta | SELECT, INSERT |
| OrdenCompra | SELECT, INSERT, DELETE |
| DetalleOrden | SELECT, INSERT, DELETE |

### `rol_bodeguero`

| Tabla | Operaciones |
|-------|------------|
| Categoria, Proveedor, Empleado, Usuario | SELECT |
| Producto | SELECT, INSERT, UPDATE |
| OrdenCompra | SELECT, INSERT, UPDATE, DELETE |
| DetalleOrden | SELECT, INSERT, DELETE |

### `rol_cliente`

| Tabla | Operaciones |
|-------|------------|
| Producto, Categoria, Cliente, Empleado | SELECT |
| Venta | SELECT, INSERT |
| DetalleVenta | SELECT, INSERT |

### `rol_auditor`
`SELECT` sobre todas las tablas (solo lectura).

## Stored Procedures

Definidos en `database/04-stored-procedures.sql` e invocados desde el backend.

| Procedure / Function | Tipo | Descripción |
|---|---|---|
| `sp_registrar_venta(id_cliente, id_empleado, items jsonb)` | PROCEDURE | Valida stock, inserta Venta + DetalleVenta y descuenta stock. ROLLBACK si stock insuficiente. |
| `sp_cancelar_venta(id_venta)` | PROCEDURE | Restaura stock de cada ítem y marca la venta como cancelada. ROLLBACK si ya estaba cancelada. |
| `sp_recibir_orden(id_orden)` | PROCEDURE | Incrementa stock por cada ítem de la orden y la marca como recibida. ROLLBACK si ya fue recibida. |
| `sp_cancelar_orden(id_orden)` | PROCEDURE | Elimina los detalles y la orden. ROLLBACK si no está en estado pendiente. |
| `sp_verificar_stock(id_producto, cantidad) → (disponible, stock_actual, nombre)` | FUNCTION | Parámetros IN/OUT. Retorna disponibilidad y stock actual. Lanza excepción si el producto no existe o la cantidad es inválida. |

Todos los PROCEDUREs incluyen transacciones explícitas (`BEGIN` implícito / `COMMIT` / `ROLLBACK`).

## ORM

Sequelize 6 configurado en `backend/src/config/sequelize.js` con el modelo `Producto` (`backend/src/models/Producto.js`).

Operaciones CRUD implementadas mediante ORM en `backend/src/repositories/producto.repository.js`:

| Operación | Método Sequelize |
|-----------|----------------|
| READ | `Producto.findOne({ where: { sku } })` |
| CREATE | `Producto.create(datos)` |
| UPDATE | `Producto.findByPk(id)` → `producto.update(datos)` |
| DELETE | `Producto.findByPk(id)` → `producto.destroy()` |

Cada operación corre dentro de `sequelize.transaction()` con `SET LOCAL ROLE` para respetar los permisos del rol de base de datos activo.

## Estructura del proyecto

```
Electrostore-/
├── backend/
│   └── src/
│       ├── config/         # db.js (pool + queryWithRole), sequelize.js
│       ├── middlewares/    # authMiddleware, roleGuard
│       ├── models/         # Producto.js (Sequelize)
│       ├── repositories/   # SQL + ORM por entidad
│       └── routes/         # Endpoints REST con guards por rol
├── database/
│   ├── 01-ddl.sql          # Tablas, índices y constraints
│   ├── 02-seed.sql         # Datos de prueba y usuarios por rol
│   ├── 03-roles.sql        # CREATE ROLE + GRANT/REVOKE
│   └── 04-stored-procedures.sql  # 5 stored procedures
├── frontend/
│   └── src/
│       ├── contexts/       # AuthContext (sesión JWT)
│       ├── pages/          # Vistas protegidas por rol
│       └── services/       # Axios con interceptors JWT
├── docker-compose.yml.example
├── .env.example
└── README.md
```
