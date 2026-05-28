import pool, { queryWithRole } from '../config/db.js';

export const getAll = async (rol) => {
  const result = await queryWithRole(rol, `
    SELECT v.*,
      c.nombre || ' ' || c.apellido AS cliente,
      e.nombre || ' ' || e.apellido AS empleado
    FROM Venta v
    JOIN Cliente c ON v.id_cliente = c.id_cliente
    LEFT JOIN Empleado e ON v.id_empleado = e.id_empleado
    ORDER BY v.fecha_venta DESC
  `);
  return result.rows;
};

export const getById = async (rol, id) => {
  const result = await queryWithRole(rol, `
    SELECT v.*,
      c.nombre || ' ' || c.apellido AS cliente,
      e.nombre || ' ' || e.apellido AS empleado
    FROM Venta v
    JOIN Cliente c ON v.id_cliente = c.id_cliente
    LEFT JOIN Empleado e ON v.id_empleado = e.id_empleado
    WHERE v.id_venta = $1
  `, [id]);
  return result.rows[0];
};

export const getDetalle = async (rol, id_venta) => {
  const result = await queryWithRole(rol, `
    SELECT dv.*, p.nombre AS producto, p.sku
    FROM DetalleVenta dv
    JOIN Producto p ON dv.id_producto = p.id_producto
    WHERE dv.id_venta = $1
  `, [id_venta]);
  return result.rows;
};

export const getByCliente = async (rol, id_cliente) => {
  const result = await queryWithRole(rol, `
    SELECT v.*,
      e.nombre || ' ' || e.apellido AS empleado
    FROM Venta v
    LEFT JOIN Empleado e ON v.id_empleado = e.id_empleado
    WHERE v.id_cliente = $1
    ORDER BY v.fecha_venta DESC
  `, [id_cliente]);
  return result.rows;
};

// Crea una venta completa invocando el stored procedure sp_registrar_venta
export const create = async (rol, id_cliente, id_empleado, items) => {
  await pool.query(
    'CALL sp_registrar_venta($1, $2, $3::jsonb)',
    [id_cliente, id_empleado, JSON.stringify(items)]
  );
  const result = await pool.query(`
    SELECT v.*,
      c.nombre || ' ' || c.apellido AS cliente,
      e.nombre || ' ' || e.apellido AS empleado
    FROM Venta v
    JOIN Cliente c ON v.id_cliente = c.id_cliente
    LEFT JOIN Empleado e ON v.id_empleado = e.id_empleado
    WHERE v.id_cliente = $1
    ORDER BY v.fecha_venta DESC, v.id_venta DESC
    LIMIT 1
  `, [id_cliente]);
  return result.rows[0];
};

// Cancela una venta invocando el stored procedure sp_cancelar_venta
export const cancelar = async (rol, id_venta) => {
  await pool.query('CALL sp_cancelar_venta($1)', [id_venta]);
  const result = await pool.query(`
    SELECT v.*,
      c.nombre || ' ' || c.apellido AS cliente,
      e.nombre || ' ' || e.apellido AS empleado
    FROM Venta v
    JOIN Cliente c ON v.id_cliente = c.id_cliente
    LEFT JOIN Empleado e ON v.id_empleado = e.id_empleado
    WHERE v.id_venta = $1
  `, [id_venta]);
  return result.rows[0];
};
