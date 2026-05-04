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

// GET /api/reportes/ exportar-csv?tipo =
router.get('/exportar-csv', authMiddleware, roleGuard('admin', 'vendedor'), async (req, res) => {
  try {
    const tipo = req.query.tipo || 'productos-mas-vendidos'
    let data = []
    let headers = []

    if (tipo === 'productos-mas-vendidos') {
      data = await repo.getProductosMasVendidos()
      headers = ['id_producto', 'nombre', 'sku', 'marca', 'categoria', 'total_vendido', 'total_ingresos']
    } else if (tipo === 'ventas-por-categoria') {
      data = await repo.getVentasPorCategoria()
      headers = ['categoria', 'total_ventas', 'unidades_vendidas', 'total_ingresos']
    } else if (tipo === 'clientes-con-compras') {
      data = await repo.getClientesConCompras()
      headers = ['id_cliente', 'nombre', 'apellido', 'email', 'telefono', 'total_compras', 'total_gastado']
    } else if (tipo === 'stock-bajo') {
      data = await repo.getStockBajo()
      headers = ['id_producto', 'sku', 'nombre', 'marca', 'stock_actual', 'stock_minimo', 'categoria']
    } else if (tipo === 'ventas-por-empleado') {
      data = await repo.getVentasPorEmpleado()
      headers = ['id_empleado', 'empleado', 'cargo', 'total_ventas', 'total_ingresos']
    } else if (tipo === 'productos-sin-ventas') {
      data = await repo.getProductosSinVentas()
      headers = ['sku', 'nombre', 'marca', 'stock_actual', 'categoria']
    } else if (tipo === 'ventas-por-periodo') {
      const { fecha_inicio, fecha_fin } = req.query
      data = await repo.getVentasPorPeriodo(fecha_inicio, fecha_fin)
      headers = ['id_venta', 'fecha_venta', 'cliente', 'empleado', 'total', 'estado']
    }

    const csv = [
      headers.join(','),
      ...data.map(row => headers.map(h => `"${row[h] ?? ''}"`).join(','))
    ].join('\n')

    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', `attachment; filename="${tipo}.csv"`)
    res.send('\uFEFF' + csv)  
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al exportar' })
  }
})

export default router;