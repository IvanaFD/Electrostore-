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
        <h1>Bienvenido de vuelta</h1>
        <p>Inicia sesión para continuar con tus compras o gestionar tu cuenta.</p>
      </div>
    </div>

    <div class="auth-right">
      <div class="auth-card">
        <h2>Iniciar Sesión</h2>
        <p class="auth-subtitle">Ingresa tus credenciales</p>

        <form @submit.prevent="handleLogin">
          <div class="form-group">
            <label>Usuario</label>
            <input
              v-model="form.username"
              type="text"
              class="form-control"
              placeholder="tu_usuario"
              required
            />
          </div>

          <div class="form-group">
            <label>Contraseña</label>
            <div class="password-wrap">
              <input
                v-model="form.password"
                :type="showPass ? 'text' : 'password'"
                class="form-control"
                placeholder="••••••••"
                required
              />
              <button type="button" class="toggle-pass" @click="showPass = !showPass">
                <component :is="showPass ? EyeOff : Eye" :size="18" />
              </button>
            </div>
          </div>

          <p v-if="error" class="error-msg">{{ error }}</p>

          <button type="submit" class="btn btn-primary w-full" :disabled="loading">
            <span v-if="loading">Ingresando...</span>
            <span v-else>Iniciar Sesión</span>
          </button>
        </form>

        <div class="auth-footer">
          <p>¿No tienes cuenta? <router-link to="/registro">Regístrate</router-link></p>
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

const router = useRouter()
const auth = useAuthStore()

const form = ref({ username: '', password: '' })
const error = ref('')
const loading = ref(false)
const showPass = ref(false)

const handleLogin = async () => {
  error.value = ''
  loading.value = true
  try {
    const data = await auth.login(form.value.username, form.value.password)
    if (data.user.rol === 'cliente') router.push('/')
    else router.push('/admin')
  } catch (err) {
    error.value = err.response?.data?.error || 'Error al iniciar sesión'
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

.auth-brand {
  max-width: 400px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 48px;
}

.logo-icon {
  width: 44px;
  height: 44px;
  background: var(--teal);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
}

.logo-text {
  font-family: 'Syne', sans-serif;
  font-weight: 800;
  font-size: 22px;
  color: var(--white);
}

.logo-icon img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 10px;
}

.auth-brand h1 {
  font-size: 40px;
  color: var(--white);
  margin-bottom: 16px;
}

.auth-brand p {
  color: rgba(255,255,255,0.5);
  font-size: 16px;
  line-height: 1.7;
}

.auth-right {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px;
  background: var(--gray);
}

.auth-card {
  background: var(--white);
  border-radius: 20px;
  padding: 40px;
  width: 100%;
  max-width: 400px;
  box-shadow: var(--shadow);
}

.auth-card h2 {
  font-size: 28px;
  margin-bottom: 6px;
}

.auth-subtitle {
  color: var(--text-light);
  font-size: 14px;
  margin-bottom: 28px;
}

.password-wrap {
  position: relative;
}

.password-wrap .form-control {
  padding-right: 44px;
}

.toggle-pass {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
}

.w-full { width: 100%; justify-content: center; padding: 12px; font-size: 15px; }

.auth-footer {
  margin-top: 24px;
  text-align: center;
  font-size: 14px;
  color: var(--text-light);
}

.auth-footer a {
  color: var(--teal);
  font-weight: 600;
}

@media (max-width: 768px) {
  .auth-page { grid-template-columns: 1fr; }
  .auth-left { display: none; }
}
</style>
