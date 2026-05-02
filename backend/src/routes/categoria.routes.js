import express from 'express';
import * as repo from '../repositories/categoria.repository.js';
import { authMiddleware, roleGuard } from '../middlewares/auth.middleware.js';

const router = express.Router();

// GET /api/categorias
router.get('/', async (req, res) => {
  try {
    const categorias = await repo.getAll();
    res.json(categorias);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener categorias' });
  }
});

// GET /api/categorias/:id
router.get('/:id', async (req, res) => {
  try {
    const categoria = await repo.getById(req.params.id);
    if (!categoria) return res.status(404).json({ error: 'Categoria no encontrada' });
    res.json(categoria);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener categoria' });
  }
});

// POST /api/categorias
router.post('/', authMiddleware, roleGuard('admin'), async (req, res) => {
  try {
    const categoria = await repo.create(req.body);
    res.status(201).json(categoria);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear categoria' });
  }
});

// PUT /api/categorias/:id
router.put('/:id', authMiddleware, roleGuard('admin'), async (req, res) => {
  try {
    const categoria = await repo.update(req.params.id, req.body);
    if (!categoria) return res.status(404).json({ error: 'Categoria no encontrada' });
    res.json(categoria);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar categoria' });
  }
});

// DELETE /api/categorias/:id
router.delete('/:id', authMiddleware, roleGuard('admin'), async (req, res) => {
  try {
    const categoria = await repo.remove(req.params.id);
    if (!categoria) return res.status(404).json({ error: 'Categoria no encontrada' });
    res.json({ message: 'Categoria eliminada correctamente' });
  } catch (err) {
    if (err.code === '23503') {
      return res.status(409).json({ error: 'No se puede eliminar, tiene productos asociados' });
    }
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar categoria' });
  }
});

export default router;