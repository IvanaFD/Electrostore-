import pool from '../config/db.js';

export const getAll = async () => {
  const result = await pool.query(
    'SELECT * FROM Categoria ORDER BY nombre'
  );
  return result.rows;
};

export const getById = async (id) => {
  const result = await pool.query(
    'SELECT * FROM Categoria WHERE id_categoria = $1',
    [id]
  );
  return result.rows[0];
};

export const create = async ({ nombre, descripcion }) => {
  const result = await pool.query(
    'INSERT INTO Categoria (nombre, descripcion) VALUES ($1, $2) RETURNING *',
    [nombre, descripcion]
  );
  return result.rows[0];
};

export const update = async (id, { nombre, descripcion }) => {
  const result = await pool.query(
    'UPDATE Categoria SET nombre = $1, descripcion = $2 WHERE id_categoria = $3 RETURNING *',
    [nombre, descripcion, id]
  );
  return result.rows[0];
};

export const remove = async (id) => {
  const result = await pool.query(
    'DELETE FROM Categoria WHERE id_categoria = $1 RETURNING *',
    [id]
  );
  return result.rows[0];
};