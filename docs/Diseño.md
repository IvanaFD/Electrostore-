# Proyecto No. 2 — Diseño de Base de Datos
**CC3088 – Base de Datos 1 · Universidad del Valle de Guatemala · Ciclo 1, 2026**
Figueroa, Ivana – 24785

---

## 1. Diagrama Entidad-Relación

El diagrama fue elaborado en notación Chen. Las entidades se representan con rectángulos, las relaciones con rombos, los atributos con elipses y la cardinalidad con los valores 1, N o M sobre las líneas de conexión. Las llaves foráneas no se incluyen como atributos en el diagrama Chen ya que están implícitas en las relaciones.

### 1.1 Entidades y Relaciones

| Entidad A | Relación | Entidad B | Cardinalidad |
|---|---|---|---|
| Producto | Pertenece a | Categoria | N : 1 |
| Producto | Suministrado por | Proveedor | N : 1 |
| Venta | Realiza | Cliente | N : 1 |
| Venta | Atiende | Empleado | N : 0..1 |
| Venta | Contiene | Producto | N : M → DetalleVenta |
| OrdenCompra | Pide a | Proveedor | N : 1 |
| OrdenCompra | Gestiona | Empleado | N : 1 |
| OrdenCompra | Contiene | Producto | N : M → DetalleOrden |
| Empleado | Tiene | Usuario | 1 : 0..1 |
| Cliente | Tiene | Usuario | 1 : 0..1 |

### 1.2 Diagrama

![Diagrama Entidad-Relación](docs/diagrama_er.png)

---

## 2. Modelo Relacional

En la notación relacional, la clave primaria (PK) se indica con subrayado continuo y la clave foránea (FK) con subrayado discontinuo. Las tablas puente `DetalleVenta` y `DetalleOrden` tienen clave primaria compuesta.

### 2.1 Esquema en Notación Relacional

**Categoria**
Categoria(<u>id_categoria</u>, nombre, descripcion)

**Proveedor**
Proveedor(<u>id_proveedor</u>, nombre, nombre_contacto, telefono, email, direccion)

**Usuario**
Usuario(<u>id_usuario</u>, username, password_hash, rol, created_at)

**Empleado**
Empleado(<u>id_empleado</u>, nombre, apellido, email, telefono, cargo, <u id_usuario*>id_usuario*</u>, created_at)

**Cliente**
Cliente(<u>id_cliente</u>, nombre, apellido, email, telefono, direccion, <u>id_usuario*</u>, created_at)

**Producto**
Producto(<u>id_producto</u>, sku, nombre, marca, precio_venta, precio_costo, stock_actual, stock_minimo, descripcion, imagen_url, <u>id_categoria*</u>, <u>id_proveedor*</u>, created_at)

**Venta**
Venta(<u>id_venta</u>, fecha_venta, total, estado, <u>id_cliente*</u>, <u>id_empleado*</u>)

**DetalleVenta**
DetalleVenta(<u>id_venta*</u>, <u>id_producto*</u>, cantidad, precio_unitario, subtotal)
PK compuesta: (id_venta, id_producto)

**OrdenCompra**
OrdenCompra(<u>id_orden</u>, fecha_orden, estado, <u>id_proveedor*</u>, <u>id_empleado*</u>)

**DetalleOrden**
DetalleOrden(<u>id_orden*</u>, <u>id_producto*</u>, cantidad, precio_compra)
PK compuesta: (id_orden, id_producto)

### 2.2 Diagrama del Modelo Relacional

![Modelo Relacional](docs/modelo_relacional.png)

---

## 3. Normalización hasta 3FN

### 3.1 Primera Forma Normal (1FN)

Una relación está en 1FN si todos sus atributos contienen valores atómicos (indivisibles) y no existen grupos repetitivos.

Todas las tablas del diseño cumplen 1FN:

- Cada celda contiene un único valor atómico. Por ejemplo, el teléfono de un cliente es un solo número, no una lista.
- No existen atributos multivaluados. La relación N:M entre `Venta` y `Producto` fue descompuesta en `DetalleVenta`, y la relación N:M entre `OrdenCompra` y `Producto` en `DetalleOrden`, eliminando cualquier grupo repetitivo.
- Cada tabla tiene una clave primaria definida que identifica de forma única cada registro.

### 3.2 Segunda Forma Normal (2FN)

Una relación está en 2FN si está en 1FN y todos los atributos no clave dependen funcionalmente de la clave primaria completa, sin dependencias parciales.

Las únicas tablas con clave primaria compuesta son `DetalleVenta(id_venta, id_producto)` y `DetalleOrden(id_orden, id_producto)`:

- En `DetalleVenta`: los atributos `cantidad`, `precio_unitario` y `subtotal` dependen de la combinación completa `(id_venta, id_producto)`. No dependen solo de `id_venta` ni solo de `id_producto` de forma individual.
- En `DetalleOrden`: de igual forma, `cantidad` y `precio_compra` dependen de la combinación completa `(id_orden, id_producto)`.

Todas las demás tablas tienen clave primaria simple, por lo que la 2FN se cumple trivialmente.

### 3.3 Tercera Forma Normal (3FN)

Una relación está en 3FN si está en 2FN y no existen dependencias transitivas entre atributos no clave.

- En `Venta`: el atributo `total` depende de `id_venta` directamente como valor calculado y guardado en el momento de la venta. No depende de ningún otro atributo no clave como `id_cliente` o `id_empleado`.
- En `Producto`: `precio_venta` y `precio_costo` son atributos propios del producto. No dependen de `id_categoria` ni de `id_proveedor`, sino del propio `id_producto`.
- En `DetalleVenta`: el atributo `precio_unitario` es una copia histórica del precio al momento de la venta. No depende del precio actual en la tabla `Producto`, evitando una dependencia transitiva.
- En `Usuario`: `rol` y `username` dependen directamente de `id_usuario`. La información personal del empleado o cliente reside en sus respectivas tablas, evitando que atributos como `nombre` o `teléfono` dependan de `id_usuario` de forma transitiva.

La separación de `Empleado`/`Cliente` y `Usuario` aplica el patrón de herencia de tablas. Se justifica porque no todos los empleados ni clientes necesitan acceso al sistema. Si los atributos de autenticación estuvieran en esas tablas, generarían valores NULL estructurales que violarían el principio de 3FN.

---

## 4. DDL — Definición de Tablas

Script completo disponible en `database/01-ddl.sql`. Incluye todas las restricciones `PRIMARY KEY`, `FOREIGN KEY`, `NOT NULL` y `CHECK` para las 10 tablas del sistema sobre PostgreSQL 16.

---

## 5. Índices

Se definieron cuatro índices sobre columnas consultadas frecuentemente en las operaciones principales del sistema.

| Índice | Tabla | Columna | Justificación |
|---|---|---|---|
| `idx_producto_sku` | Producto | sku | Búsqueda por SKU al agregar productos a una venta u orden. Operación frecuente en cada transacción. |
| `idx_producto_nombre` | Producto | nombre | El buscador del catálogo filtra productos por nombre en tiempo real con `ILIKE`. Se ejecuta en cada pulsación del teclado. |
| `idx_venta_fecha` | Venta | fecha_venta | Los reportes y el historial de clientes filtran por rango de fechas con `WHERE fecha_venta BETWEEN`. Sin índice requeriría full scan. |
| `idx_cliente_telefono` | Cliente | telefono | Identificación de clientes por teléfono al registrar una venta presencial. |

```sql
CREATE INDEX idx_producto_sku     ON Producto(sku);
CREATE INDEX idx_producto_nombre  ON Producto(nombre);
CREATE INDEX idx_venta_fecha      ON Venta(fecha_venta);
CREATE INDEX idx_cliente_telefono ON Cliente(telefono);
```