import pool, { queryWithRole, DB_ROLE_MAP } from '../config/db.js';

export const getAll = async (rol) => {
  const result = await queryWithRole(rol, `
    SELECT o.*,
      p.nombre AS proveedor,
      e.nombre || ' ' || e.apellido AS empleado
    FROM OrdenCompra o
    JOIN Proveedor p ON o.id_proveedor = p.id_proveedor
    JOIN Empleado e ON o.id_empleado = e.id_empleado
    ORDER BY o.fecha_orden DESC
  `);
  return result.rows;
};

export const getById = async (rol, id) => {
  const result = await queryWithRole(rol, `
    SELECT o.*,
      p.nombre AS proveedor,
      e.nombre || ' ' || e.apellido AS empleado
    FROM OrdenCompra o
    JOIN Proveedor p ON o.id_proveedor = p.id_proveedor
    JOIN Empleado e ON o.id_empleado = e.id_empleado
    WHERE o.id_orden = $1
  `, [id]);
  return result.rows[0];
};

export const getDetalle = async (rol, id_orden) => {
  const result = await queryWithRole(rol, `
    SELECT d.*, p.nombre AS producto, p.sku
    FROM DetalleOrden d
    JOIN Producto p ON d.id_producto = p.id_producto
    WHERE d.id_orden = $1
  `, [id_orden]);
  return result.rows;
};

export const create = async (rol, id_proveedor, id_empleado, items) => {
  const dbRole = DB_ROLE_MAP[rol];
  const client = await pool.connect();
  try {
    if (dbRole) {
      await client.query(`SET ROLE ${dbRole}`);
      await client.query(`SET search_path TO public`);
    }
    await client.query('BEGIN');

    const ordenResult = await client.query(`
      INSERT INTO OrdenCompra (estado, id_proveedor, id_empleado)
      VALUES ('pendiente', $1, $2)
      RETURNING *
    `, [id_proveedor, id_empleado]);

    const orden = ordenResult.rows[0];

    for (const item of items) {
      const productoResult = await client.query(
        'SELECT id_producto FROM Producto WHERE id_producto = $1',
        [item.id_producto]
      );

      if (productoResult.rows.length === 0) throw new Error(`Producto ${item.id_producto} no encontrado`);

      await client.query(`
        INSERT INTO DetalleOrden (id_orden, id_producto, cantidad, precio_compra)
        VALUES ($1, $2, $3, $4)
      `, [orden.id_orden, item.id_producto, item.cantidad, item.precio_compra]);
    }

    await client.query('COMMIT');
    return orden;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    await client.query('RESET ROLE').catch(() => {});
    client.release();
  }
};

export const recibirOrden = async (rol, id_orden) => {
  const dbRole = DB_ROLE_MAP[rol];
  const client = await pool.connect();
  try {
    if (dbRole) {
      await client.query(`SET ROLE ${dbRole}`);
      await client.query(`SET search_path TO public`);
    }
    await client.query('BEGIN');

    const orden = await client.query('SELECT * FROM OrdenCompra WHERE id_orden = $1', [id_orden]);
    if (!orden.rows[0]) throw new Error('Orden no encontrada');
    if (orden.rows[0].estado === 'recibida') throw new Error('La orden ya fue recibida');

    const detalle = await client.query('SELECT * FROM DetalleOrden WHERE id_orden = $1', [id_orden]);

    for (const item of detalle.rows) {
      await client.query(`
        UPDATE Producto SET stock_actual = stock_actual + $1
        WHERE id_producto = $2
      `, [item.cantidad, item.id_producto]);
    }

    const result = await client.query(`
      UPDATE OrdenCompra SET estado = 'recibida'
      WHERE id_orden = $1
      RETURNING *
    `, [id_orden]);

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

export const cancelarOrden = async (rol, id) => {
  const dbRole = DB_ROLE_MAP[rol];
  const client = await pool.connect();
  try {
    if (dbRole) {
      await client.query(`SET ROLE ${dbRole}`);
      await client.query(`SET search_path TO public`);
    }
    await client.query('BEGIN');

    const orden = await client.query(
      'SELECT * FROM OrdenCompra WHERE id_orden = $1 AND estado = $2',
      [id, 'pendiente']
    );
    if (!orden.rows[0]) return null;

    await client.query('DELETE FROM DetalleOrden WHERE id_orden = $1', [id]);
    await client.query('DELETE FROM OrdenCompra WHERE id_orden = $1', [id]);

    await client.query('COMMIT');
    return orden.rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    await client.query('RESET ROLE').catch(() => {});
    client.release();
  }
};
