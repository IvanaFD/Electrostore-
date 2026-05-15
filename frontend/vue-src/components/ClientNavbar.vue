<template>
  <header class="navbar-wrapper" @click="showMore = false">
    <!-- Navbar principal -->
    <nav class="navbar">
      <div class="container navbar-inner">
        <!-- Logo -->
        <router-link to="/" class="logo">
          <div class="logo-icon">
            <img src="/logo.png" alt="Logo" />
          </div>
          <span class="logo-text">ElectroStore</span>
        </router-link>

        <!-- Buscador -->
        <form class="search-bar" @submit.prevent="buscar" style="position:relative">
          <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="¿Qué componente buscas?"
            @input="buscarSugerencias"
            @blur="setTimeout(() => showSugerencias = false, 200)"
          />
          <div v-if="showSugerencias" class="search-dropdown">
            <div
              v-for="p in sugerencias"
              :key="p.id_producto"
              class="search-item"
              @mousedown="seleccionarSugerencia(p)"
            >
              <img
                :src="p.imagen_url || 'https://placehold.co/40x40'"
                :alt="p.nombre"
                class="search-img"
                @error="e => e.target.src = 'https://placehold.co/40x40'"
              />
              <div class="search-info">
                <p class="search-name">{{ p.nombre }}</p>
                <p class="search-sku">{{ p.sku }}</p>
              </div>
              <p class="search-price">Q{{ parseFloat(p.precio_venta).toFixed(2) }}</p>
            </div>
          </div>
        </form>

        <!-- Iconos derecha -->
        <div class="nav-actions">
          <!-- Perfil -->
          <<!-- Perfil -->
          <div class="nav-action" @click="handlePerfil">
            <User :size="22" :stroke-width="1.8" />
            <span class="nav-action-label">{{ auth.isLoggedIn ? auth.user.username : 'Cuenta' }}</span>
          </div>

          <!-- Carrito -->
          <div class="nav-action cart-action" @click="handleCarrito">
            <div class="cart-icon-wrap">
              <ShoppingCart  :size="22" :stroke-width="1.8" />
              <span v-if="cart.totalItems > 0" class="badge cart-badge">{{ cart.totalItems }}</span>
            </div>
            <span class="nav-action-label">Carrito</span>
          </div>
        </div>
      </div>
    </nav>

    <!-- Barra de categorias -->
    <div class="categories-bar">
      <div class="container categories-inner">
        <router-link
          v-for="cat in categoriasVisibles"
          :key="cat.id_categoria"
          :to="`/tienda/categoria/${cat.id_categoria}`"
          class="cat-link"
        >
          {{ cat.nombre }}
        </router-link>

        <div v-if="categoriasOcultas.length > 0" class="cat-more-wrap" @click.stop>
          <div class="cat-more" @click.stop="showMore = !showMore">
            Más
            <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path d="m6 9 6 6 6-6"/>
            </svg>
          </div>
          <div v-show="showMore" class="cat-dropdown">
            <router-link
              v-for="cat in categoriasOcultas"
              :key="cat.id_categoria"
              :to="`/tienda/categoria/${cat.id_categoria}`"
              class="cat-dropdown-item"
              @click="showMore = false"
            >
              {{ cat.nombre }}
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useCartStore } from '../stores/cart'
import api from '../services/api'
import { User, ShoppingCart  } from 'lucide-vue-next'

const router = useRouter()
const auth = useAuthStore()
const cart = useCartStore()

const searchQuery = ref('')
const categorias = ref([])
const showMore = ref(false)
const MAX_VISIBLE = 5

const productos = ref([])
const sugerencias = ref([])
const showSugerencias = ref(false)

const categoriasVisibles = computed(() => categorias.value.slice(0, MAX_VISIBLE))
const categoriasOcultas = computed(() => categorias.value.slice(MAX_VISIBLE))

onMounted(async () => {
  try {
    const { data } = await api.get('/api/categorias')
    categorias.value = data
    const { data: prods } = await api.get('/api/productos')
    productos.value = prods
  } catch {}
})

const buscar = () => {
  if (searchQuery.value.trim()) {
    router.push({ path: '/tienda', query: { q: searchQuery.value } })
  }
}

const handlePerfil = () => {
  if (!auth.isLoggedIn) return router.push('/login')
  if (auth.isCliente) return router.push('/perfil')
  router.push('/admin')
}

const handleCarrito = () => {
  if (!auth.isLoggedIn) return router.push('/login')
  router.push('/carrito')
}

const buscarSugerencias = () => {
  const q = searchQuery.value.toLowerCase().trim()
  if (q.length < 2) { sugerencias.value = []; showSugerencias.value = false; return }
  sugerencias.value = productos.value
    .filter(p => p.nombre.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q))
    .slice(0, 6)
  showSugerencias.value = sugerencias.value.length > 0
}

const seleccionarSugerencia = (p) => {
  showSugerencias.value = false
  searchQuery.value = ''
  router.push(`/tienda/categoria/${p.id_categoria}`)
}

</script>

<style scoped>
.navbar-wrapper {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--dark);
  box-shadow: 0 2px 16px rgba(9,40,48,0.15);
}

.navbar { padding: 14px 0; }

.navbar-inner {
  display: flex;
  align-items: center;
  gap: 24px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
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
  font-weight: 800;
  font-size: 20px;
  color: var(--white);
  letter-spacing: -0.5px;
}

.logo-icon img {
  width: 10rem;
  height: 10rem;
  object-fit: contain;
  border-radius: 10px;
}
.search-bar {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(255,255,255,0.1);
  border: 1.5px solid rgba(255,255,255,0.15);
  border-radius: 999px;
  padding: 10px 18px;
  transition: all 0.2s;
}

.search-bar:focus-within {
  background: rgba(255,255,255,0.15);
  border-color: var(--teal);
}

.search-bar svg { color: rgba(255,255,255,0.5); flex-shrink: 0; }

.search-bar input {
  flex: 1;
  background: none;
  border: none;
  outline: none;
  color: var(--white);
  font-size: 14px;
}

.search-bar input::placeholder { color: rgba(255,255,255,0.4); }

.nav-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.nav-action {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 8px 14px;
  border-radius: var(--radius-sm);
  color: rgba(255,255,255,0.8);
  cursor: pointer;
  transition: all 0.2s;
}

.nav-action:hover {
  background: rgba(255,255,255,0.1);
  color: var(--white);
}

.nav-action-label {
  font-size: 11px;
  font-weight: 500;
  max-width: 70px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.search-dropdown {
  position: absolute;
  top: calc(100% + 10px);
  left: 0; right: 0;
  background: var(--white);
  border-radius: var(--radius);
  box-shadow: 0 8px 32px rgba(0,0,0,0.25);
  overflow: hidden;
  z-index: 300;
}

.search-item {
  display: flex; align-items: center; gap: 12px;
  padding: 10px 16px; cursor: pointer;
  border-bottom: 1px solid var(--border);
  transition: background 0.15s;
}
.search-item:last-child { border-bottom: none; }
.search-item:hover { background: var(--gray); }

.search-img {
  width: 40px; height: 40px;
  object-fit: contain; border-radius: 6px;
  background: var(--gray); flex-shrink: 0;
}

.search-info { flex: 1; }
.search-name { font-size: 13px; font-weight: 500; color: var(--text); }
.search-sku { font-size: 11px; color: var(--text-light); }
.search-price { font-size: 13px; font-weight: 700; color: var(--dark); white-space: nowrap; }

.cart-icon-wrap {
  position: relative;
}

.cart-badge {
  position: absolute;
  top: -6px;
  right: -8px;
  min-width: 16px;
  height: 16px;
  font-size: 10px;
  background: var(--green);
}

/* Barra categorias */


.categories-bar {
  background: var(--dark2);
  border-top: 1px solid rgba(255,255,255,0.06);
  overflow: visible;
}

.categories-inner {
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  gap: 4px;
  padding: 0;
  overflow: visible;
  scrollbar-width: none;
}

.categories-inner::-webkit-scrollbar { display: none; }

.cat-more-wrap {
  position: relative;
  flex-shrink: 0;
}
.cat-link {
  padding: 10px 14px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.6);
  white-space: nowrap;
  transition: all 0.2s;
  border-bottom: 2px solid transparent;
}

.cat-link:hover, .cat-link.router-link-active {
  color: var(--teal);
  border-bottom-color: var(--teal);
}

.cat-more {
  position: relative;
  padding: 10px 14px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.6);
  white-space: nowrap;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: color 0.2s;
}

.cat-more:hover { color: var(--teal); }

.cat-dropdown {
  position: absolute;
  top: calc(100% + 2px);
  left: 0;
  background: var(--dark);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: var(--radius-sm);
  min-width: 200px;
  box-shadow: var(--shadow);
  z-index: 200;
}

.cat-dropdown-item {
  display: block;
  padding: 10px 16px;
  font-size: 13px;
  color: rgba(255,255,255,0.7);
  transition: all 0.15s;
  text-transform: none;
  letter-spacing: normal;
  font-weight: 400;
}

.cat-dropdown-item:hover {
  background: rgba(255,255,255,0.05);
  color: var(--teal);
}
</style>