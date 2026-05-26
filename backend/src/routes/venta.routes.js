import express from 'express';
import * as repo from '../repositories/venta.repository.js';
import { getByUsuario } from '../repositories/cliente.repository.js';
import { authMiddleware, roleGuard } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', authMiddleware, roleGuard('admin', 'vendedor', 'auditor'), async (req, res) => {
  try {
    const ventas = await repo.getAll(req.user.rol);
    res.json(ventas);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener ventas' });
  }
});

router.get('/mis-compras', authMiddleware, roleGuard('cliente'), async (req, res) => {
  try {
    const cliente = await getByUsuario(req.user.rol, req.user.id_usuario);
    if (!cliente) return res.status(404).json({ error: 'Perfil de cliente no encontrado' });

    const ventas = await repo.getByCliente(req.user.rol, cliente.id_cliente);

    const ventasConDetalle = await Promise.all(
      ventas.map(async (v) => ({
        ...v,
        detalle: await repo.getDetalle(req.user.rol, v.id_venta)
      }))
    );

    res.json(ventasConDetalle);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener compras' });
  }
});

router.get('/:id', authMiddleware, roleGuard('admin', 'vendedor', 'auditor'), async (req, res) => {
  try {
    const venta = await repo.getById(req.user.rol, req.params.id);
    if (!venta) return res.status(404).json({ error: 'Venta no encontrada' });

    const detalle = await repo.getDetalle(req.user.rol, req.params.id);
    res.json({ ...venta, detalle });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener venta' });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    let { id_cliente, items } = req.body;
    let id_empleado = null;

    if (req.user.rol === 'cliente') {
      const cliente = await getByUsuario(req.user.rol, req.user.id_usuario);
      if (!cliente) return res.status(404).json({ error: 'Perfil de cliente no encontrado' });
      id_cliente = cliente.id_cliente;
    } else {
      id_empleado = req.body.id_empleado || null;
    }

    if (!id_cliente) return res.status(400).json({ error: 'Cliente es requerido' });
    if (!items || items.length === 0) return res.status(400).json({ error: 'Debe incluir al menos un producto' });

    const venta = await repo.create(req.user.rol, id_cliente, id_empleado, items);
    res.status(201).json(venta);
  } catch (err) {
    if (err.message.includes('Stock insuficiente') || err.message.includes('no encontrado')) {
      return res.status(400).json({ error: err.message });
    }
    console.error(err);
    res.status(500).json({ error: 'Error al registrar venta' });
  }
});

router.patch('/:id/cancelar', authMiddleware, roleGuard('admin', 'vendedor'), async (req, res) => {
  try {
    const venta = await repo.cancelar(req.user.rol, req.params.id);
    res.json(venta);
  } catch (err) {
    if (err.message.includes('cancelada') || err.message.includes('no encontrada')) {
      return res.status(400).json({ error: err.message });
    }
    console.error(err);
    res.status(500).json({ error: 'Error al cancelar venta' });
  }
});

export default router;
