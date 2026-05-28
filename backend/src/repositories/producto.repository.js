import { queryWithRole, DB_ROLE_MAP } from '../config/db.js';
import sequelize from '../config/sequelize.js';
import Producto from '../models/Producto.js';

// Ejecuta una operación Sequelize dentro de una transacción con el rol correcto
const withRole = async (rol, fn) => {
  const dbRole = DB_ROLE_MAP[rol];
  return await sequelize.transaction(async (t) => {
    if (dbRole) {
      await sequelize.query(`SET LOCAL ROLE ${dbRole}`, { transaction: t });
    }
    return await fn(t);
  });
};

// GET todos los productos (con JOIN a categoria y proveedor — SQL explícito)
export const getAll = async (rol) => {
  const result = await queryWithRole(rol, `
    SELECT p.*, c.nombre AS categoria, pr.nombre AS proveedor
    FROM Producto p
    JOIN Categoria c ON p.id_categoria = c.id_categoria
    JOIN Proveedor pr ON p.id_proveedor = pr.id_proveedor
    ORDER BY p.nombre
  `);
  return result.rows;
};

// GET producto por id (con JOIN — SQL explícito)
export const getById = async (rol, id) => {
  const result = await queryWithRole(rol, `
    SELECT p.*, c.nombre AS categoria, pr.nombre AS proveedor
    FROM Producto p
    JOIN Categoria c ON p.id_categoria = c.id_categoria
    JOIN Proveedor pr ON p.id_proveedor = pr.id_proveedor
    WHERE p.id_producto = $1
  `, [id]);
  return result.rows[0];
};

// GET producto por SKU — ORM (READ)
export const getBySku = async (rol, sku) =>
  withRole(rol, (t) => Producto.findOne({ where: { sku }, transaction: t }));

// GET productos por categoria (con JOIN — SQL explícito)
export const getByCategoria = async (rol, id_categoria) => {
  const result = await queryWithRole(rol, `
    SELECT p.*, c.nombre AS categoria, pr.nombre AS proveedor
    FROM Producto p
    JOIN Categoria c ON p.id_categoria = c.id_categoria
    JOIN Proveedor pr ON p.id_proveedor = pr.id_proveedor
    WHERE p.id_categoria = $1
    ORDER BY p.nombre
  `, [id_categoria]);
  return result.rows;
};

// GET productos con stock bajo (con JOIN — SQL explícito)
export const getStockBajo = async (rol) => {
  const result = await queryWithRole(rol, `
    SELECT p.*, c.nombre AS categoria
    FROM Producto p
    JOIN Categoria c ON p.id_categoria = c.id_categoria
    WHERE p.stock_actual <= p.stock_minimo
    ORDER BY p.stock_actual ASC
  `);
  return result.rows;
};

// POST crear producto — ORM (CREATE)
export const create = async (rol, datos) =>
  withRole(rol, (t) => Producto.create(datos, { transaction: t }));

// PUT actualizar producto — ORM (UPDATE)
export const update = async (rol, id, datos) =>
  withRole(rol, async (t) => {
    const producto = await Producto.findByPk(id, { transaction: t });
    if (!producto) return null;
    await producto.update(datos, { transaction: t });
    return producto;
  });

// DELETE eliminar producto — ORM (DELETE)
export const remove = async (rol, id) =>
  withRole(rol, async (t) => {
    const producto = await Producto.findByPk(id, { transaction: t });
    if (!producto) return null;
    await producto.destroy({ transaction: t });
    return producto;
  });
