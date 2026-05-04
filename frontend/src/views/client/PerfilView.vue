<template>
  <div>
    <ClientNavbar />
    <main class="perfil-page">
      <div class="container">
        <div class="perfil-layout">
          <!-- Sidebar perfil -->
          <aside class="perfil-sidebar">
            <div class="avatar">{{ iniciales }}</div>
            <h3>{{ cliente?.nombre }} {{ cliente?.apellido }}</h3>
            <p>{{ auth.user?.username }}</p>
            <span class="rol-badge">Cliente</span>
            <button class="btn btn-outline logout-btn" @click="handleLogout">
              Cerrar sesión
            </button>
          </aside>

          <!-- Contenido -->
          <div class="perfil-content">
            <!-- Mis datos -->
            <section class="perfil-section">
              <h2>Mis Datos</h2>
              <div class="datos-grid" v-if="cliente">
                <div class="dato">
                  <span class="dato-label">Nombre</span>
                  <span>{{ cliente.nombre }} {{ cliente.apellido }}</span>
                </div>
                <div class="dato">
                  <span class="dato-label">Email</span>
                  <span>{{ cliente.email }}</span>
                </div>
                <div class="dato">
                  <span class="dato-label">Teléfono</span>
                  <span>{{ cliente.telefono }}</span>
                </div>
                <div class="dato">
                  <span class="dato-label">Dirección</span>
                  <span>{{ cliente.direccion }}</span>
                </div>
              </div>
            </section>

            <!-- Mis compras -->
            <section class="perfil-section">
              <div class="section-header-row">
                <h2>Mis Compras</h2>
                <div class="filtros">
                  <input v-model="filtroInicio" type="date" class="form-control date-input" />
                  <span>a</span>
                  <input v-model="filtroFin" type="date" class="form-control date-input" />
                  <button class="btn btn-teal" @click="filtrar">Filtrar</button>
                  <button class="btn btn-outline" @click="limpiarFiltro">Limpiar</button>
                </div>
              </div>

              <div v-if="loadingVentas" class="loading-text">Cargando compras...</div>
              <div v-else-if="ventasFiltradas.length === 0" class="empty-state">
                No tienes compras registradas
              </div>
              <div v-else class="ventas-list">
                <div v-for="venta in ventasFiltradas" :key="venta.id_venta" class="venta-card">
                  <div class="venta-header">
                    <div>
                      <p class="venta-id">Pedido #{{ venta.id_venta }}</p>
                      <p class="venta-fecha">{{ formatDate(venta.fecha_venta) }}</p>
                    </div>
                    <div class="venta-right">
                      <span class="venta-estado" :class="venta.estado">{{ venta.estado }}</span>
                      <p class="venta-total">Q{{ parseFloat(venta.total).toFixed(2) }}</p>
                    </div>
                  </div>
                  <div v-if="venta.detalle" class="venta-detalle">
                    <div v-for="d in venta.detalle" :key="d.id_producto" class="detalle-item">
                      <span>{{ d.producto }}</span>
                      <span>x{{ d.cantidad }} · Q{{ parseFloat(d.subtotal).toFixed(2) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import ClientNavbar from '../../components/ClientNavbar.vue'
import { useAuthStore } from '../../stores/auth'
import api from '../../services/api'

const router = useRouter()
const auth = useAuthStore()
const cliente = ref(null)
const ventas = ref([])
const loadingVentas = ref(true)
const filtroInicio = ref('')
const filtroFin = ref('')
const filtroActivo = ref(false)

const iniciales = computed(() => {
  if (!cliente.value) return '?'
  return (cliente.value.nombre[0] + cliente.value.apellido[0]).toUpperCase()
})

const ventasFiltradas = computed(() => {
  if (!filtroActivo.value) return ventas.value
  return ventas.value.filter(v => {
    const fecha = new Date(v.fecha_venta)
    const inicio = filtroInicio.value ? new Date(filtroInicio.value) : null
    const fin = filtroFin.value ? new Date(filtroFin.value + 'T23:59:59') : null
    if (inicio && fecha < inicio) return false
    if (fin && fecha > fin) return false
    return true
  })
})

const filtrar = () => { filtroActivo.value = true }
const limpiarFiltro = () => {
  filtroInicio.value = ''
  filtroFin.value = ''
  filtroActivo.value = false
}

const formatDate = (fecha) => {
  return new Date(fecha).toLocaleDateString('es-GT', {
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
  })
}

const handleLogout = () => {
  auth.logout()
  router.push('/')
}

onMounted(async () => {
  try {
    const [clienteRes, ventasRes] = await Promise.all([
      api.get('/api/clientes/me'),
      api.get('/api/ventas/mis-compras'),
    ])
    cliente.value = clienteRes.data
    ventas.value = ventasRes.data
  } catch (err) {
    console.error('Error cargando perfil:', err)
  } finally {
    loadingVentas.value = false
  }
})
</script>

<style scoped>
.perfil-page { padding: 40px 0 80px; min-height: calc(100vh - 100px); background: var(--gray); }

.perfil-layout { display: grid; grid-template-columns: 260px 1fr; gap: 32px; align-items: start; }

.perfil-sidebar {
  background: var(--white); border-radius: var(--radius);
  border: 1.5px solid var(--border); padding: 32px 24px;
  display: flex; flex-direction: column; align-items: center; gap: 12px;
  position: sticky; top: 120px; text-align: center;
}

.avatar {
  width: 72px; height: 72px; border-radius: 50%;
  background: var(--teal); color: white;
  display: flex; align-items: center; justify-content: center;
  font-family: 'Syne', sans-serif; font-size: 26px; font-weight: 700;
  margin-bottom: 4px;
}

.perfil-sidebar h3 { font-size: 18px; }
.perfil-sidebar p { font-size: 13px; color: var(--text-light); }

.rol-badge {
  background: var(--alabaster); color: var(--dark2);
  padding: 4px 12px; border-radius: 999px; font-size: 12px; font-weight: 600;
}

.logout-btn { margin-top: 8px; width: 100%; justify-content: center; }

.perfil-content { display: flex; flex-direction: column; gap: 24px; }

.perfil-section {
  background: var(--white); border-radius: var(--radius);
  border: 1.5px solid var(--border); padding: 28px;
}

.perfil-section h2 { font-size: 20px; margin-bottom: 20px; }

.datos-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

.dato { display: flex; flex-direction: column; gap: 4px; }
.dato-label { font-size: 12px; font-weight: 600; color: var(--text-light); text-transform: uppercase; letter-spacing: 0.05em; }
.dato span:last-child { font-size: 15px; font-weight: 500; }

.section-header-row {
  display: flex; align-items: center; justify-content: space-between;
  flex-wrap: wrap; gap: 12px; margin-bottom: 20px;
}

.filtros { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.date-input { width: 150px; }

.loading-text { color: var(--text-light); font-size: 14px; }
.empty-state { text-align: center; padding: 40px; color: var(--text-light); }

.ventas-list { display: flex; flex-direction: column; gap: 12px; }

.venta-card {
  border: 1.5px solid var(--border); border-radius: var(--radius-sm); overflow: hidden;
}

.venta-header {
  display: flex; justify-content: space-between; align-items: flex-start;
  padding: 16px; background: var(--gray);
}

.venta-id { font-weight: 700; font-size: 14px; }
.venta-fecha { font-size: 12px; color: var(--text-light); margin-top: 2px; }

.venta-right { text-align: right; }
.venta-total { font-weight: 700; font-size: 16px; margin-top: 4px; }

.venta-estado {
  font-size: 11px; font-weight: 600; padding: 3px 10px;
  border-radius: 999px; text-transform: uppercase; letter-spacing: 0.05em;
}
.venta-estado.completada { background: #d4f0dc; color: #1a7f37; }
.venta-estado.cancelada { background: #fde8e8; color: #cf3131; }

.venta-detalle { padding: 12px 16px; display: flex; flex-direction: column; gap: 6px; }

.detalle-item {
  display: flex; justify-content: space-between;
  font-size: 13px; color: var(--text-light);
}

@media (max-width: 768px) {
  .perfil-layout { grid-template-columns: 1fr; }
  .perfil-sidebar { position: static; }
  .datos-grid { grid-template-columns: 1fr; }
}
</style>
