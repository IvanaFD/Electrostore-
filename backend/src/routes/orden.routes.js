import express from 'express';
import * as repo from '../repositories/orden.repository.js';
import { authMiddleware, roleGuard } from '../middlewares/auth.middleware.js';

const router = express.Router();

// GET /api/ordenes
router.get('/', authMiddleware, roleGuard('admin', 'vendedor'), async (req, res) => {
  try {
    const ordenes = await repo.getAll();
    res.json(ordenes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener órdenes' });
  }
});

// GET /api/ordenes/:id
router.get('/:id', authMiddleware, roleGuard('admin', 'vendedor'), async (req, res) => {
  try {
    const orden = await repo.getById(req.params.id);
    if (!orden) return res.status(404).json({ error: 'Orden no encontrada' });

    const detalle = await repo.getDetalle(req.params.id);
    res.json({ ...orden, detalle });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener orden' });
  }
});

// POST /api/ordenes
router.post('/', authMiddleware, roleGuard('admin', 'vendedor'), async (req, res) => {
  try {
    const { id_proveedor, id_empleado, items } = req.body;

    if (!id_proveedor) return res.status(400).json({ error: 'Proveedor es requerido' });
    if (!id_empleado) return res.status(400).json({ error: 'Empleado es requerido' });
    if (!items || items.length === 0) return res.status(400).json({ error: 'Debe incluir al menos un producto' });

    const orden = await repo.create(id_proveedor, id_empleado, items);
    res.status(201).json(orden);
  } catch (err) {
    if (err.message.includes('no encontrado')) {
      return res.status(400).json({ error: err.message });
    }
    console.error(err);
    res.status(500).json({ error: 'Error al crear orden' });
  }
});

// PATCH /api/ordenes/:id/recibir
router.patch('/:id/recibir', authMiddleware, roleGuard('admin', 'vendedor'), async (req, res) => {
  try {
    const orden = await repo.recibirOrden(req.params.id);
    res.json(orden);
  } catch (err) {
    if (err.message.includes('recibida') || err.message.includes('no encontrada')) {
      return res.status(400).json({ error: err.message });
    }
    console.error(err);
    res.status(500).json({ error: 'Error al recibir orden' });
  }
});

export default router;