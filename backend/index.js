import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import yaml from 'js-yaml';
import swaggerUi from 'swagger-ui-express';
import authRoutes from './src/routes/auth.routes.js';
import productoRoutes from './src/routes/producto.routes.js';
import clienteRoutes from './src/routes/cliente.routes.js';
import VentaRoutes from './src/routes/venta.routes.js';
import OrdenRoutes from './src/routes/orden.routes.js';
import categoriaRoutes from './src/routes/categoria.routes.js';
import reportRoutes from './src/routes/reporte.routes.js';
import empleadoRoutes from './src/routes/empleado.routes.js';
import proveedorRoutes from './src/routes/proveedor.routes.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const swaggerDoc = yaml.load(readFileSync(join(__dirname, 'openapi.yaml'), 'utf8'));


const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));

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