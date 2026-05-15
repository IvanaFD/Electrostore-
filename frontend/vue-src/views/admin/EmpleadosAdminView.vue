<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h1>Empleados</h1>
        <p>{{ empleados.length }} empleados</p>
      </div>
      <button class="btn btn-primary" @click="abrirModal()">+ Nuevo Empleado</button>
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

    <div class="card">
      <table class="data-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Nombre</th>
            <th>Email</th>
            <th>Teléfono</th>
            <th>Cargo</th>
            <th>Usuario</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="e in empleados" :key="e.id_empleado">
            <td>{{ e.id_empleado }}</td>
            <td><strong>{{ e.nombre }} {{ e.apellido }}</strong></td>
            <td>{{ e.email }}</td>
            <td>{{ e.telefono }}</td>
            <td><span class="cargo-badge" :class="e.cargo">{{ e.cargo }}</span></td>
            <td>
              <span v-if="e.username" class="username-badge">{{ e.username }}</span>
              <span v-else class="sin-usuario">Sin acceso</span>
            </td>
            <td>
              <div class="acciones">
                <button class="btn-icon" @click="verEmpleado(e)" title="Ver">
                  <Eye :size="15" />
                </button>
                <button class="btn-icon" @click="abrirModal(e)" title="Editar">
                  <Pencil :size="15" />
                </button>
                <button class="btn-icon danger" @click="eliminar(e)" title="Eliminar">
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
          <h3>{{ empleadoVer?.nombre }} {{ empleadoVer?.apellido }}</h3>
          <button @click="showVer = false">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-row">
            <div class="form-group">
              <label>Nombre</label>
              <input :value="empleadoVer?.nombre" class="form-control" disabled />
            </div>
            <div class="form-group">
              <label>Apellido</label>
              <input :value="empleadoVer?.apellido" class="form-control" disabled />
            </div>
          </div>
          <div class="form-group">
            <label>Email</label>
            <input :value="empleadoVer?.email" class="form-control" disabled />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Teléfono</label>
              <input :value="empleadoVer?.telefono" class="form-control" disabled />
            </div>
            <div class="form-group">
              <label>Cargo</label>
              <input :value="empleadoVer?.cargo" class="form-control" disabled />
            </div>
          </div>
          <div class="form-group">
            <label>Usuario del sistema</label>
            <input :value="empleadoVer?.username || 'Sin acceso al sistema'" class="form-control" disabled />
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Crear/Editar -->
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal">
        <div class="modal-header">
          <h3>{{ editando ? 'Editar Empleado' : 'Nuevo Empleado' }}</h3>
          <button @click="showModal = false">✕</button>
        </div>
        <form @submit.prevent="guardar" class="modal-body">
          <div class="form-row">
            <div class="form-group">
              <label>Nombre</label>
              <input v-model="form.nombre" class="form-control" required />
            </div>
            <div class="form-group">
              <label>Apellido</label>
              <input v-model="form.apellido" class="form-control" required />
            </div>
          </div>
          <div class="form-group">
            <label>Email</label>
            <input v-model="form.email" type="email" class="form-control" required />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Teléfono</label>
              <input v-model="form.telefono" class="form-control" required />
            </div>
            <div class="form-group">
              <label>Cargo</label>
              <select v-model="form.cargo" class="form-control" required>
                <option value="vendedor">Vendedor</option>
                <option value="supervisor">Supervisor</option>
                <option value="bodeguero">Bodeguero</option>
              </select>
            </div>
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
import { ref, onMounted } from 'vue'
import { Eye, Pencil, Trash2 } from 'lucide-vue-next'
import ConfirmModal from '../../components/ConfirmModal.vue'
import api from '../../services/api'

const empleados = ref([])
const showModal = ref(false)
const showVer = ref(false)
const editando = ref(null)
const loading = ref(false)
const error = ref('')
const empleadoVer = ref(null)

const confirm = ref({ show: false, titulo: '', mensaje: '', textoConfirmar: '', tipo: 'danger', accion: null })

const mostrarConfirm = (titulo, mensaje, textoConfirmar, tipo, accion) => {
  confirm.value = { show: true, titulo, mensaje, textoConfirmar, tipo, accion }
}

const ejecutarConfirm = async () => {
  confirm.value.show = false
  await confirm.value.accion()
}

const form = ref({ nombre: '', apellido: '', email: '', telefono: '', cargo: 'vendedor' })

const verEmpleado = (e) => {
  empleadoVer.value = e
  showVer.value = true
}

const abrirModal = (e = null) => {
  error.value = ''
  if (e) {
    editando.value = e.id_empleado
    form.value = { nombre: e.nombre, apellido: e.apellido, email: e.email, telefono: e.telefono, cargo: e.cargo }
  } else {
    editando.value = null
    form.value = { nombre: '', apellido: '', email: '', telefono: '', cargo: 'vendedor' }
  }
  showModal.value = true
}

const guardar = async () => {
  loading.value = true
  error.value = ''
  try {
    if (editando.value) {
      await api.put(`/api/empleados/${editando.value}`, form.value)
    } else {
      await api.post('/api/empleados', form.value)
    }
    showModal.value = false
    await cargar()
  } catch (err) {
    error.value = err.response?.data?.error || 'Error al guardar'
  } finally {
    loading.value = false
  }
}

const eliminar = (e) => {
  mostrarConfirm(
    'Eliminar empleado',
    `¿Eliminar a ${e.nombre} ${e.apellido}? Esta acción no se puede deshacer.`,
    'Eliminar',
    'danger',
    async () => {
      try {
        await api.delete(`/api/empleados/${e.id_empleado}`)
        await cargar()
      } catch (err) {
        mostrarConfirm(
          'No se puede eliminar',
          err.response?.data?.error || 'Error al eliminar',
          'Entendido',
          'warning',
          () => {}
        )
      }
    }
  )
}

const cargar = async () => {
  const { data } = await api.get('/api/empleados')
  empleados.value = data
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

.cargo-badge { font-size: 11px; font-weight: 600; padding: 3px 8px; border-radius: 999px; text-transform: capitalize; }
.cargo-badge.vendedor { background: rgba(115,191,176,0.15); color: var(--teal); }
.cargo-badge.supervisor { background: rgba(149,191,117,0.15); color: #4a8f2a; }
.cargo-badge.bodeguero { background: rgba(9,40,48,0.1); color: var(--dark2); }

.username-badge { font-size: 12px; font-weight: 600; background: var(--dark); color: var(--teal); padding: 3px 8px; border-radius: 4px; font-family: monospace; }
.sin-usuario { font-size: 12px; color: var(--text-light); }

.acciones { display: flex; gap: 6px; }
.btn-icon { background: none; border: none; cursor: pointer; padding: 6px; border-radius: 6px; color: var(--text-light); display: flex; align-items: center; transition: all 0.15s; }
.btn-icon:hover { background: var(--gray); color: var(--text); }
.btn-icon.danger:hover { background: #fde8e8; color: #cf3131; }

.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal { background: var(--white); border-radius: var(--radius); width: 100%; max-width: 500px; max-height: 90vh; overflow-y: auto; }
.modal-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px; border-bottom: 1.5px solid var(--border); }
.modal-header h3 { font-size: 18px; }
.modal-header button { background: none; border: none; font-size: 18px; cursor: pointer; color: var(--text-light); }
.modal-body { padding: 24px; }
.modal-footer { display: flex; justify-content: flex-end; gap: 12px; margin-top: 20px; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
</style>