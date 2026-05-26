import { queryWithRole } from '../config/db.js';

export const getAll = async (rol) => {
  const result = await queryWithRole(rol, `
    SELECT c.*, u.username, u.rol
    FROM Cliente c
    LEFT JOIN Usuario u ON c.id_usuario = u.id_usuario
    ORDER BY c.nombre
  `);
  return result.rows;
};

export const getById = async (rol, id) => {
  const result = await queryWithRole(rol, `
    SELECT c.*, u.username, u.rol
    FROM Cliente c
    LEFT JOIN Usuario u ON c.id_usuario = u.id_usuario
    WHERE c.id_cliente = $1
  `, [id]);
  return result.rows[0];
};

export const getByUsuario = async (rol, id_usuario) => {
  const result = await queryWithRole(rol,
    'SELECT * FROM Cliente WHERE id_usuario = $1',
    [id_usuario]
  );
  return result.rows[0];
};

export const create = async (rol, { nombre, apellido, email, telefono, direccion, id_usuario = null }) => {
  const result = await queryWithRole(rol, `
    INSERT INTO Cliente (nombre, apellido, email, telefono, direccion, id_usuario)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `, [nombre, apellido, email, telefono, direccion, id_usuario]);
  return result.rows[0];
};

export const update = async (rol, id, { nombre, apellido, email, telefono, direccion }) => {
  const result = await queryWithRole(rol, `
    UPDATE Cliente SET
      nombre = $1, apellido = $2, email = $3,
      telefono = $4, direccion = $5
    WHERE id_cliente = $6
    RETURNING *
  `, [nombre, apellido, email, telefono, direccion, id]);
  return result.rows[0];
};

export const remove = async (rol, id) => {
  const result = await queryWithRole(rol,
    'DELETE FROM Cliente WHERE id_cliente = $1 RETURNING *',
    [id]
  );
  return result.rows[0];
};
