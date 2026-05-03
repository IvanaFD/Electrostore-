import express from 'express';
import * as repo from '../repositories/reporte.repository.js';
import { authMiddleware, roleGuard } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Crear view al iniciar 
repo.createView().catch(console.error);

// GET /api/reportes/stock-bajo - usa VIEW
router.get('/stock-bajo', authMiddleware, roleGuard('admin', 'vendedor'), async (req, res) => {
  try {
    const data = await repo.getStockBajo();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener reporte de stock bajo' });
  }
});

// GET /api/reportes/productos-mas-vendidos - GROUP BY + HAVING
router.get('/productos-mas-vendidos', authMiddleware, roleGuard('admin', 'vendedor'), async (req, res) => {
  try {
    const data = await repo.getProductosMasVendidos();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener reporte' });
  }
});

// GET /api/reportes/ventas-por-categoria - GROUP BY + agregacion
router.get('/ventas-por-categoria', authMiddleware, roleGuard('admin', 'vendedor'), async (req, res) => {
  try {
    const data = await repo.getVentasPorCategoria();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener reporte' });
  }
});

// GET /api/reportes/ventas-por-periodo?fecha_inicio=2026-01-01&fecha_fin=2026-12-31 - CTE
router.get('/ventas-por-periodo', authMiddleware, roleGuard('admin', 'vendedor'), async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin } = req.query;
    if (!fecha_inicio || !fecha_fin) {
      return res.status(400).json({ error: 'fecha_inicio y fecha_fin son requeridas' });
    }
    const data = await repo.getVentasPorPeriodo(fecha_inicio, fecha_fin);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener reporte' });
  }
});

// GET /api/reportes/clientes-con-compras - SUBQUERY IN
router.get('/clientes-con-compras', authMiddleware, roleGuard('admin', 'vendedor'), async (req, res) => {
  try {
    const data = await repo.getClientesConCompras();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener reporte' });
  }
});

// GET /api/reportes/productos-sin-ventas - SUBQUERY EXISTS
router.get('/productos-sin-ventas', authMiddleware, roleGuard('admin', 'vendedor'), async (req, res) => {
  try {
    const data = await repo.getProductosSinVentas();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener reporte' });
  }
});

// GET /api/reportes/ventas-por-empleado - GROUP BY
router.get('/ventas-por-empleado', authMiddleware, roleGuard('admin', 'vendedor'), async (req, res) => {
  try {
    const data = await repo.getVentasPorEmpleado();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener reporte' });
  }
});

export default router;