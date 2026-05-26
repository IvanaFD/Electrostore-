import pool, { queryWithRole } from '../config/db.js';

export const createView = async () => {
  await pool.query(`
    CREATE OR REPLACE VIEW vista_stock_bajo AS
    SELECT p.id_producto, p.sku, p.nombre, p.marca,
           p.stock_actual, p.stock_minimo,
           c.nombre AS categoria
    FROM Producto p
    JOIN Categoria c ON p.id_categoria = c.id_categoria
    WHERE p.stock_actual <= p.stock_minimo
    ORDER BY p.stock_actual ASC
  `);
  await pool.query(`
    GRANT SELECT ON vista_stock_bajo TO rol_admin, rol_vendedor, rol_bodeguero, rol_auditor
  `);
};

export const getStockBajo = async (rol) => {
  const result = await queryWithRole(rol, 'SELECT * FROM vista_stock_bajo');
  return result.rows;
};

export const getProductosMasVendidos = async (rol) => {
  const result = await queryWithRole(rol, `
    SELECT p.id_producto, p.nombre, p.sku, p.marca,
           c.nombre AS categoria,
           SUM(dv.cantidad) AS total_vendido,
           SUM(dv.subtotal) AS total_ingresos
    FROM DetalleVenta dv
    JOIN Producto p ON dv.id_producto = p.id_producto
    JOIN Categoria c ON p.id_categoria = c.id_categoria
    JOIN Venta v ON dv.id_venta = v.id_venta
    WHERE v.estado = 'completada'
    GROUP BY p.id_producto, p.nombre, p.sku, p.marca, c.nombre
    HAVING SUM(dv.cantidad) > 0
    ORDER BY total_vendido DESC
    LIMIT 10
  `);
  return result.rows;
};

export const getVentasPorCategoria = async (rol) => {
  const result = await queryWithRole(rol, `
    SELECT c.nombre AS categoria,
           COUNT(DISTINCT v.id_venta) AS total_ventas,
           SUM(dv.cantidad) AS unidades_vendidas,
           SUM(dv.subtotal) AS total_ingresos
    FROM DetalleVenta dv
    JOIN Producto p ON dv.id_producto = p.id_producto
    JOIN Categoria c ON p.id_categoria = c.id_categoria
    JOIN Venta v ON dv.id_venta = v.id_venta
    WHERE v.estado = 'completada'
    GROUP BY c.nombre
    ORDER BY total_ingresos DESC
  `);
  return result.rows;
};

export const getVentasPorPeriodo = async (rol, fecha_inicio, fecha_fin) => {
  const result = await queryWithRole(rol, `
    WITH ventas_periodo AS (
      SELECT v.id_venta, v.fecha_venta, v.total, v.estado,
             c.nombre || ' ' || c.apellido AS cliente,
             e.nombre || ' ' || e.apellido AS empleado
      FROM Venta v
      JOIN Cliente c ON v.id_cliente = c.id_cliente
      LEFT JOIN Empleado e ON v.id_empleado = e.id_empleado
      WHERE v.fecha_venta BETWEEN $1 AND $2
        AND v.estado = 'completada'
    )
    SELECT *,
           SUM(total) OVER () AS total_periodo,
           COUNT(*) OVER () AS cantidad_ventas
    FROM ventas_periodo
    ORDER BY fecha_venta DESC
  `, [fecha_inicio, fecha_fin]);
  return result.rows;
};

export const getClientesConCompras = async (rol) => {
  const result = await queryWithRole(rol, `
    SELECT c.id_cliente, c.nombre, c.apellido, c.email, c.telefono,
           COUNT(v.id_venta) AS total_compras,
           SUM(v.total) AS total_gastado
    FROM Cliente c
    JOIN Venta v ON c.id_cliente = v.id_cliente
    WHERE c.id_cliente IN (
      SELECT DISTINCT id_cliente FROM Venta WHERE estado = 'completada'
    )
    GROUP BY c.id_cliente, c.nombre, c.apellido, c.email, c.telefono
    ORDER BY total_gastado DESC
  `);
  return result.rows;
};

export const getProductosSinVentas = async (rol) => {
  const result = await queryWithRole(rol, `
    SELECT p.id_producto, p.sku, p.nombre, p.marca,
           p.stock_actual, c.nombre AS categoria
    FROM Producto p
    JOIN Categoria c ON p.id_categoria = c.id_categoria
    WHERE NOT EXISTS (
      SELECT 1 FROM DetalleVenta dv
      JOIN Venta v ON dv.id_venta = v.id_venta
      WHERE dv.id_producto = p.id_producto
        AND v.estado = 'completada'
    )
    ORDER BY p.nombre
  `);
  return result.rows;
};

export const getVentasPorEmpleado = async (rol) => {
  const result = await queryWithRole(rol, `
    SELECT e.id_empleado,
           e.nombre || ' ' || e.apellido AS empleado,
           e.cargo,
           COUNT(v.id_venta) AS total_ventas,
           SUM(v.total) AS total_ingresos
    FROM Empleado e
    JOIN Venta v ON e.id_empleado = v.id_empleado
    WHERE v.estado = 'completada'
    GROUP BY e.id_empleado, e.nombre, e.apellido, e.cargo
    ORDER BY total_ingresos DESC
  `);
  return result.rows;
};
