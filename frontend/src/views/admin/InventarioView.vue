\<template>

  
  <div class="page">
    <div class="page-header">
      <div>
        <h1>Inventario</h1>
        <p>{{ productosFiltrados.length }} productos</p>
      </div>
      <button class="btn btn-primary" @click="abrirModal()">+ Nuevo Producto</button>
    </div>

    <ConfirmModal
      :show="confirm.show"
      :titulo="confirm.titulo"
      :mensaje="confirm.mensaje"
      :textoConfirmar="confirm.textoConfirmar"
      :tipo="confirm.tipo"
      @confirmar="ejecutarConfirm"
      @cancelar="confirm.show = false"
    />
    <div class="filtros-bar">
      <input v-model="filtroNombre" type="text" class="form-control search-input" placeholder="Buscar por nombre o SKU..." />
      <select v-model="filtroCategoria" class="form-control filter-select">
        <option value="">Todas las categorías</option>
        <option v-for="c in categorias" :key="c.id_categoria" :value="c.id_categoria">{{ c.nombre }}</option>
      </select>
      <select v-model="filtroStock" class="form-control filter-select">
        <option value="">Todo el stock</option>
        <option value="bajo">Stock bajo</option>
        <option value="sin">Sin stock</option>
      </select>
    </div>

    <div class="card">
      <table class="data-table">
        <thead>
          <tr>
            <th>SKU</th>
            <th>Producto</th>
            <th>Categoría</th>
            <th>Proveedor</th>
            <th>Precio</th>
            <th>Stock</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in productosFiltrados" :key="p.id_producto">
            <td><span class="sku-badge">{{ p.sku }}</span></td>
            <td>
              <div class="producto-info">
                <img :src="p.imagen_url || 'https://placehold.co/40x40'" :alt="p.nombre" class="prod-img" @error="e => e.target.src = 'https://placehold.co/40x40'" />
                <div>
                  <p class="prod-name">{{ p.nombre }}</p>
                  <p class="prod-marca">{{ p.marca }}</p>
                </div>
              </div>
            </td>
            <td>{{ p.categoria }}</td>
            <td>{{ p.proveedor }}</td>
            <td>Q{{ parseFloat(p.precio_venta).toFixed(2) }}</td>
            <td>
              <span class="stock-badge" :class="getStockClass(p)">{{ p.stock_actual }}</span>
            </td>
            <td>
              <div class="acciones">
                <button class="btn-icon" @click="verProducto(p)" title="Ver">
                  <Eye :size="15" />
                </button>
                <button class="btn-icon" @click="abrirModal(p)" title="Editar">
                  <Pencil :size="15" />
                </button>
                <button class="btn-icon danger" @click="eliminar(p)" title="Eliminar">
                  <Trash2 :size="15" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal Ver -->
    <div v-if="showVer" class="modal-overlay" @click.self="showVer = false">
      <div class="modal">
        <div class="modal-header">
          <h3>{{ productoVer?.nombre }}</h3>
          <button @click="showVer = false">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-row">
            <div class="form-group">
              <label>SKU</label>
              <input :value="productoVer?.sku" class="form-control" disabled />
            </div>
            <div class="form-group">
              <label>Marca</label>
              <input :value="productoVer?.marca" class="form-control" disabled />
            </div>
          </div>
          <div class="form-group">
            <label>Nombre</label>
            <input :value="productoVer?.nombre" class="form-control" disabled />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Precio Venta</label>
              <input :value="productoVer?.precio_venta" class="form-control" disabled />
            </div>
            <div class="form-group">
              <label>Precio Costo</label>
              <input :value="productoVer?.precio_costo" class="form-control" disabled />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Stock Actual</label>
              <input :value="productoVer?.stock_actual" class="form-control" disabled />
            </div>
            <div class="form-group">
              <label>Stock Mínimo</label>
              <input :value="productoVer?.stock_minimo" class="form-control" disabled />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Categoría</label>
              <input :value="productoVer?.categoria" class="form-control" disabled />
            </div>
            <div class="form-group">
              <label>Proveedor</label>
              <input :value="productoVer?.proveedor" class="form-control" disabled />
            </div>
          </div>
          <div class="form-group">
            <label>URL Imagen</label>
            <input :value="productoVer?.imagen_url" class="form-control" disabled />
          </div>
          <div class="form-group">
            <label>Descripción</label>
            <textarea :value="productoVer?.descripcion" class="form-control" rows="3" disabled></textarea>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Crear/Editar -->
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal">
        <div class="modal-header">
          <h3>{{ editando ? 'Editar Producto' : 'Nuevo Producto' }}</h3>
          <button @click="showModal = false">✕</button>
        </div>
        <form @submit.prevent="guardar" class="modal-body">
          <div class="form-row">
            <div class="form-group">
              <label>SKU</label>
              <input v-model="form.sku" class="form-control" :disabled="editando" required />
            </div>
            <div class="form-group">
              <label>Marca</label>
              <input v-model="form.marca" class="form-control" required />
            </div>
          </div>
          <div class="form-group">
            <label>Nombre</label>
            <input v-model="form.nombre" class="form-control" required />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Precio Venta</label>
              <input v-model="form.precio_venta" type="number" step="0.01" class="form-control" required />
            </div>
            <div class="form-group">
              <label>Precio Costo</label>
              <input v-model="form.precio_costo" type="number" step="0.01" class="form-control" required />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Stock Actual</label>
              <input v-model="form.stock_actual" type="number" class="form-control" required />
            </div>
            <div class="form-group">
              <label>Stock Mínimo</label>
              <input v-model="form.stock_minimo" type="number" class="form-control" required />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Categoría</label>
              <select v-model="form.id_categoria" class="form-control" required>
                <option value="">Seleccionar...</option>
                <option v-for="c in categorias" :key="c.id_categoria" :value="c.id_categoria">{{ c.nombre }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>Proveedor</label>
              <select v-model="form.id_proveedor" class="form-control" required>
                <option value="">Seleccionar...</option>
                <option v-for="p in proveedores" :key="p.id_proveedor" :value="p.id_proveedor">{{ p.nombre }}</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label>URL Imagen</label>
            <input v-model="form.imagen_url" class="form-control" placeholder="https://..." />
          </div>
          <div class="form-group">
            <label>Descripción</label>
            <textarea v-model="form.descripcion" class="form-control" rows="3" required></textarea>
          </div>
          <p v-if="error" class="error-msg">{{ error }}</p>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline" @click="showModal = false">Cancelar</button>
            <button type="submit" class="btn btn-primary" :disabled="loading">
              {{ loading ? 'Guardando...' : 'Guardar' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Eye, Pencil, Trash2 } from 'lucide-vue-next'
import ConfirmModal from '../../components/ConfirmModal.vue'
import api from '../../services/api'

const productos = ref([])
const categorias = ref([])
const proveedores = ref([])
const filtroNombre = ref('')
const filtroCategoria = ref('')
const filtroStock = ref('')
const showModal = ref(false)
const showVer = ref(false)
const editando = ref(null)
const loading = ref(false)
const error = ref('')
const productoVer = ref(null)

const confirm = ref({ show: false, titulo: '', mensaje: '', textoConfirmar: '', tipo: 'danger', accion: null })

const mostrarConfirm = (titulo, mensaje, textoConfirmar, tipo, accion) => {
  confirm.value = { show: true, titulo, mensaje, textoConfirmar, tipo, accion }
}

const ejecutarConfirm = async () => {
  confirm.value.show = false
  await confirm.value.accion()
}

const form = ref({
  sku: '', nombre: '', marca: '', precio_venta: '', precio_costo: '',
  stock_actual: 0, stock_minimo: 5, descripcion: '', imagen_url: '',
  id_categoria: '', id_proveedor: ''
})

const productosFiltrados = computed(() => {
  let list = productos.value
  if (filtroNombre.value) {
    const q = filtroNombre.value.toLowerCase()
    list = list.filter(p => p.nombre.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q))
  }
  if (filtroCategoria.value) list = list.filter(p => p.id_categoria === parseInt(filtroCategoria.value))
  if (filtroStock.value === 'bajo') list = list.filter(p => p.stock_actual <= p.stock_minimo && p.stock_actual > 0)
  if (filtroStock.value === 'sin') list = list.filter(p => p.stock_actual === 0)
  return list
})

const getStockClass = (p) => {
  if (p.stock_actual === 0) return 'sin-stock'
  if (p.stock_actual <= p.stock_minimo) return 'stock-bajo'
  return 'en-stock'
}

const verProducto = (p) => {
  productoVer.value = p
  showVer.value = true
}

const abrirModal = (p = null) => {
  error.value = ''
  if (p) {
    editando.value = p.id_producto
    form.value = { ...p }
  } else {
    editando.value = null
    form.value = { sku: '', nombre: '', marca: '', precio_venta: '', precio_costo: '', stock_actual: 0, stock_minimo: 5, descripcion: '', imagen_url: '', id_categoria: '', id_proveedor: '' }
  }
  showModal.value = true
}

const guardar = async () => {
  loading.value = true
  error.value = ''
  try {
    if (editando.value) {
      await api.put(`/api/productos/${editando.value}`, form.value)
    } else {
      await api.post('/api/productos', form.value)
    }
    showModal.value = false
    await cargar()
  } catch (err) {
    error.value = err.response?.data?.error || 'Error al guardar'
  } finally {
    loading.value = false
  }
}

const eliminar = async (p) => {
  mostrarConfirm(
    'Eliminar producto',
    `¿Eliminar "${p.nombre}"? Esta acción no se puede deshacer.`,
    'Eliminar',
    'danger',
    async () => {
      try {
        await api.delete(`/api/productos/${p.id_producto}`)
        await cargar()
      } catch (err) {
        const msg = err.response?.data?.error || 'Error al eliminar'
        mostrarConfirm(
          'No se puede eliminar',
          msg,
          'Entendido',
          'warning',
          () => {}
        )
      }
    }
  )
}
const cargar = async () => {
  const [prods, cats, provs] = await Promise.all([
    api.get('/api/productos'),
    api.get('/api/categorias'),
    api.get('/api/proveedores'),
  ])
  productos.value = prods.data
  categorias.value = cats.data
  proveedores.value = provs.data
}

onMounted(cargar)
</script>

<style scoped>
.page { padding: 32px; }
.page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 24px; }
.page-header h1 { font-size: 28px; margin-bottom: 4px; }
.page-header p { color: var(--text-light); font-size: 14px; }

.filtros-bar { display: flex; gap: 12px; margin-bottom: 20px; align-items: center; }
.search-input { flex: 1; }
.filter-select { width: 180px; flex-shrink: 0; }

.card { background: var(--white); border-radius: var(--radius); border: 1.5px solid var(--border); overflow: hidden; }

.data-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.data-table th { text-align: left; padding: 12px 16px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-light); border-bottom: 1.5px solid var(--border); background: var(--gray); }
.data-table td { padding: 12px 16px; border-bottom: 1px solid var(--border); }
.data-table tr:last-child td { border-bottom: none; }
.data-table tr:hover td { background: var(--gray); }

.sku-badge { font-size: 11px; font-weight: 700; font-family: monospace; background: var(--gray); padding: 3px 8px; border-radius: 4px; }

.producto-info { display: flex; align-items: center; gap: 10px; }
.prod-img { width: 40px; height: 40px; object-fit: contain; border-radius: 6px; background: var(--gray); flex-shrink: 0; }
.prod-name { font-size: 13px; font-weight: 600; }
.prod-marca { font-size: 11px; color: var(--teal); font-weight: 600; }

.stock-badge { font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 999px; }
.stock-badge.en-stock { background: #d4f0dc; color: #1a7f37; }
.stock-badge.stock-bajo { background: #fff3cd; color: #856404; }
.stock-badge.sin-stock { background: #fde8e8; color: #cf3131; }

.acciones { display: flex; gap: 6px; }
.btn-icon { background: none; border: none; cursor: pointer; padding: 6px; border-radius: 6px; color: var(--text-light); display: flex; align-items: center; transition: all 0.15s; }
.btn-icon:hover { background: var(--gray); color: var(--text); }
.btn-icon.danger:hover { background: #fde8e8; color: #cf3131; }

.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal { background: var(--white); border-radius: var(--radius); width: 100%; max-width: 600px; max-height: 90vh; overflow-y: auto; }
.modal-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px; border-bottom: 1.5px solid var(--border); }
.modal-header h3 { font-size: 18px; }
.modal-header button { background: none; border: none; font-size: 18px; cursor: pointer; color: var(--text-light); }
.modal-body { padding: 24px; }
.modal-footer { display: flex; justify-content: flex-end; gap: 12px; margin-top: 20px; }

.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
textarea.form-control { resize: vertical; }
</style>