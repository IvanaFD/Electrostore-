<template>
  <div class="dashboard">
    <div class="page-header">
      <h1>Dashboard</h1>
      <p>Resumen general de ElectroStore</p>
    </div>

    <!-- Stats -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon teal"><Package :size="22" /></div>
        <div>
          <p class="stat-label">Productos</p>
          <p class="stat-value">{{ stats.productos }}</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon green"><ShoppingCart :size="22" /></div>
        <div>
          <p class="stat-label">Ventas totales</p>
          <p class="stat-value">{{ stats.ventas }}</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon dark"><Users :size="22" /></div>
        <div>
          <p class="stat-label">Clientes</p>
          <p class="stat-value">{{ stats.clientes }}</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon red"><AlertTriangle :size="22" /></div>
        <div>
          <p class="stat-label">Stock bajo</p>
          <p class="stat-value">{{ stockBajo.length }}</p>
        </div>
      </div>
    </div>

    <div class="dashboard-grid">
      <!-- Productos mas vendidos GROUP BY + HAVING -->
      <div class="card">
        <h2>Productos Más Vendidos </h2>
        <table class="data-table">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Categoría</th>
              <th>Vendidos</th>
              <th>Ingresos</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in masVendidos.slice(0,5)" :key="p.id_producto">
              <td>{{ p.nombre }}</td>
              <td>{{ p.categoria }}</td>
              <td>{{ p.total_vendido }}</td>
              <td>Q{{ parseFloat(p.total_ingresos).toFixed(2) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Stock bajo VIEW -->
      <div class="card">
        <h2>Stock Bajo </h2>
        <table class="data-table">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Producto</th>
              <th>Stock</th>
              <th>Mínimo</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in stockBajo.slice(0,5)" :key="p.id_producto" class="row-alert">
              <td>{{ p.sku }}</td>
              <td>{{ p.nombre }}</td>
              <td class="text-red">{{ p.stock_actual }}</td>
              <td>{{ p.stock_minimo }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Ventas por categoria GROUP BY -->
      <div class="card">
        <h2>Ventas por Categoría </h2>
        <table class="data-table">
          <thead>
            <tr>
              <th>Categoría</th>
              <th>Ventas</th>
              <th>Unidades</th>
              <th>Ingresos</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="v in ventasPorCategoria" :key="v.categoria">
              <td>{{ v.categoria }}</td>
              <td>{{ v.total_ventas }}</td>
              <td>{{ v.unidades_vendidas }}</td>
              <td>Q{{ parseFloat(v.total_ingresos).toFixed(2) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Clientes con compras SUBQUERY IN -->
      <div class="card">
        <h2>Mejores Clientes </h2>
        <table class="data-table">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Compras</th>
              <th>Total gastado</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="c in clientesConCompras.slice(0,5)" :key="c.id_cliente">
              <td>{{ c.nombre }} {{ c.apellido }}</td>
              <td>{{ c.total_compras }}</td>
              <td>Q{{ parseFloat(c.total_gastado).toFixed(2) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Productos sin ventas SUBQUERY EXISTS -->
      <div class="card">
        <h2>Productos Sin Ventas </h2>
        <table class="data-table">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Producto</th>
              <th>Categoría</th>
              <th>Stock</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in productosSinVentas.slice(0,5)" :key="p.id_producto">
              <td>{{ p.sku }}</td>
              <td>{{ p.nombre }}</td>
              <td>{{ p.categoria }}</td>
              <td>{{ p.stock_actual }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Ventas por empleado GROUP BY -->
      <div class="card">
        <h2>Ventas por Empleado </h2>
        <table class="data-table">
          <thead>
            <tr>
              <th>Empleado</th>
              <th>Cargo</th>
              <th>Ventas</th>
              <th>Ingresos</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="e in ventasPorEmpleado" :key="e.id_empleado">
              <td>{{ e.empleado }}</td>
              <td>{{ e.cargo }}</td>
              <td>{{ e.total_ventas }}</td>
              <td>Q{{ parseFloat(e.total_ingresos).toFixed(2) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Ventas por periodo CTE -->
      <div class="card full-width">
        <div class="card-header-row">
          <h2>Ventas por Período </h2>
          <div class="filtros">
            <input v-model="fechaInicio" type="date" class="form-control date-input" />
            <span>a</span>
            <input v-model="fechaFin" type="date" class="form-control date-input" />
            <button class="btn btn-teal" @click="cargarVentasPeriodo">Filtrar</button>
          </div>
        </div>
        <table class="data-table" v-if="ventasPeriodo.length">
          <thead>
            <tr>
              <th>#</th>
              <th>Fecha</th>
              <th>Cliente</th>
              <th>Empleado</th>
              <th>Total</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="v in ventasPeriodo" :key="v.id_venta">
              <td>{{ v.id_venta }}</td>
              <td>{{ formatDate(v.fecha_venta) }}</td>
              <td>{{ v.cliente }}</td>
              <td>{{ v.empleado || 'Sin empleado' }}</td>
              <td>Q{{ parseFloat(v.total).toFixed(2) }}</td>
              <td><span class="estado-badge" :class="v.estado">{{ v.estado }}</span></td>
            </tr>
          </tbody>
        </table>
        <p v-else class="empty-msg">Selecciona un período para ver las ventas</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Package, ShoppingCart, Users, AlertTriangle } from 'lucide-vue-next'
import api from '../../services/api'

const stats = ref({ productos: 0, ventas: 0, clientes: 0 })
const masVendidos = ref([])
const stockBajo = ref([])
const ventasPorCategoria = ref([])
const clientesConCompras = ref([])
const productosSinVentas = ref([])
const ventasPorEmpleado = ref([])
const ventasPeriodo = ref([])
const fechaInicio = ref('')
const fechaFin = ref('')

const formatDate = (f) => new Date(f).toLocaleDateString('es-GT', { day: '2-digit', month: '2-digit', year: 'numeric' })

const cargarVentasPeriodo = async () => {
  if (!fechaInicio.value || !fechaFin.value) return
  try {
    const { data } = await api.get(`/api/reportes/ventas-por-periodo?fecha_inicio=${fechaInicio.value}&fecha_fin=${fechaFin.value}`)
    ventasPeriodo.value = data
  } catch {}
}

onMounted(async () => {
  try {
    const [prods, ventas, clientes, vendidos, bajo, porCat, conCompras, sinVentas, porEmpleado] = await Promise.all([
      api.get('/api/productos'),
      api.get('/api/ventas'),
      api.get('/api/clientes'),
      api.get('/api/reportes/productos-mas-vendidos'),
      api.get('/api/reportes/stock-bajo'),
      api.get('/api/reportes/ventas-por-categoria'),
      api.get('/api/reportes/clientes-con-compras'),
      api.get('/api/reportes/productos-sin-ventas'),
      api.get('/api/reportes/ventas-por-empleado'),
    ])
    stats.value = { productos: prods.data.length, ventas: ventas.data.length, clientes: clientes.data.length }
    masVendidos.value = vendidos.data
    stockBajo.value = bajo.data
    ventasPorCategoria.value = porCat.data
    clientesConCompras.value = conCompras.data
    productosSinVentas.value = sinVentas.data
    ventasPorEmpleado.value = porEmpleado.data
  } catch (err) { console.error(err) }
})
</script>

<style scoped>
.dashboard { padding: 32px; }
.page-header { margin-bottom: 28px; }
.page-header h1 { font-size: 28px; }
.page-header p { color: var(--text-light); font-size: 14px; }

.stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 28px; }

.stat-card {
  background: var(--white); border-radius: var(--radius);
  border: 1.5px solid var(--border); padding: 20px;
  display: flex; align-items: center; gap: 16px;
}

.stat-icon {
  width: 44px; height: 44px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.stat-icon.teal { background: rgba(115,191,176,0.15); color: var(--teal); }
.stat-icon.green { background: rgba(149,191,117,0.15); color: var(--green); }
.stat-icon.dark { background: rgba(9,40,48,0.1); color: var(--dark); }
.stat-icon.red { background: rgba(224,85,85,0.1); color: #e05555; }

.stat-label { font-size: 12px; color: var(--text-light); font-weight: 500; margin-bottom: 4px; }
.stat-value { font-size: 24px; font-weight: 700; font-family: 'Syne', sans-serif; }

.dashboard-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }

.card {
  background: var(--white); border-radius: var(--radius);
  border: 1.5px solid var(--border); padding: 20px;
}

.card h2 {
  font-size: 15px; font-weight: 700; margin-bottom: 16px;
  display: flex; align-items: center; gap: 8px;
}

.full-width { grid-column: 1 / -1; }

.card-header-row {
  display: flex; align-items: center; justify-content: space-between;
  flex-wrap: wrap; gap: 12px; margin-bottom: 16px;
}
.card-header-row h2 { margin-bottom: 0; }

.filtros { display: flex; align-items: center; gap: 8px; }
.date-input { width: 140px; }

.data-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.data-table th {
  text-align: left; padding: 8px 12px;
  font-size: 11px; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.05em; color: var(--text-light);
  border-bottom: 1.5px solid var(--border);
}
.data-table td { padding: 10px 12px; border-bottom: 1px solid var(--border); }
.data-table tr:last-child td { border-bottom: none; }
.data-table tr:hover td { background: var(--gray); }

.row-alert td { }
.text-red { color: #e05555; font-weight: 700; }

.estado-badge {
  font-size: 11px; font-weight: 600; padding: 3px 8px;
  border-radius: 999px; text-transform: uppercase;
}
.estado-badge.completada { background: #d4f0dc; color: #1a7f37; }
.estado-badge.cancelada { background: #fde8e8; color: #cf3131; }
.estado-badge.pendiente { background: #fff3cd; color: #856404; }

.empty-msg { text-align: center; color: var(--text-light); padding: 24px; font-size: 14px; }
</style>