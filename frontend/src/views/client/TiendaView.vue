<template>
  <div>
    <ClientNavbar />
    <main class="tienda-page">
      <div class="container">
        <div class="tienda-header">
          <h1>{{ searchQuery ? `Resultados: "${searchQuery}"` : 'Todos los Productos' }}</h1>
          <p>{{ productos.length }} productos encontrados</p>
        </div>

        <div class="tienda-layout">
          <!-- Sidebar filtros -->
          <aside class="sidebar">
            <div class="sidebar-section">
              <h3>Categorías</h3>
              <div class="cat-list">
                <button
                  class="cat-item"
                  :class="{ active: !selectedCat }"
                  @click="selectedCat = null"
                >
                  Todas
                </button>
                <button
                  v-for="cat in categorias"
                  :key="cat.id_categoria"
                  class="cat-item"
                  :class="{ active: selectedCat === cat.id_categoria }"
                  @click="selectedCat = cat.id_categoria"
                >
                  {{ cat.nombre }}
                </button>
              </div>
            </div>
          </aside>

          <!-- Productos -->
          <div class="productos-area">
            <div v-if="loading" class="loading-grid">
              <div v-for="i in 12" :key="i" class="skeleton-card" />
            </div>
            <div v-else-if="productosFiltrados.length === 0" class="empty-state">
              <p>😔 No se encontraron productos</p>
            </div>
            <div v-else class="products-grid">
              <ProductCard
                v-for="p in productosFiltrados"
                :key="p.id_producto"
                :producto="p"
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import ClientNavbar from '../../components/ClientNavbar.vue'
import ProductCard from '../../components/ProductCard.vue'
import api from '../../services/api'

const route = useRoute()
const productos = ref([])
const categorias = ref([])
const selectedCat = ref(null)
const loading = ref(true)
const searchQuery = computed(() => route.query.q || '')

const productosFiltrados = computed(() => {
  let list = productos.value
  if (selectedCat.value) list = list.filter(p => p.id_categoria === selectedCat.value)
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(p =>
      p.nombre.toLowerCase().includes(q) ||
      p.marca.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q)
    )
  }
  return list
})

onMounted(async () => {
  try {
    const [prods, cats] = await Promise.all([
      api.get('/api/productos'),
      api.get('/api/categorias'),
    ])
    productos.value = prods.data
    categorias.value = cats.data
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.tienda-page { padding: 40px 0 80px; min-height: calc(100vh - 100px); }

.tienda-header { margin-bottom: 32px; }
.tienda-header h1 { font-size: 32px; margin-bottom: 4px; }
.tienda-header p { color: var(--text-light); font-size: 14px; }

.tienda-layout { display: grid; grid-template-columns: 220px 1fr; gap: 32px; }

.sidebar { }
.sidebar-section h3 { font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--text-light); margin-bottom: 12px; }

.cat-list { display: flex; flex-direction: column; gap: 4px; }

.cat-item {
  text-align: left; padding: 9px 12px; border-radius: var(--radius-sm);
  background: none; border: none; font-size: 13px; font-weight: 500;
  color: var(--text-light); cursor: pointer; transition: all 0.15s;
}
.cat-item:hover { background: var(--alabaster); color: var(--text); }
.cat-item.active { background: var(--dark); color: var(--white); }

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
  gap: 20px;
}

.loading-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
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

@media (max-width: 768px) {
  .tienda-layout { grid-template-columns: 1fr; }
  .sidebar { display: none; }
}
</style>
