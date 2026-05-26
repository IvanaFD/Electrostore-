import { queryWithRole } from '../config/db.js';

export const getAll = async (rol) => {
  const result = await queryWithRole(rol, 'SELECT * FROM Categoria ORDER BY nombre');
  return result.rows;
};

export const getById = async (rol, id) => {
  const result = await queryWithRole(rol, 'SELECT * FROM Categoria WHERE id_categoria = $1', [id]);
  return result.rows[0];
};

export const create = async (rol, { nombre, descripcion }) => {
  const result = await queryWithRole(rol,
    'INSERT INTO Categoria (nombre, descripcion) VALUES ($1, $2) RETURNING *',
    [nombre, descripcion]
  );
  return result.rows[0];
};

export const update = async (rol, id, { nombre, descripcion }) => {
  const result = await queryWithRole(rol,
    'UPDATE Categoria SET nombre = $1, descripcion = $2 WHERE id_categoria = $3 RETURNING *',
    [nombre, descripcion, id]
  );
  return result.rows[0];
};

export const remove = async (rol, id) => {
  const result = await queryWithRole(rol,
    'DELETE FROM Categoria WHERE id_categoria = $1 RETURNING *',
    [id]
  );
  return result.rows[0];
};
