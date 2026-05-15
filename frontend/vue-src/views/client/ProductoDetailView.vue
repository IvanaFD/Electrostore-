<template>
  <div>
    <ClientNavbar />
    <main class="detail-page" v-if="producto">
      <div class="container">
        <router-link :to="`/tienda/categoria/${producto.id_categoria}`" class="back-link">
          ← Volver a {{ producto.categoria }}
        </router-link>

        <div class="detail-layout">
          <!-- Imagen -->
          <div class="detail-img-wrap">
            <img
              :src="producto.imagen_url || 'https://placehold.co/500x500?text=Sin+imagen'"
              :alt="producto.nombre"
              class="detail-img"
              @error="e => e.target.src = 'https://placehold.co/500x500?text=Sin+imagen'"
            />
          </div>

          <!-- Info -->
          <div class="detail-info">
            <div class="detail-badges">
              <span class="badge-categoria">{{ producto.categoria }}</span>
              <span class="badge-stock" :class="stockClass">{{ stockLabel }}</span>
            </div>

            <p class="detail-marca">{{ producto.marca }}</p>
            <h1 class="detail-nombre">{{ producto.nombre }}</h1>
            <p class="detail-sku">SKU: {{ producto.sku }}</p>
            <p class="detail-precio">Q{{ parseFloat(producto.precio_venta).toFixed(2) }}</p>

            <div class="detail-descripcion">
              <h3>Descripción</h3>
              <p>{{ producto.descripcion }}</p>
            </div>

            <div class="detail-stock-info">
              <div class="stock-item">
                <span class="stock-label">Proveedor</span>
                <span class="stock-value">{{ producto.proveedor }}</span>
              </div>
              <div class="stock-item">
                <span class="stock-label">Stock disponible</span>
                <span class="stock-value" :class="{ 'low-stock': producto.stock_actual <= producto.stock_minimo }">
                  {{ producto.stock_actual }} unidades
                </span>
              </div>
            </div>

            <!-- Acciones -->
            <div class="detail-actions">
              <div v-if="producto.stock_actual === 0" class="out-of-stock-btn">
                Sin stock disponible
              </div>
              <template v-else>
                <div v-if="!inCart" class="add-to-cart" @click="add">
                  <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                    <line x1="3" y1="6" x2="21" y2="6"/>
                    <path d="M16 10a4 4 0 0 1-8 0"/>
                  </svg>
                  Agregar al carrito
                </div>
                <div v-else class="qty-control-detail">
                  <button @click="decrease">−</button>
                  <span>{{ qty }} en carrito</span>
                  <button @click="increase" :disabled="qty >= producto.stock_actual">+</button>
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Loading -->
    <div v-else class="detail-loading">
      <div class="container">
        <div class="skeleton-detail" />
      </div>
    </div>

    <footer class="footer">
      <div class="container">
        <p>© 2026 ElectroStore </p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ClientNavbar from '../../components/ClientNavbar.vue'
import { useCartStore } from '../../stores/cart'
import { useAuthStore } from '../../stores/auth'
import api from '../../services/api'

const route = useRoute()
const router = useRouter()
const cart = useCartStore()
const auth = useAuthStore()

const producto = ref(null)

const cartItem = computed(() => cart.items.find(i => i.id_producto === producto.value?.id_producto))
const inCart = computed(() => !!cartItem.value)
const qty = computed(() => cartItem.value?.cantidad || 0)

const stockClass = computed(() => {
  if (!producto.value) return ''
  if (producto.value.stock_actual === 0) return 'badge-sin-stock'
  if (producto.value.stock_actual <= producto.value.stock_minimo) return 'badge-stock-bajo'
  return 'badge-en-stock'
})

const stockLabel = computed(() => {
  if (!producto.value) return ''
  if (producto.value.stock_actual === 0) return 'Sin stock'
  if (producto.value.stock_actual <= producto.value.stock_minimo) return 'Stock bajo'
  return 'En stock'
})

const add = () => {
  if (!auth.isLoggedIn) return router.push('/login')
  cart.addItem(producto.value)
}

const increase = () => {
  if (qty.value >= producto.value.stock_actual) return
  cart.updateQuantity(producto.value.id_producto, qty.value + 1)
}

const decrease = () => cart.updateQuantity(producto.value.id_producto, qty.value - 1)

onMounted(async () => {
  try {
    const { data } = await api.get(`/api/productos/${route.params.id}`)
    producto.value = data
  } catch {
    router.push('/tienda')
  }
})
</script>

<style scoped>
.detail-page { padding: 32px 0 80px; min-height: calc(100vh - 100px); }

.back-link {
  display: inline-block;
  font-size: 14px;
  color: var(--teal);
  font-weight: 500;
  margin-bottom: 32px;
  transition: opacity 0.2s;
}
.back-link:hover { opacity: 0.7; }

.detail-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 64px;
  align-items: start;
}

.detail-img-wrap {
  background: var(--gray);
  border-radius: var(--radius);
  border: 1.5px solid var(--border);
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: sticky;
  top: 120px;
}

.detail-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 32px;
}

.detail-badges {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.badge-categoria {
  background: var(--dark);
  color: var(--white);
  font-size: 11px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 999px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.badge-stock {
  font-size: 11px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 999px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.badge-en-stock { background: #d4f0dc; color: #1a7f37; }
.badge-stock-bajo { background: #fff3cd; color: #856404; }
.badge-sin-stock { background: #fde8e8; color: #cf3131; }

.detail-marca {
  font-size: 12px;
  font-weight: 700;
  color: var(--teal);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 8px;
}

.detail-nombre {
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 8px;
  line-height: 1.2;
}

.detail-sku {
  font-size: 13px;
  color: var(--text-light);
  margin-bottom: 16px;
}

.detail-precio {
  font-size: 25px;
  font-weight: 800;
  color: var(--dark);
  margin-bottom: 24px;
  
}

.detail-descripcion {
  background: var(--gray);
  border-radius: var(--radius-sm);
  padding: 16px;
  margin-bottom: 20px;
}

.detail-descripcion h3 {
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-light);
  margin-bottom: 8px;
}

.detail-descripcion p {
  font-size: 14px;
  color: var(--text);
  line-height: 1.7;
}

.detail-stock-info {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 28px;
}

.stock-item {
  background: var(--gray);
  border-radius: var(--radius-sm);
  padding: 12px 16px;
}

.stock-label {
  display: block;
  font-size: 11px;
  font-weight: 600;
  color: var(--text-light);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 4px;
}

.stock-value {
  font-size: 15px;
  font-weight: 600;
  color: var(--text);
}

.low-stock { color: #856404; }

.detail-actions { }

.add-to-cart {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  padding: 16px;
  background: var(--dark);
  color: var(--white);
  border-radius: var(--radius-sm);
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.add-to-cart:hover { background: var(--teal); transform: translateY(-1px); }

.out-of-stock-btn {
  width: 100%;
  padding: 16px;
  background: var(--alabaster);
  color: var(--text-light);
  border-radius: var(--radius-sm);
  font-size: 16px;
  font-weight: 600;
  text-align: center;
  cursor: not-allowed;
}

.qty-control-detail {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 2px solid var(--teal);
  border-radius: var(--radius-sm);
  overflow: hidden;
  height: 54px;
}

.qty-control-detail button {
  width: 54px;
  height: 100%;
  background: none;
  border: none;
  font-size: 22px;
  font-weight: 700;
  color: var(--dark);
  cursor: pointer;
  transition: background 0.15s;
}

.qty-control-detail button:hover:not(:disabled) { background: var(--teal); color: white; }
.qty-control-detail button:disabled { opacity: 0.3; cursor: not-allowed; }

.qty-control-detail span {
  font-weight: 700;
  font-size: 15px;
  color: var(--dark);
}

.detail-loading { padding: 80px 0; }
.skeleton-detail {
  height: 400px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: var(--radius);
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

@media (max-width: 768px) {
  .detail-layout { grid-template-columns: 1fr; gap: 32px; }
  .detail-img-wrap { position: static; }
  .detail-nombre { font-size: 24px; }
}

.footer {
  background: var(--dark); border-top: 1px solid rgba(255,255,255,0.06);
  padding: 24px 0; text-align: center;
  color: rgba(255,255,255,0.4); font-size: 13px;
}
</style>