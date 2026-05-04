import pool from '../config/db.js';

export const findUserByUsername = async (username) => {
  const result = await pool.query(
    'SELECT * FROM Usuario WHERE username = $1',
    [username]
  );
  return result.rows[0];
};

export const findUserById = async (id) => {
  const result = await pool.query(
    'SELECT id_usuario, username, rol FROM Usuario WHERE id_usuario = $1',
    [id]
  );
  return result.rows[0];
};

export const createUser = async (username, password_hash, rol) => {
  const result = await pool.query(
    'INSERT INTO Usuario (username, password_hash, rol) VALUES ($1, $2, $3) RETURNING id_usuario, username, rol',
    [username, password_hash, rol]
  );
  return result.rows[0];
};

export const createCliente = async (nombre, apellido, email, telefono, direccion, id_usuario) => {
  const result = await pool.query(
    'INSERT INTO Cliente (nombre, apellido, email, telefono, direccion, id_usuario) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
    [nombre, apellido, email, telefono, direccion, id_usuario]
  )
  return result.rows[0]
}