import { queryWithRole } from '../config/db.js';

export const getAll = async (rol) => {
  const result = await queryWithRole(rol, `
    SELECT e.*, u.username, u.rol
    FROM Empleado e
    LEFT JOIN Usuario u ON e.id_usuario = u.id_usuario
    ORDER BY e.id_empleado
  `);
  return result.rows;
};

export const getById = async (rol, id) => {
  const result = await queryWithRole(rol, `
    SELECT e.*, u.username, u.rol
    FROM Empleado e
    LEFT JOIN Usuario u ON e.id_usuario = u.id_usuario
    WHERE e.id_empleado = $1
  `, [id]);
  return result.rows[0];
};

export const create = async (rol, { nombre, apellido, email, telefono, cargo }) => {
  const result = await queryWithRole(rol, `
    INSERT INTO Empleado (nombre, apellido, email, telefono, cargo)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `, [nombre, apellido, email, telefono, cargo]);
  return result.rows[0];
};

export const update = async (rol, id, { nombre, apellido, email, telefono, cargo }) => {
  const result = await queryWithRole(rol, `
    UPDATE Empleado SET
      nombre = $1, apellido = $2, email = $3,
      telefono = $4, cargo = $5
    WHERE id_empleado = $6
    RETURNING *
  `, [nombre, apellido, email, telefono, cargo, id]);
  return result.rows[0];
};

export const remove = async (rol, id) => {
  const result = await queryWithRole(rol,
    'DELETE FROM Empleado WHERE id_empleado = $1 RETURNING *',
    [id]
  );
  return result.rows[0];
};
