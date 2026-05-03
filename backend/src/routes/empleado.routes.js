import express from 'express';
import * as repo from '../repositories/empleado.repository.js';
import { authMiddleware, roleGuard } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', authMiddleware, roleGuard('admin', 'vendedor'), async (req, res) => {
  try {
    const empleados = await repo.getAll();
    res.json(empleados);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener empleados' });
  }
});

router.get('/:id', authMiddleware, roleGuard('admin', 'vendedor'), async (req, res) => {
  try {
    const empleado = await repo.getById(req.params.id);
    if (!empleado) return res.status(404).json({ error: 'Empleado no encontrado' });
    res.json(empleado);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener empleado' });
  }
});

router.post('/', authMiddleware, roleGuard('admin'), async (req, res) => {
  try {
    const empleado = await repo.create(req.body);
    res.status(201).json(empleado);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'El email ya está registrado' });
    }
    if (err.code === '23514') {
      return res.status(400).json({ error: 'Cargo inválido, debe ser vendedor, supervisor o bodeguero' });
    }
    console.error(err);
    res.status(500).json({ error: 'Error al crear empleado' });
  }
});

router.put('/:id', authMiddleware, roleGuard('admin'), async (req, res) => {
  try {
    const empleado = await repo.update(req.params.id, req.body);
    if (!empleado) return res.status(404).json({ error: 'Empleado no encontrado' });
    res.json(empleado);
  } catch (err) {
    if (err.code === '23514') {
      return res.status(400).json({ error: 'Cargo inválido, debe ser vendedor, supervisor o bodeguero' });
    }
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar empleado' });
  }
});

router.delete('/:id', authMiddleware, roleGuard('admin'), async (req, res) => {
  try {
    const empleado = await repo.remove(req.params.id);
    if (!empleado) return res.status(404).json({ error: 'Empleado no encontrado' });
    res.json({ message: 'Empleado eliminado correctamente' });
  } catch (err) {
    if (err.code === '23503') {
      return res.status(409).json({ error: 'No se puede eliminar, el empleado tiene ventas u órdenes asociadas' });
    }
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar empleado' });
  }
});

export default router;