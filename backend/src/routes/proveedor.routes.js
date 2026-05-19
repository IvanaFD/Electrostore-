import express from 'express';
import * as repo from '../repositories/proveedor.repository.js';
import { authMiddleware, roleGuard } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', authMiddleware, roleGuard('admin', 'vendedor', 'bodeguero', 'auditor'), async (req, res) => {
  try {
    const proveedores = await repo.getAll();
    res.json(proveedores);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener proveedores' });
  }
});

router.get('/:id', authMiddleware, roleGuard('admin', 'vendedor', 'bodeguero', 'auditor'), async (req, res) => {
  try {
    const proveedor = await repo.getById(req.params.id);
    if (!proveedor) return res.status(404).json({ error: 'Proveedor no encontrado' });
    res.json(proveedor);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener proveedor' });
  }
});

router.post('/', authMiddleware, roleGuard('admin'), async (req, res) => {
  try {
    const proveedor = await repo.create(req.body);
    res.status(201).json(proveedor);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear proveedor' });
  }
});

router.put('/:id', authMiddleware, roleGuard('admin'), async (req, res) => {
  try {
    const proveedor = await repo.update(req.params.id, req.body);
    if (!proveedor) return res.status(404).json({ error: 'Proveedor no encontrado' });
    res.json(proveedor);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar proveedor' });
  }
});

router.delete('/:id', authMiddleware, roleGuard('admin'), async (req, res) => {
  try {
    const proveedor = await repo.remove(req.params.id);
    if (!proveedor) return res.status(404).json({ error: 'Proveedor no encontrado' });
    res.json({ message: 'Proveedor eliminado correctamente' });
  } catch (err) {
    if (err.code === '23503') {
      return res.status(409).json({ error: 'No se puede eliminar, tiene productos asociados' });
    }
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar proveedor' });
  }
});

export default router;