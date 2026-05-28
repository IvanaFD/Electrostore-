import express from 'express';
import * as repo from '../repositories/producto.repository.js';
import { authMiddleware, roleGuard } from '../middlewares/auth.middleware.js';
import { queryWithRole } from '../config/db.js';

const router = express.Router();

// GET /api/productos 
router.get('/', async (req, res) => {
  try {
    const productos = await repo.getAll(req.user?.rol);
    res.json(productos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

// GET /api/productos/:id/verificar-stock?cantidad=N
router.get('/:id/verificar-stock', authMiddleware, async (req, res) => {
  try {
    const cantidad = parseInt(req.query.cantidad);
    if (!cantidad || cantidad <= 0) {
      return res.status(400).json({ error: 'Parámetro cantidad requerido y debe ser mayor a 0' });
    }
    const result = await queryWithRole(req.user.rol,
      'SELECT * FROM sp_verificar_stock($1, $2)',
      [req.params.id, cantidad]
    );
    res.json(result.rows[0]);
  } catch (err) {
    if (err.message?.includes('no encontrado')) return res.status(404).json({ error: err.message });
    console.error(err);
    res.status(500).json({ error: 'Error al verificar stock' });
  }
});

// GET /api/productos/stock-bajo
router.get('/stock-bajo', authMiddleware, roleGuard('admin', 'vendedor', 'bodeguero', 'auditor'), async (req, res) => {
  try {
    const productos = await repo.getStockBajo(req.user.rol);
    res.json(productos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener productos con stock bajo' });
  }
});

// GET /api/productos/:id
router.get('/:id', async (req, res) => {
  try {
    const producto = await repo.getById(req.user?.rol, req.params.id);
    if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(producto);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener producto' });
  }
});

// POST /api/productos
router.post('/', authMiddleware, roleGuard('admin', 'bodeguero'), async (req, res) => {
  try {
    const existe = await repo.getBySku(req.user.rol, req.body.sku);
    if (existe) return res.status(409).json({ error: 'El SKU ya existe' });

    const producto = await repo.create(req.user.rol, req.body);
    res.status(201).json(producto);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear producto' });
  }
});

// PUT /api/productos/:id
router.put('/:id', authMiddleware, roleGuard('admin', 'bodeguero'), async (req, res) => {
  try {
    const producto = await repo.update(req.user.rol, req.params.id, req.body);
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
    const producto = await repo.remove(req.user.rol, req.params.id)
    if (!producto) return res.status(404).json({ error: 'Producto no encontrado' })
    res.json({ message: 'Producto eliminado correctamente' })
  } catch (err) {
    if (err.code === '23503') {
      return res.status(409).json({ error: 'No se puede eliminar, el producto tiene ventas u órdenes asociadas' })
    }
    console.error(err)
    res.status(500).json({ error: 'Error al eliminar producto' })
  }
})

export default router;