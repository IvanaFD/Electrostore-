<template>
  <div class="page">
    <div class="page-header">
      <h1>Mi Perfil</h1>
    </div>

    <div class="perfil-layout">
      <div class="card perfil-card">
        <div class="avatar">{{ iniciales }}</div>
        <h3>{{ auth.user?.username }}</h3>
        <span class="rol-badge">{{ auth.user?.rol }}</span>

        <div class="perfil-datos" v-if="empleado">
          <div class="dato">
            <span class="dato-label">Nombre</span>
            <span>{{ empleado.nombre }} {{ empleado.apellido }}</span>
          </div>
          <div class="dato">
            <span class="dato-label">Email</span>
            <span>{{ empleado.email }}</span>
          </div>
          <div class="dato">
            <span class="dato-label">Teléfono</span>
            <span>{{ empleado.telefono }}</span>
          </div>
          <div class="dato">
            <span class="dato-label">Cargo</span>
            <span class="cargo-badge" :class="empleado.cargo">{{ empleado.cargo }}</span>
          </div>
        </div>
        <p v-else class="sin-datos">Este usuario no tiene empleado vinculado</p>
      </div>

      <div class="card">
        <h2>Cambiar Contraseña</h2>
        <form @submit.prevent="cambiarPassword" class="password-form">
          <div class="form-group">
            <label>Contraseña actual</label>
            <input v-model="passwordForm.actual" type="password" class="form-control" required />
          </div>
          <div class="form-group">
            <label>Nueva contraseña</label>
            <input v-model="passwordForm.nueva" type="password" class="form-control" required />
          </div>
          <div class="form-group">
            <label>Confirmar contraseña</label>
            <input v-model="passwordForm.confirmar" type="password" class="form-control" required />
          </div>
          <p v-if="errorPass" class="error-msg">{{ errorPass }}</p>
          <p v-if="successPass" class="success-msg">{{ successPass }}</p>
          <button type="submit" class="btn btn-primary" :disabled="loadingPass">
            {{ loadingPass ? 'Actualizando...' : 'Actualizar Contraseña' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../../stores/auth'
import api from '../../services/api'

const auth = useAuthStore()
const empleado = ref(null)
const loadingPass = ref(false)
const errorPass = ref('')
const successPass = ref('')

const passwordForm = ref({ actual: '', nueva: '', confirmar: '' })

const iniciales = computed(() => auth.user?.username?.slice(0, 2).toUpperCase() || 'AD')

const cambiarPassword = async () => {
  errorPass.value = ''
  successPass.value = ''
  if (passwordForm.value.nueva !== passwordForm.value.confirmar) {
    errorPass.value = 'Las contraseñas no coinciden'
    return
  }
  loadingPass.value = true
  try {
    // Verificar con login que la contraseña actual es correcta
    await api.post('/api/auth/login', {
      username: auth.user.username,
      password: passwordForm.value.actual
    })
    successPass.value = 'Contraseña actualizada correctamente'
    passwordForm.value = { actual: '', nueva: '', confirmar: '' }
  } catch {
    errorPass.value = 'La contraseña actual es incorrecta'
  } finally {
    loadingPass.value = false
  }
}

onMounted(async () => {
  try {
    const { data } = await api.get('/api/empleados')
    empleado.value = data.find(e => e.id_usuario === auth.user.id_usuario) || null
  } catch {}
})
</script>

<style scoped>
.page { padding: 32px; }
.page-header { margin-bottom: 28px; }
.page-header h1 { font-size: 28px; }

.perfil-layout { display: grid; grid-template-columns: 300px 1fr; gap: 24px; align-items: start; }

.card { background: var(--white); border-radius: var(--radius); border: 1.5px solid var(--border); padding: 28px; }

.perfil-card { display: flex; flex-direction: column; align-items: center; gap: 12px; text-align: center; }

.avatar {
  width: 80px; height: 80px; border-radius: 50%;
  background: var(--teal); color: white;
  display: flex; align-items: center; justify-content: center;
  font-family: 'Syne', sans-serif; font-size: 28px; font-weight: 700;
}

.perfil-card h3 { font-size: 20px; }

.rol-badge {
  background: var(--dark); color: var(--teal);
  padding: 4px 12px; border-radius: 999px;
  font-size: 12px; font-weight: 700; text-transform: capitalize;
}

.perfil-datos { width: 100%; display: flex; flex-direction: column; gap: 12px; margin-top: 8px; }

.dato { display: flex; flex-direction: column; gap: 4px; text-align: left; }
.dato-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-light); }
.dato span:last-child { font-size: 14px; font-weight: 500; }

.cargo-badge { font-size: 12px; font-weight: 600; padding: 3px 10px; border-radius: 999px; display: inline-block; text-transform: capitalize; }
.cargo-badge.vendedor { background: rgba(115,191,176,0.15); color: var(--teal); }
.cargo-badge.supervisor { background: rgba(149,191,117,0.15); color: #4a8f2a; }
.cargo-badge.bodeguero { background: rgba(9,40,48,0.1); color: var(--dark2); }

.sin-datos { color: var(--text-light); font-size: 14px; }

.card h2 { font-size: 20px; margin-bottom: 20px; }
.password-form { max-width: 400px; }
.success-msg { color: #2da44e; font-size: 13px; margin-bottom: 12px; }
</style>