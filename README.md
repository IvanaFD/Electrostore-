# ElectroStore

Aplicación web fullstack para gestionar inventario y ventas de una tienda de componentes electrónicos. Desarrollada como Proyecto 2 del curso cc3062 - Sistemas y Tecnologías Web.

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18 + Vite |
| Backend | Node.js + Express 5 |
| Base de datos | PostgreSQL 16 |
| Contenedores | Docker + Docker Compose |
| Autenticación | JWT (jsonwebtoken + bcryptjs) |

## Levantar el proyecto localmente

**Requisitos:** Docker y Git instalados.

```bash
git clone https://github.com/IvanaFD/Electrostore-.git
cd Electrostore-
cp .env.example .env
docker compose up --build
```

Cuando veas `Servidor corriendo en puerto 3000` y `VITE ready`:

| Servicio | URL |
|----------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:3000 |
| Swagger UI | http://localhost:3000/api/docs |



### Troubleshooting

Si el proyecto no levanta (error DNS en db-init):

```bash
docker compose down && docker network prune -f && docker compose up
```

Si persiste, levantar solo los servicios necesarios (cuando la DB ya tiene datos):

```bash
docker compose up db backend frontend
```

## Deploy en producción

La aplicación está desplegada en Render:

| Servicio | URL |
|----------|-----|
| Frontend | https://electrostore-frontend.onrender.com/ |
| Backend API | https://electrostore-backend-cngr.onrender.com |
| Swagger UI | https://electrostore-backend-cngr.onrender.com/api/docs |

## Variables de entorno

Copiar `.env.example` a `.env` — todas las variables ya están configuradas:

```env
POSTGRES_USER=proy2
POSTGRES_PASSWORD=secret
POSTGRES_DB=electrostore

DB_HOST=db
DB_PORT=5432
DB_USER=proy2
DB_PASSWORD=secret
DB_NAME=electrostore

JWT_SECRET=electrostore_jwt_secret_2026_proy2
PORT=3000
```

## Usuarios de prueba

| Usuario | Contraseña | Rol |
|---------|-----------|-----|
| `admin` | `admin123` | Administrador |
| `empleado1` | `em123` | Vendedor |
| `empleado2` | `emp456` | Vendedor |
| `cliente1` | `cl123` | Cliente |
| `cliente2` | `cl456` | Cliente |

Nuevos usuarios registrados desde la UI obtienen el rol `cliente` automáticamente.

## Documentación de la API

La API está documentada con OpenAPI 3.0. El spec está en [`docs/openapi.yaml`](docs/openapi.yaml) y se sirve interactivamente en `/api/docs` vía Swagger UI.

**37 endpoints** organizados en 8 grupos: Auth, Categorías, Productos, Clientes, Empleados, Proveedores, Ventas, Órdenes y Reportes.

Para probar endpoints protegidos en Swagger:
1. Usar `POST /api/auth/login` para obtener el token
2. Click en **Authorize** e ingresar el token

## Estructura del proyecto

```
Electrostore-/
├── backend/
│   ├── src/
│   │   ├── config/         # Conexión PostgreSQL (Pool)
│   │   ├── middlewares/    # Auth JWT y guards por rol
│   │   ├── repositories/   # Queries SQL
│   │   └── routes/         # Endpoints REST
│   ├── openapi.yaml        # Spec OpenAPI (copiado de docs/)
│   └── index.js            # Entry point + Swagger UI
├── database/
│   ├── 01-ddl.sql          # Tablas, índices y constraints
│   └── 02-seed.sql         # Datos de prueba
├── docs/
│   ├── openapi.yaml        # Documentación API
│   └── diagrama_er.png     # Diagrama entidad-relación
├── frontend/
│   ├── src/
│   │   ├── components/     # Navbar, ProductCard
│   │   ├── contexts/       # AuthContext, CartContext 
│   │   ├── hooks/          # useLogout, useDebounce
│   │   ├── pages/          # Vistas cliente y admin
│   │   ├── services/       # Axios con interceptors JWT
│   │   └── __tests__/      # Tests Vitest
│   └── vite.config.js
├── docker-compose.yml
├── .env.example
└── README.md
```

## Funcionalidades

### Área cliente
- Catálogo con búsqueda en tiempo real y filtros por categoría
- Carrito persistente en localStorage con validación de stock
- Checkout con transacción explícita en backend
- Perfil con historial de compras filtrable por fechas

### Área admin / vendedor
- Dashboard con 6 reportes exportables a CSV
- CRUD completo de productos con filtros por stock y categoría
- Gestión de ventas con cancelación y devolución de stock
- Órdenes de compra a proveedores con actualización de stock al recibir
- CRUD de empleados (solo admin)
- Auto-asignación de empleado en ventas según usuario logueado

## Base de datos

**10 tablas:** `Usuario` · `Empleado` · `Cliente` · `Categoria` · `Proveedor` · `Producto` · `Venta` · `DetalleVenta` · `OrdenCompra` · `DetalleOrden`

### Técnicas SQL implementadas

| Técnica | Endpoint |
|---------|---------|
| JOINs múltiples | Inventario, Ventas, Dashboard |
| Subquery `IN` — clientes con compras | `GET /api/reportes/clientes-con-compras` |
| Subquery `EXISTS` — productos sin ventas | `GET /api/reportes/productos-sin-ventas` |
| `GROUP BY` + `HAVING` | `GET /api/reportes/productos-mas-vendidos` |
| `GROUP BY` + agregación | `GET /api/reportes/ventas-por-categoria` |
| CTE (`WITH`) — ventas por período | `GET /api/reportes/ventas-por-periodo` |
| VIEW `vista_stock_bajo` | `GET /api/reportes/stock-bajo` |
| Transacciones `BEGIN/COMMIT/ROLLBACK` | `POST /api/ventas`, `POST /api/ordenes` |

## Implementación React

| Requisito | Implementación |
|-----------|---------------|
| React Router (4+ rutas) | 10+ rutas con guards por rol (`ProtectedRoute`, `ClienteRoute`) |
| React Context | `AuthContext` (sesión JWT) + `CartContext` (carrito) |
| `useState` / `useEffect` | Todas las páginas |
| `useCallback` / `useMemo` | Filtros, iniciales, sugerencias de búsqueda |
| `useReducer` | Carrito en `CartContext` con 4 acciones |
| Hooks personalizados | `useLogout`, `useDebounce` |
| Formularios controlados | CRUD inventario, ventas, órdenes, empleados |
| Reportes en UI | Dashboard con 6 tablas de reportes |
| Manejo de errores | Mensajes de validación en todos los formularios |

## Tests

4 tests unitarios con Vitest sobre `cartReducer`:

```bash
cd frontend && npm test
```

Cubren: agregar item nuevo, acumular cantidad en item existente, eliminar item, y actualizar cantidad a 0 (equivale a eliminar).

## Comandos útiles

```bash
# Ver logs del backend
docker compose logs -f backend

# Detener y limpiar todo (incluye volumen de datos)
docker compose down -v
```
