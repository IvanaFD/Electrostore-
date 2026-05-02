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