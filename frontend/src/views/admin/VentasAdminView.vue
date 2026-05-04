<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h1>Ventas</h1>
        <p>{{ ventasFiltradas.length }} ventas</p>
      </div>
      <button class="btn btn-primary" @click="abrirModalNueva">+ Nueva Venta</button>
    </div>

    <!-- Filtros -->
    <div class="filtros-bar">
      <input v-model="filtroFechaInicio" type="date" class="form-control" />
      <span>a</span>
      <input v-model="filtroFechaFin" type="date" class="form-control" />
      <select v-model="filtroEstado" class="form-control">
        <option value="">Todos los estados</option>
        <option value="completada">Completada</option>
        <option value="cancelada">Cancelada</option>
      </select>
      <button class="btn btn-outline" @click="limpiarFiltros">Limpiar</button>
    </div>

    <!-- Tabla -->
    <div class="card">
      <table class="data-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Fecha</th>
            <th>Cliente</th>
            <th>Empleado</th>
            <th>Total</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="v in ventasFiltradas" :key="v.id_venta">
            <td>{{ v.id_venta }}</td>
            <td>{{ formatDate(v.fecha_venta) }}</td>
            <td>{{ v.cliente }}</td>
            <td>{{ v.empleado || '—' }}</td>
            <td>Q{{ parseFloat(v.total).toFixed(2) }}</td>
            <td><span class="estado-badge" :class="v.estado">{{ v.estado }}</span></td>
            <td>
              <div class="acciones">
                <button class="btn-icon" @click="verDetalle(v)" title="Ver detalle">
                  <Eye :size="15" />
                </button>
                <button v-if="v.estado === 'completada'" class="btn-icon danger" @click="cancelar(v)" title="Cancelar">
                  <X :size="15" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal detalle -->
    <div v-if="showDetalle" class="modal-overlay" @click.self="showDetalle = false">
      <div class="modal">
        <div class="modal-header">
          <h3>Detalle Venta #{{ ventaSeleccionada?.id_venta }}</h3>
          <button @click="showDetalle = false">✕</button>
        </div>
        <div class="modal-body">
          <div class="detalle-info">
            <p><strong>Cliente:</strong> {{ ventaSeleccionada?.cliente }}</p>
            <p><strong>Empleado:</strong> {{ ventaSeleccionada?.empleado || 'Sin empleado' }}</p>
            <p><strong>Fecha:</strong> {{ ventaSeleccionada ? formatDate(ventaSeleccionada.fecha_venta) : '' }}</p>
            <p><strong>Estado:</strong> <span class="estado-badge" :class="ventaSeleccionada?.estado">{{ ventaSeleccionada?.estado }}</span></p>
          </div>
          <table class="data-table mt">
            <thead>
              <tr>
                <th>Producto</th>
                <th>SKU</th>
                <th>Cantidad</th>
                <th>Precio Unit.</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="d in detalleVenta" :key="d.id_producto">
                <td>{{ d.producto }}</td>
                <td>{{ d.sku }}</td>
                <td>{{ d.cantidad }}</td>
                <td>Q{{ parseFloat(d.precio_unitario).toFixed(2) }}</td>
                <td>Q{{ parseFloat(d.subtotal).toFixed(2) }}</td>
              </tr>
            </tbody>
          </table>
          <div class="total-row">
            <strong>Total: Q{{ parseFloat(ventaSeleccionada?.total || 0).toFixed(2) }}</strong>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal nueva venta -->
    <div v-if="showNueva" class="modal-overlay" @click.self="showNueva = false">
      <div class="modal">
        <div class="modal-header">
          <h3>Nueva Venta</h3>
          <button @click="showNueva = false">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Cliente</label>
            <select v-model="nuevaVenta.id_cliente" class="form-control" required>
              <option value="">Seleccionar cliente...</option>
              <option v-for="c in clientes" :key="c.id_cliente" :value="c.id_cliente">
                {{ c.nombre }} {{ c.apellido }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>Empleado (opcional)</label>
            <select v-model="nuevaVenta.id_empleado" class="form-control">
              <option value="">Sin empleado</option>
              <option v-for="e in empleados" :key="e.id_empleado" :value="e.id_empleado">
                {{ e.nombre }} {{ e.apellido }}
              </option>
            </select>
          </div>
          <div class="items-section">
            <div class="items-header">
              <label>Productos</label>
              <button type="button" class="btn btn-outline" @click="agregarItem">+ Agregar</button>
            </div>
            <div v-for="(item, i) in nuevaVenta.items" :key="i" class="item-row">
              <select v-model="item.id_producto" class="form-control">
                <option value="">Seleccionar producto...</option>
                <option v-for="p in productos" :key="p.id_producto" :value="p.id_producto">
                  {{ p.nombre }} (Stock: {{ p.stock_actual }})
                </option>
              </select>
              <input v-model="item.cantidad" type="number" min="1" class="form-control qty-input" placeholder="Cant." />
              <button type="button" class="btn-icon danger" @click="nuevaVenta.items.splice(i, 1)">✕</button>
            </div>
          </div>
          <p v-if="errorNueva" class="error-msg">{{ errorNueva }}</p>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline" @click="showNueva = false">Cancelar</button>
            <button type="button" class="btn btn-primary" @click="crearVenta" :disabled="loadingNueva">
              {{ loadingNueva ? 'Procesando...' : 'Crear Venta' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '../../services/api'
import { Eye, X, UserPlus } from 'lucide-vue-next'

const ventas = ref([])
const clientes = ref([])
const empleados = ref([])
const productos = ref([])
const detalleVenta = ref([])
const ventaSeleccionada = ref(null)
const showDetalle = ref(false)
const showNueva = ref(false)
const loadingNueva = ref(false)
const errorNueva = ref('')

const filtroFechaInicio = ref('')
const filtroFechaFin = ref('')
const filtroEstado = ref('')

const nuevaVenta = ref({ id_cliente: '', id_empleado: '', items: [{ id_producto: '', cantidad: 1 }] })

const ventasFiltradas = computed(() => {
  let list = ventas.value
  if (filtroEstado.value) list = list.filter(v => v.estado === filtroEstado.value)
  if (filtroFechaInicio.value) list = list.filter(v => new Date(v.fecha_venta) >= new Date(filtroFechaInicio.value))
  if (filtroFechaFin.value) list = list.filter(v => new Date(v.fecha_venta) <= new Date(filtroFechaFin.value + 'T23:59:59'))
  return list
})

const formatDate = (f) => new Date(f).toLocaleDateString('es-GT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })

const limpiarFiltros = () => { filtroFechaInicio.value = ''; filtroFechaFin.value = ''; filtroEstado.value = '' }

const verDetalle = async (v) => {
  ventaSeleccionada.value = v
  const { data } = await api.get(`/api/ventas/${v.id_venta}`)
  detalleVenta.value = data.detalle
  showDetalle.value = true
}

const cancelar = async (v) => {
  if (!confirm(`¿Cancelar venta #${v.id_venta}?`)) return
  try {
    await api.patch(`/api/ventas/${v.id_venta}/cancelar`)
    await cargar()
  } catch (err) {
    alert(err.response?.data?.error || 'Error al cancelar')
  }
}

const abrirModalNueva = () => {
  errorNueva.value = ''
  nuevaVenta.value = { id_cliente: '', id_empleado: '', items: [{ id_producto: '', cantidad: 1 }] }
  showNueva.value = true
}

const agregarItem = () => nuevaVenta.value.items.push({ id_producto: '', cantidad: 1 })

const crearVenta = async () => {
  if (!nuevaVenta.value.id_cliente) { errorNueva.value = 'Selecciona un cliente'; return }
  const items = nuevaVenta.value.items.filter(i => i.id_producto && i.cantidad > 0)
  if (!items.length) { errorNueva.value = 'Agrega al menos un producto'; return }
  loadingNueva.value = true
  errorNueva.value = ''
  try {
    await api.post('/api/ventas', {
      id_cliente: nuevaVenta.value.id_cliente,
      id_empleado: nuevaVenta.value.id_empleado || null,
      items
    })
    showNueva.value = false
    await cargar()
  } catch (err) {
    errorNueva.value = err.response?.data?.error || 'Error al crear venta'
  } finally {
    loadingNueva.value = false
  }
}

const cargar = async () => {
  const [v, c, e, p] = await Promise.all([
    api.get('/api/ventas'),
    api.get('/api/clientes'),
    api.get('/api/empleados'),
    api.get('/api/productos'),
  ])
  ventas.value = v.data
  clientes.value = c.data
  empleados.value = e.data
  productos.value = p.data
}

onMounted(cargar)
</script>

<style scoped>
.page { padding: 32px; }
.page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 24px; }
.page-header h1 { font-size: 28px; margin-bottom: 4px; }
.page-header p { color: var(--text-light); font-size: 14px; }

.filtros-bar { display: flex; gap: 12px; margin-bottom: 20px; align-items: center; flex-wrap: wrap; }
.filtros-bar .form-control { width: 160px; }

.card { background: var(--white); border-radius: var(--radius); border: 1.5px solid var(--border); overflow: hidden; }

.data-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.data-table th { text-align: left; padding: 12px 16px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-light); border-bottom: 1.5px solid var(--border); background: var(--gray); }
.data-table td { padding: 12px 16px; border-bottom: 1px solid var(--border); }
.data-table tr:last-child td { border-bottom: none; }
.data-table tr:hover td { background: var(--gray); }

.estado-badge { font-size: 11px; font-weight: 600; padding: 3px 8px; border-radius: 999px; text-transform: uppercase; }
.estado-badge.completada { background: #d4f0dc; color: #1a7f37; }
.estado-badge.cancelada { background: #fde8e8; color: #cf3131; }

.acciones { display: flex; gap: 6px; }
.btn-icon { background: none; border: none; cursor: pointer; padding: 4px 8px; border-radius: 6px; font-size: 14px; transition: background 0.15s; }
.btn-icon:hover { background: var(--gray); }
.btn-icon.danger:hover { background: #fde8e8; }

.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal { background: var(--white); border-radius: var(--radius); width: 100%; max-width: 600px; max-height: 90vh; overflow-y: auto; }
.modal-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px; border-bottom: 1.5px solid var(--border); }
.modal-header h3 { font-size: 18px; }
.modal-header button { background: none; border: none; font-size: 18px; cursor: pointer; color: var(--text-light); }
.modal-body { padding: 24px; }
.modal-footer { display: flex; justify-content: flex-end; gap: 12px; margin-top: 20px; }

.detalle-info { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 16px; font-size: 14px; }
.mt { margin-top: 0; }
.total-row { text-align: right; padding: 12px 0; font-size: 16px; border-top: 1.5px solid var(--border); margin-top: 8px; }

.items-section { margin-top: 8px; }
.items-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
.item-row { display: flex; gap: 8px; align-items: center; margin-bottom: 8px; }
.qty-input { width: 80px; flex-shrink: 0; }
</style>