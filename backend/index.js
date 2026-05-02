import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import authRoutes from './src/routes/auth.routes.js';
import productoRoutes from './src/routes/producto.routes.js';
import clienteRoutes from './src/routes/cliente.routes.js';

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

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});