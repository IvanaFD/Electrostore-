import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import authRoutes from './src/routes/auth.routes.js';
import productoRoutes from './src/routes/producto.routes.js';
import clienteRoutes from './src/routes/cliente.routes.js';
import VentaRoutes from './src/routes/venta.routes.js';
import OrdenRoutes from './src/routes/orden.routes.js';
import categoriaRoutes from './src/routes/categoria.routes.js';
import reportRoutes from './src/routes/reporte.routes.js';
import empleadoRoutes from './src/routes/empleado.routes.js';
import proveedorRoutes from './src/routes/proveedor.routes.js';


const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

app.use('/api/auth', authRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/ventas', VentaRoutes);
app.use('/api/ordenes', OrdenRoutes);
app.use('/api/categorias', categoriaRoutes);
app.use('/api/reportes', reportRoutes);
app.use('/api/empleados',  empleadoRoutes);
app.use('/api/proveedores', proveedorRoutes);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});