# ElectroStore

Aplicación web fullstack para gestionar inventario y ventas de una tienda de componentes electrónicos.

## Stack

- **Frontend:** Vue 3 + Vite
- **Backend:** Node.js + Express
- **Base de datos:** PostgreSQL 16
- **Contenedores:** Docker + Docker Compose

## Requisitos

- Docker Desktop
- Git

## Instalación

```bash
git clone <url-del-repositorio>
cd electrostore
cp .env.example .env
docker compose up --build
```

Una vez que veas `Servidor corriendo en puerto 3000` y `VITE ready`, la aplicación está lista:

- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:3000

## Variables de entorno

Las credenciales requeridas para calificación ya están en `.env.example`:

```
POSTGRES_USER=proy2
POSTGRES_PASSWORD=secret
POSTGRES_DB=electrostore
DB_HOST=db
DB_PORT=5432
DB_USER=proy2
DB_PASSWORD=secret
DB_NAME=electrostore
JWT_SECRET=electrostore_jwt_secret_2026
PORT=3000
```

## Usuarios de prueba

| Usuario | Contraseña | Rol |
|---|---|---|
| admin | admin123 | Administrador |
| empleado1 | em123 | Vendedor |
| empleado2 | emp456 | Vendedor |
| cliente1 | cl123 | Cliente |
| cliente2 | cl456 | Cliente |

Nuevos usuarios registrados desde la UI obtienen el rol `cliente` automáticamente.

## Troubleshooting

Si el proyecto no levanta correctamente, limpiar volúmenes y reiniciar:

```bash
docker compose down -v
docker compose up --build
```

## Estructura del proyecto

```
electrostore/
├── backend/
│   ├── src/
│   │   ├── config/         # Conexión PostgreSQL
│   │   ├── middlewares/    # Auth JWT y guards por rol
│   │   ├── repositories/   # Queries SQL explícitas
│   │   └── routes/         # Endpoints REST
│   └── Dockerfile
├── database/
│   ├── 01-ddl.sql          # Tablas, índices y constraints
│   └── 02-seed.sql         # Datos de prueba
├── frontend/
│   ├── src/
│   │   ├── components/     # Componentes reutilizables
│   │   ├── services/       # Axios con interceptors JWT
│   │   ├── stores/         # Pinia (auth, carrito)
│   │   ├── router/         # Vue Router con guards por rol
│   │   └── views/          # Vistas cliente y admin
│   └── Dockerfile
├── docker-compose.yml
└── .env.example
```

## Base de datos

### Tablas (10)

`Usuario` · `Empleado` · `Cliente` · `Categoria` · `Proveedor` · `Producto` · `Venta` · `DetalleVenta` · `OrdenCompra` · `DetalleOrden`

### SQL implementado

| Tipo | Visible en UI |
|---|---|
| JOINs múltiples (productos + categoría + proveedor, ventas + cliente + empleado) | Inventario, Ventas, Dashboard |
| Subquery `IN` — clientes con compras completadas | Dashboard → Mejores Clientes |
| Subquery `EXISTS` — productos nunca vendidos | Dashboard → Productos Sin Ventas |
| `GROUP BY` + `HAVING` — productos más vendidos | Dashboard |
| `GROUP BY` + agregación — ventas por categoría y empleado | Dashboard |
| CTE (`WITH`) + window functions — ventas por período | Dashboard |
| VIEW `vista_stock_bajo` utilizada por el backend | Dashboard → Stock Bajo |
| Transacciones `BEGIN/COMMIT/ROLLBACK` — ventas y órdenes | Backend |

### Índices

```sql
CREATE INDEX idx_producto_sku     ON Producto(sku);
CREATE INDEX idx_producto_nombre  ON Producto(nombre);
CREATE INDEX idx_venta_fecha      ON Venta(fecha_venta);
CREATE INDEX idx_cliente_telefono ON Cliente(telefono);
```

## Funcionalidades

### Área cliente
- Catálogo con búsqueda en tiempo real y filtros por categoría
- Carrito persistente con validación de stock
- Compra con transacción explícita y rollback ante error
- Perfil con historial de compras filtrable por fechas

### Área admin / vendedor
- Dashboard con 6 reportes SQL exportables a CSV
- CRUD de productos con filtros por stock y categoría
- Gestión de ventas y cancelación con devolución de stock
- Órdenes de compra a proveedores con actualización de stock al recibir
- CRUD de empleados (solo admin)

## Comandos útiles

```bash
# Logs en tiempo real
docker compose logs -f backend

# Acceder a la base de datos
docker compose exec db psql -U proy2 -d electrostore

# Detener servicios
docker compose down

# Reinicio completo con limpieza de datos
docker compose down -v
```