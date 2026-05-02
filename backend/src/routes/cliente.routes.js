import express from 'express';
import * as repo from '../repositories/cliente.repository.js';
import { authMiddleware, roleGuard } from '../middlewares/auth.middleware.js';

const router = express.Router();

// GET /api/clientes
router.get('/', authMiddleware, roleGuard('admin', 'vendedor'), async (req, res) => {
  try {
    const clientes = await repo.getAll();
    res.json(clientes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener clientes' });
  }
});

// GET /api/clientes/me 
router.get('/me', authMiddleware, roleGuard('cliente'), async (req, res) => {
  try {
    const cliente = await repo.getByUsuario(req.user.id_usuario);
    if (!cliente) return res.status(404).json({ error: 'Perfil de cliente no encontrado' });
    res.json(cliente);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener perfil' });
  }
});

// GET /api/clientes/:id
router.get('/:id', authMiddleware, roleGuard('admin', 'vendedor'), async (req, res) => {
  try {
    const cliente = await repo.getById(req.params.id);
    if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado' });
    res.json(cliente);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener cliente' });
  }
});

// POST /api/clientes
router.post('/', authMiddleware, roleGuard('admin', 'vendedor'), async (req, res) => {
  try {
    const cliente = await repo.create(req.body);
    res.status(201).json(cliente);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'El email ya está registrado' });
    }
    console.error(err);
    res.status(500).json({ error: 'Error al crear cliente' });
  }
});

// PUT /api/clientes/:id
router.put('/:id', authMiddleware, roleGuard('admin', 'vendedor'), async (req, res) => {
  try {
    const cliente = await repo.update(req.params.id, req.body);
    if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado' });
    res.json(cliente);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar cliente' });
  }
});

// DELETE /api/clientes/:id
router.delete('/:id', authMiddleware, roleGuard('admin'), async (req, res) => {
  try {
    const cliente = await repo.remove(req.params.id);
    if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado' });
    res.json({ message: 'Cliente eliminado correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar cliente' });
  }
});

// PATCH /api/clientes/:id
router.patch('/:id', authMiddleware, async (req, res) => {
  try {
    const cliente = await repo.getById(req.params.id);
    if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado' });

    // Si es cliente, solo puede modificarse a sí mismo
    if (req.user.rol === 'cliente') {
      const miPerfil = await repo.getByUsuario(req.user.id_usuario);
      if (!miPerfil || miPerfil.id_cliente !== cliente.id_cliente) {
        return res.status(403).json({ error: 'No puedes modificar datos de otro cliente' });
      }
    }

    const actualizado = await repo.update(req.params.id, {
      nombre:    req.body.nombre    ?? cliente.nombre,
      apellido:  req.body.apellido  ?? cliente.apellido,
      email:     req.body.email     ?? cliente.email,
      telefono:  req.body.telefono  ?? cliente.telefono,
      direccion: req.body.direccion ?? cliente.direccion
    });

    res.json(actualizado);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar cliente' });
  }
});

export default router;