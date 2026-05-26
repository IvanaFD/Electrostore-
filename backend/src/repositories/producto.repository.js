import { queryWithRole } from '../config/db.js';

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

export const getBySku = async (rol, sku) => {
  const result = await queryWithRole(rol, `SELECT * FROM Producto WHERE sku = $1`, [sku]);
  return result.rows[0];
};

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

export const create = async (rol, { sku, nombre, marca, precio_venta, precio_costo, stock_actual, stock_minimo, descripcion, imagen_url, id_categoria, id_proveedor }) => {
  const result = await queryWithRole(rol, `
    INSERT INTO Producto (sku, nombre, marca, precio_venta, precio_costo, stock_actual, stock_minimo, descripcion, imagen_url, id_categoria, id_proveedor)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    RETURNING *
  `, [sku, nombre, marca, precio_venta, precio_costo, stock_actual, stock_minimo, descripcion, imagen_url, id_categoria, id_proveedor]);
  return result.rows[0];
};

export const update = async (rol, id, { nombre, marca, precio_venta, precio_costo, stock_actual, stock_minimo, descripcion, imagen_url, id_categoria, id_proveedor }) => {
  const result = await queryWithRole(rol, `
    UPDATE Producto SET
      nombre = $1, marca = $2, precio_venta = $3, precio_costo = $4,
      stock_actual = $5, stock_minimo = $6, descripcion = $7,
      imagen_url = $8, id_categoria = $9, id_proveedor = $10
    WHERE id_producto = $11
    RETURNING *
  `, [nombre, marca, precio_venta, precio_costo, stock_actual, stock_minimo, descripcion, imagen_url, id_categoria, id_proveedor, id]);
  return result.rows[0];
};

export const remove = async (rol, id) => {
  const result = await queryWithRole(rol, `DELETE FROM Producto WHERE id_producto = $1 RETURNING *`, [id]);
  return result.rows[0];
};