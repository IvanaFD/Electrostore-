import { queryWithRole } from '../config/db.js';

export const getAll = async (rol) => {
  const result = await queryWithRole(rol, 'SELECT * FROM Proveedor ORDER BY nombre');
  return result.rows;
};

export const getById = async (rol, id) => {
  const result = await queryWithRole(rol,
    'SELECT * FROM Proveedor WHERE id_proveedor = $1',
    [id]
  );
  return result.rows[0];
};

export const create = async (rol, { nombre, nombre_contacto, telefono, email, direccion }) => {
  const result = await queryWithRole(rol, `
    INSERT INTO Proveedor (nombre, nombre_contacto, telefono, email, direccion)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `, [nombre, nombre_contacto, telefono, email, direccion]);
  return result.rows[0];
};

export const update = async (rol, id, { nombre, nombre_contacto, telefono, email, direccion }) => {
  const result = await queryWithRole(rol, `
    UPDATE Proveedor SET
      nombre = $1, nombre_contacto = $2, telefono = $3,
      email = $4, direccion = $5
    WHERE id_proveedor = $6
    RETURNING *
  `, [nombre, nombre_contacto, telefono, email, direccion, id]);
  return result.rows[0];
};

export const remove = async (rol, id) => {
  const result = await queryWithRole(rol,
    'DELETE FROM Proveedor WHERE id_proveedor = $1 RETURNING *',
    [id]
  );
  return result.rows[0];
};
