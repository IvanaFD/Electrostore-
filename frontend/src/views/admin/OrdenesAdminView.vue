<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h1>Órdenes de Compra</h1>
        <p>{{ ordenes.length }} órdenes</p>
      </div>
      <button class="btn btn-primary" @click="abrirModalNueva">+ Nueva Orden</button>
    </div>

    <!-- Tabla -->
    <div class="card">
      <table class="data-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Fecha</th>
            <th>Proveedor</th>
            <th>Empleado</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="o in ordenes" :key="o.id_orden">
            <td>{{ o.id_orden }}</td>
            <td>{{ formatDate(o.fecha_orden) }}</td>
            <td>{{ o.proveedor }}</td>
            <td>{{ o.empleado }}</td>
            <td><span class="estado-badge" :class="o.estado">{{ o.estado }}</span></td>
            <td>
              <div class="acciones">
                <button class="btn-icon" @click="verDetalle(o)" title="Ver detalle">
                  <Eye :size="15" />
                </button>
                <button v-if="o.estado === 'pendiente'" class="btn-icon success" @click="recibir(o)" title="Marcar recibida">
                  <Check :size="15" />
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
          <h3>Orden #{{ ordenSeleccionada?.id_orden }}</h3>
          <button @click="showDetalle = false">✕</button>
        </div>
        <div class="modal-body">
          <div class="detalle-info">
            <p><strong>Proveedor:</strong> {{ ordenSeleccionada?.proveedor }}</p>
            <p><strong>Empleado:</strong> {{ ordenSeleccionada?.empleado }}</p>
            <p><strong>Fecha:</strong> {{ ordenSeleccionada ? formatDate(ordenSeleccionada.fecha_orden) : '' }}</p>
            <p><strong>Estado:</strong> <span class="estado-badge" :class="ordenSeleccionada?.estado">{{ ordenSeleccionada?.estado }}</span></p>
          </div>
          <table class="data-table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>SKU</th>
                <th>Cantidad</th>
                <th>Precio compra</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="d in detalleOrden" :key="d.id_producto">
                <td>{{ d.producto }}</td>
                <td>{{ d.sku }}</td>
                <td>{{ d.cantidad }}</td>
                <td>Q{{ parseFloat(d.precio_compra).toFixed(2) }}</td>
                <td>Q{{ (d.cantidad * d.precio_compra).toFixed(2) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal nueva orden -->
    <div v-if="showNueva" class="modal-overlay" @click.self="showNueva = false">
      <div class="modal">
        <div class="modal-header">
          <h3>Nueva Orden de Compra</h3>
          <button @click="showNueva = false">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Proveedor</label>
            <select v-model="nuevaOrden.id_proveedor" class="form-control" required>
              <option value="">Seleccionar proveedor...</option>
              <option v-for="p in proveedores" :key="p.id_proveedor" :value="p.id_proveedor">{{ p.nombre }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>Empleado</label>
            <select v-model="nuevaOrden.id_empleado" class="form-control" required>
              <option value="">Seleccionar empleado...</option>
              <option v-for="e in empleados" :key="e.id_empleado" :value="e.id_empleado">{{ e.nombre }} {{ e.apellido }}</option>
            </select>
          </div>
          <div class="items-section">
            <div class="items-header">
              <label>Productos a ordenar</label>
              <button type="button" class="btn btn-outline" @click="agregarItem">+ Agregar</button>
            </div>
            <div v-for="(item, i) in nuevaOrden.items" :key="i" class="item-row">
              <select v-model="item.id_producto" class="form-control">
                <option value="">Seleccionar producto...</option>
                <option v-for="p in productos" :key="p.id_producto" :value="p.id_producto">{{ p.nombre }}</option>
              </select>
              <input v-model="item.cantidad" type="number" min="1" class="form-control qty-input" placeholder="Cant." />
              <input v-model="item.precio_compra" type="number" step="0.01" class="form-control qty-input" placeholder="Precio" />
              <button type="button" class="btn-icon danger" @click="nuevaOrden.items.splice(i, 1)">✕</button>
            </div>
          </div>
          <p v-if="errorNueva" class="error-msg">{{ errorNueva }}</p>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline" @click="showNueva = false">Cancelar</button>
            <button type="button" class="btn btn-primary" @click="crearOrden" :disabled="loadingNueva">
              {{ loadingNueva ? 'Creando...' : 'Crear Orden' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../../services/api'
import { Eye, Check, X } from 'lucide-vue-next'

const ordenes = ref([])
const proveedores = ref([])
const empleados = ref([])
const productos = ref([])
const detalleOrden = ref([])
const ordenSeleccionada = ref(null)
const showDetalle = ref(false)
const showNueva = ref(false)
const loadingNueva = ref(false)
const errorNueva = ref('')
const nuevaOrden = ref({ id_proveedor: '', id_empleado: '', items: [{ id_producto: '', cantidad: 1, precio_compra: '' }] })

const formatDate = (f) => new Date(f).toLocaleDateString('es-GT', { day: '2-digit', month: '2-digit', year: 'numeric' })

const verDetalle = async (o) => {
  ordenSeleccionada.value = o
  const { data } = await api.get(`/api/ordenes/${o.id_orden}`)
  detalleOrden.value = data.detalle
  showDetalle.value = true
}

const recibir = async (o) => {
  if (!confirm(`¿Marcar orden #${o.id_orden} como recibida? Esto aumentará el stock.`)) return
  try {
    await api.patch(`/api/ordenes/${o.id_orden}/recibir`)
    await cargar()
  } catch (err) {
    alert(err.response?.data?.error || 'Error')
  }
}

const abrirModalNueva = () => {
  errorNueva.value = ''
  nuevaOrden.value = { id_proveedor: '', id_empleado: '', items: [{ id_producto: '', cantidad: 1, precio_compra: '' }] }
  showNueva.value = true
}

const agregarItem = () => nuevaOrden.value.items.push({ id_producto: '', cantidad: 1, precio_compra: '' })

const crearOrden = async () => {
  if (!nuevaOrden.value.id_proveedor) { errorNueva.value = 'Selecciona un proveedor'; return }
  if (!nuevaOrden.value.id_empleado) { errorNueva.value = 'Selecciona un empleado'; return }
  const items = nuevaOrden.value.items.filter(i => i.id_producto && i.cantidad > 0 && i.precio_compra > 0)
  if (!items.length) { errorNueva.value = 'Agrega al menos un producto con precio'; return }
  loadingNueva.value = true
  errorNueva.value = ''
  try {
    await api.post('/api/ordenes', { ...nuevaOrden.value, items })
    showNueva.value = false
    await cargar()
  } catch (err) {
    errorNueva.value = err.response?.data?.error || 'Error al crear orden'
  } finally {
    loadingNueva.value = false
  }
}

const cargar = async () => {
  const [o, p, e, prods] = await Promise.all([
    api.get('/api/ordenes'),
    api.get('/api/proveedores'),
    api.get('/api/empleados'),
    api.get('/api/productos'),
  ])
  ordenes.value = o.data
  proveedores.value = p.data
  empleados.value = e.data
  productos.value = prods.data
}

onMounted(cargar)
</script>

<style scoped>
.page { padding: 32px; }
.page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 24px; }
.page-header h1 { font-size: 28px; margin-bottom: 4px; }
.page-header p { color: var(--text-light); font-size: 14px; }

.card { background: var(--white); border-radius: var(--radius); border: 1.5px solid var(--border); overflow: hidden; }

.data-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.data-table th { text-align: left; padding: 12px 16px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-light); border-bottom: 1.5px solid var(--border); background: var(--gray); }
.data-table td { padding: 12px 16px; border-bottom: 1px solid var(--border); }
.data-table tr:last-child td { border-bottom: none; }
.data-table tr:hover td { background: var(--gray); }

.estado-badge { font-size: 11px; font-weight: 600; padding: 3px 8px; border-radius: 999px; text-transform: uppercase; }
.estado-badge.pendiente { background: #fff3cd; color: #856404; }
.estado-badge.recibida { background: #d4f0dc; color: #1a7f37; }

.acciones { display: flex; gap: 6px; }
.btn-icon { background: none; border: none; cursor: pointer; padding: 4px 8px; border-radius: 6px; font-size: 14px; transition: background 0.15s; }
.btn-icon:hover { background: var(--gray); }
.btn-icon.danger:hover { background: #fde8e8; }
.btn-icon.success { color: #1a7f37; }
.btn-icon.success:hover { background: #d4f0dc; }

.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal { background: var(--white); border-radius: var(--radius); width: 100%; max-width: 620px; max-height: 90vh; overflow-y: auto; }
.modal-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px; border-bottom: 1.5px solid var(--border); }
.modal-header h3 { font-size: 18px; }
.modal-header button { background: none; border: none; font-size: 18px; cursor: pointer; color: var(--text-light); }
.modal-body { padding: 24px; }
.modal-footer { display: flex; justify-content: flex-end; gap: 12px; margin-top: 20px; }

.detalle-info { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 16px; font-size: 14px; }

.items-section { margin-top: 8px; }
.items-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
.item-row { display: flex; gap: 8px; align-items: center; margin-bottom: 8px; }
.qty-input { width: 90px; flex-shrink: 0; }
</style>