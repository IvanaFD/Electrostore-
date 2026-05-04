<template>
  <div>
    <ClientNavbar />
    <main class="tienda-page">
      <div class="container">
        <div class="tienda-header">
          <router-link to="/tienda" class="back-link">← Todos los productos</router-link>
          <h1>{{ categoriaNombre }}</h1>
          <p>{{ productos.length }} productos</p>
        </div>

        <div v-if="loading" class="loading-grid">
          <div v-for="i in 8" :key="i" class="skeleton-card" />
        </div>
        <div v-else-if="productos.length === 0" class="empty-state">
          😔 No hay productos en esta categoría
        </div>
        <div v-else class="products-grid">
          <ProductCard v-for="p in productos" :key="p.id_producto" :producto="p" />
        </div>
      </div>
    </main>

    <footer class="footer">
      <div class="container">
        <p>© 2026 ElectroStore </p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import ClientNavbar from '../../components/ClientNavbar.vue'
import ProductCard from '../../components/ProductCard.vue'
import api from '../../services/api'

const route = useRoute()
const productos = ref([])
const categoriaNombre = ref('')
const loading = ref(true)

const cargar = async () => {
  loading.value = true
  try {
    const id = route.params.id
    const [prods, cat] = await Promise.all([
      api.get('/api/productos'),
      api.get(`/api/categorias/${id}`)
    ])
    productos.value = prods.data.filter(p => p.id_categoria === parseInt(id))
    categoriaNombre.value = cat.data.nombre
  } finally {
    loading.value = false
  }
}

onMounted(cargar)
watch(() => route.params.id, cargar)
</script>

<style scoped>
.tienda-page { padding: 40px 0 80px; min-height: calc(100vh - 100px); }
.tienda-header { margin-bottom: 32px; }
.back-link { font-size: 14px; color: var(--teal); font-weight: 500; display: inline-block; margin-bottom: 12px; }
.tienda-header h1 { font-size: 32px; margin-bottom: 4px; }
.tienda-header p { color: var(--text-light); font-size: 14px; }

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}

.loading-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}

.skeleton-card {
  aspect-ratio: 0.75;
  background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: var(--radius);
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.empty-state { text-align: center; padding: 80px; color: var(--text-light); font-size: 18px; }

.footer {
  background: var(--dark); border-top: 1px solid rgba(255,255,255,0.06);
  padding: 24px 0; text-align: center;
  color: rgba(255,255,255,0.4); font-size: 13px;
}
</style>
