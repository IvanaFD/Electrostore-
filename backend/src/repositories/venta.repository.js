import pool, { queryWithRole, DB_ROLE_MAP } from '../config/db.js';

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

export const create = async (rol, id_cliente, id_empleado, items) => {
  const dbRole = DB_ROLE_MAP[rol];
  const client = await pool.connect();
  try {
    if (dbRole) {
      await client.query(`SET ROLE ${dbRole}`);
      await client.query(`SET search_path TO public`);
    }
    await client.query('BEGIN');

    let total = 0;
    for (const item of items) {
      const stockResult = await client.query(
        'SELECT stock_actual, precio_venta FROM Producto WHERE id_producto = $1',
        [item.id_producto]
      );

      if (stockResult.rows.length === 0) throw new Error(`Producto ${item.id_producto} no encontrado`);

      const { stock_actual, precio_venta } = stockResult.rows[0];
      if (stock_actual < item.cantidad) throw new Error(`Stock insuficiente para producto ${item.id_producto}`);

      item.precio_unitario = parseFloat(precio_venta);
      item.subtotal = item.precio_unitario * item.cantidad;
      total += item.subtotal;
    }

    const ventaResult = await client.query(`
      INSERT INTO Venta (total, estado, id_cliente, id_empleado)
      VALUES ($1, 'completada', $2, $3)
      RETURNING *
    `, [total, id_cliente, id_empleado]);

    const venta = ventaResult.rows[0];

    for (const item of items) {
      await client.query(`
        INSERT INTO DetalleVenta (id_venta, id_producto, cantidad, precio_unitario, subtotal)
        VALUES ($1, $2, $3, $4, $5)
      `, [venta.id_venta, item.id_producto, item.cantidad, item.precio_unitario, item.subtotal]);

      await client.query(`
        UPDATE Producto SET stock_actual = stock_actual - $1
        WHERE id_producto = $2
      `, [item.cantidad, item.id_producto]);
    }

    await client.query('COMMIT');
    return venta;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    await client.query('RESET ROLE').catch(() => {});
    client.release();
  }
};

export const cancelar = async (rol, id_venta) => {
  const dbRole = DB_ROLE_MAP[rol];
  const client = await pool.connect();
  try {
    if (dbRole) {
      await client.query(`SET ROLE ${dbRole}`);
      await client.query(`SET search_path TO public`);
    }
    await client.query('BEGIN');

    const venta = await client.query('SELECT * FROM Venta WHERE id_venta = $1', [id_venta]);
    if (!venta.rows[0]) throw new Error('Venta no encontrada');
    if (venta.rows[0].estado === 'cancelada') throw new Error('La venta ya está cancelada');

    const detalle = await client.query('SELECT * FROM DetalleVenta WHERE id_venta = $1', [id_venta]);

    for (const item of detalle.rows) {
      await client.query(`
        UPDATE Producto SET stock_actual = stock_actual + $1
        WHERE id_producto = $2
      `, [item.cantidad, item.id_producto]);
    }

    const result = await client.query(`
      UPDATE Venta SET estado = 'cancelada'
      WHERE id_venta = $1
      RETURNING *
    `, [id_venta]);

    await client.query('COMMIT');
    return result.rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    await client.query('RESET ROLE').catch(() => {});
    client.release();
  }
};
