import express from 'express';
import * as repo from '../repositories/producto.repository.js';
import { authMiddleware, roleGuard } from '../middlewares/auth.middleware.js';

const router = express.Router();

// GET /api/productos - todos (publico para clientes ver catalogo)
router.get('/', async (req, res) => {
  try {
    const productos = await repo.getAll();
    res.json(productos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

// GET /api/productos/stock-bajo
router.get('/stock-bajo', authMiddleware, roleGuard('admin', 'vendedor'), async (req, res) => {
  try {
    const productos = await repo.getStockBajo();
    res.json(productos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener productos con stock bajo' });
  }
});

// GET /api/productos/:id
router.get('/:id', async (req, res) => {
  try {
    const producto = await repo.getById(req.params.id);
    if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(producto);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener producto' });
  }
});

// POST /api/productos
router.post('/', authMiddleware, roleGuard('admin', 'vendedor'), async (req, res) => {
  try {
    const existe = await repo.getBySku(req.body.sku);
    if (existe) return res.status(409).json({ error: 'El SKU ya existe' });

    const producto = await repo.create(req.body);
    res.status(201).json(producto);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear producto' });
  }
});

// PUT /api/productos/:id
router.put('/:id', authMiddleware, roleGuard('admin', 'vendedor'), async (req, res) => {
  try {
    const producto = await repo.update(req.params.id, req.body);
    if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(producto);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar producto' });
  }
});

// DELETE /api/productos/:id
router.delete('/:id', authMiddleware, roleGuard('admin'), async (req, res) => {
  try {
    const producto = await repo.remove(req.params.id);
    if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json({ message: 'Producto eliminado correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
});

export default router;