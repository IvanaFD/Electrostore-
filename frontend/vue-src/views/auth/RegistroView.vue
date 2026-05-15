<template>
  <div class="auth-page">
    <div class="auth-left">
      <div class="auth-brand">
        <router-link to="/" class="logo">
          <div class="logo-icon">
            <img src="/logo.png" alt="Logo" />
          </div>
          <span class="logo-text">ElectroStore</span>
        </router-link>
        <h1>Únete a ElectroStore</h1>
        <p>Crea tu cuenta y accede a todos los componentes electrónicos que necesitas para tus proyectos.</p>
      </div>
    </div>

    <div class="auth-right">
      <div class="auth-card">
        <h2>Crear Cuenta</h2>
        <p class="auth-subtitle">Llena tus datos para registrarte</p>

        <form @submit.prevent="handleRegistro">
          <div class="form-row">
            <div class="form-group">
              <label>Nombre</label>
              <input v-model="form.nombre" type="text" class="form-control" required />
            </div>
            <div class="form-group">
              <label>Apellido</label>
              <input v-model="form.apellido" type="text" class="form-control" required />
            </div>
          </div>

          <div class="form-group">
            <label>Email</label>
            <input v-model="form.email" type="email" class="form-control" required />
          </div>

          <div class="form-group">
            <label>Teléfono</label>
            <input v-model="form.telefono" type="text" class="form-control" required />
          </div>

          <div class="form-group">
            <label>Dirección</label>
            <input v-model="form.direccion" type="text" class="form-control" required />
          </div>

          <div class="form-group">
            <label>Usuario</label>
            <input v-model="form.username" type="text" class="form-control" required />
          </div>

          <div class="form-group">
            <label>Contraseña</label>
            <div class="password-wrap">
              <input
                v-model="form.password"
                :type="showPass ? 'text' : 'password'"
                class="form-control"
                required
              />
              <button type="button" class="toggle-pass" @click="showPass = !showPass">
                <component :is="showPass ? EyeOff : Eye" :size="18" />
              </button>
            </div>
          </div>

          <p v-if="error" class="error-msg">{{ error }}</p>
          <p v-if="success" class="success-msg">{{ success }}</p>

          <button type="submit" class="btn btn-primary w-full" :disabled="loading">
            <span v-if="loading">Creando cuenta...</span>
            <span v-else>Crear Cuenta</span>
          </button>
        </form>

        <div class="auth-footer">
          <p>¿Ya tienes cuenta? <router-link to="/login">Inicia sesión</router-link></p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { Eye, EyeOff } from 'lucide-vue-next'
import api from '../../services/api'

const router = useRouter()
const auth = useAuthStore()

const form = ref({
  nombre: '', apellido: '', email: '', telefono: '',
  direccion: '', username: '', password: ''
})
const error = ref('')
const success = ref('')
const loading = ref(false)
const showPass = ref(false)

const handleRegistro = async () => {
  error.value = ''
  loading.value = true
  try {
    await api.post('/api/auth/register', {
      username: form.value.username,
      password: form.value.password,
      nombre: form.value.nombre,
      apellido: form.value.apellido,
      email: form.value.email,
      telefono: form.value.telefono,
      direccion: form.value.direccion
    })
    await auth.login(form.value.username, form.value.password)
    router.push('/')
  } catch (err) {
    error.value = err.response?.data?.error || 'Error al crear la cuenta'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1fr 1fr;
}

.auth-left {
  background: var(--dark);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px;
}

.auth-brand { max-width: 400px; }

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 48px;
}

.logo-icon {
  width: 100px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.logo-text {
  font-family: 'Syne', sans-serif;
  font-weight: 800; font-size: 22px; color: var(--white);
}

.logo-icon img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 10px;
}
.auth-brand h1 { font-size: 36px; color: var(--white); margin-bottom: 16px; }
.auth-brand p { color: rgba(255,255,255,0.5); font-size: 16px; line-height: 1.7; }

.auth-right {
  display: flex; align-items: center; justify-content: center;
  padding: 48px; background: var(--gray); overflow-y: auto;
}

.auth-card {
  background: var(--white); border-radius: 20px;
  padding: 40px; width: 100%; max-width: 440px;
  box-shadow: var(--shadow);
}

.auth-card h2 { font-size: 28px; margin-bottom: 6px; }
.auth-subtitle { color: var(--text-light); font-size: 14px; margin-bottom: 24px; }

.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

.password-wrap { position: relative; }
.password-wrap .form-control { padding-right: 44px; }

.toggle-pass {
  position: absolute; right: 12px; top: 50%;
  transform: translateY(-50%);
  background: none; border: none;
  color: var(--text-light); cursor: pointer;
  display: flex; align-items: center;
}

.w-full { width: 100%; justify-content: center; padding: 12px; font-size: 15px; }

.success-msg { font-size: 13px; color: #2da44e; margin-bottom: 12px; }

.auth-footer { margin-top: 24px; text-align: center; font-size: 14px; color: var(--text-light); }
.auth-footer a { color: var(--teal); font-weight: 600; }

@media (max-width: 768px) {
  .auth-page { grid-template-columns: 1fr; }
  .auth-left { display: none; }
  .form-row { grid-template-columns: 1fr; }
}
</style>