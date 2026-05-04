<template>
  <div>
    <ClientNavbar />
    <main class="carrito-page">
      <div class="container">
        <h1>Tu Carrito</h1>

        <div v-if="cart.items.length === 0" class="empty-cart">
          <ShoppingCart :size="64" :stroke-width="1" color="var(--teal)" />
          <h3>Tu carrito está vacío</h3>
          <p>Agrega productos desde la tienda para comenzar</p>
          <router-link to="/tienda" class="btn btn-primary">Ir a la tienda</router-link>
        </div>

        <div v-else class="carrito-layout">
          <!-- Items -->
          <div class="carrito-items">
            <div v-for="item in cart.items" :key="item.id_producto" class="cart-item">
              <img
                :src="item.imagen_url || 'https://placehold.co/80x80?text=?'"
                :alt="item.nombre"
                class="item-img"
                @error="e => e.target.src = 'https://placehold.co/80x80?text=?'"
              />
              <div class="item-info">
                <p class="item-marca">{{ item.marca }}</p>
                <h4 class="item-name">{{ item.nombre }}</h4>
                <p class="item-price">Q{{ parseFloat(item.precio_venta).toFixed(2) }}</p>
              </div>
              <div class="item-qty">
                <button @click="cart.updateQuantity(item.id_producto, item.cantidad - 1)">−</button>
                <span>{{ item.cantidad }}</span>
                <button @click="cart.updateQuantity(item.id_producto, item.cantidad + 1)">+</button>
              </div>
              <div class="item-subtotal">
                Q{{ (item.precio_venta * item.cantidad).toFixed(2) }}
              </div>
              <button class="item-remove" @click="cart.removeItem(item.id_producto)">✕</button>
            </div>
          </div>

          <!-- Resumen -->
          <div class="carrito-summary">
            <h3>Resumen del pedido</h3>
            <div class="summary-row">
              <span>Subtotal ({{ cart.totalItems }} items)</span>
              <span>Q{{ cart.totalPrice.toFixed(2) }}</span>
            </div>
            <div class="summary-divider" />
            <div class="summary-total">
              <span>Total</span>
              <span>Q{{ cart.totalPrice.toFixed(2) }}</span>
            </div>

            <p v-if="error" class="error-msg">{{ error }}</p>
            <p v-if="success" class="success-msg">{{ success }}</p>

            <button
              class="btn btn-primary checkout-btn"
              @click="confirmarCompra"
              :disabled="loading"
            >
              {{ loading ? 'Procesando...' : 'Confirmar Compra' }}
            </button>

            <router-link to="/tienda" class="btn btn-outline continue-btn">
              Seguir comprando
            </router-link>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import ClientNavbar from '../../components/ClientNavbar.vue'
import { useCartStore } from '../../stores/cart'
import { useAuthStore } from '../../stores/auth'
import api from '../../services/api'
import { ShoppingCart } from 'lucide-vue-next'

const router = useRouter()
const cart = useCartStore()
const auth = useAuthStore()
const loading = ref(false)
const error = ref('')
const success = ref('')

const confirmarCompra = async () => {
  if (!auth.isLoggedIn) return router.push('/login')
  error.value = ''
  loading.value = true
  try {
    const items = cart.items.map(i => ({
      id_producto: i.id_producto,
      cantidad: i.cantidad
    }))
    await api.post('/api/ventas', { items })
    success.value = '¡Compra realizada exitosamente!'
    cart.clearCart()
    setTimeout(() => router.push('/'), 2000)
  } catch (err) {
    error.value = err.response?.data?.error || 'Error al procesar la compra'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.carrito-page { padding: 40px 0 80px; min-height: calc(100vh - 100px); }
.carrito-page h1 { font-size: 32px; margin-bottom: 32px; }

.empty-cart {
  text-align: center; padding: 80px 20px;
  display: flex; flex-direction: column; align-items: center; gap: 16px;
}
.empty-icon { font-size: 64px; }
.empty-cart h3 { font-size: 24px; }
.empty-cart p { color: var(--text-light); }

.carrito-layout { display: grid; grid-template-columns: 1fr 360px; gap: 32px; align-items: start; }

.carrito-items { display: flex; flex-direction: column; gap: 16px; }

.cart-item {
  display: flex; align-items: center; gap: 16px;
  background: var(--white); border: 1.5px solid var(--border);
  border-radius: var(--radius); padding: 16px;
}

.item-img { width: 80px; height: 80px; object-fit: contain; border-radius: 8px; background: var(--gray); flex-shrink: 0; }

.item-info { flex: 1; }
.item-marca { font-size: 11px; font-weight: 600; color: var(--teal); text-transform: uppercase; letter-spacing: 0.05em; }
.item-name { font-size: 14px; font-weight: 600; margin: 4px 0; }
.item-price { font-size: 13px; color: var(--text-light); }

.item-qty {
  display: flex; align-items: center; gap: 0;
  border: 1.5px solid var(--border); border-radius: var(--radius-sm); overflow: hidden;
}
.item-qty button {
  width: 32px; height: 32px; background: none; border: none;
  font-size: 16px; font-weight: 700; cursor: pointer; transition: background 0.15s;
}
.item-qty button:hover { background: var(--gray); }
.item-qty span { padding: 0 12px; font-weight: 600; font-size: 14px; }

.item-subtotal { font-weight: 700; font-size: 15px; min-width: 80px; text-align: right; }

.item-remove {
  background: none; border: none; color: #ccc;
  font-size: 14px; cursor: pointer; padding: 6px; transition: color 0.15s;
}
.item-remove:hover { color: #e05555; }

.carrito-summary {
  background: var(--white); border: 1.5px solid var(--border);
  border-radius: var(--radius); padding: 24px;
  position: sticky; top: 120px;
}
.carrito-summary h3 { font-size: 18px; margin-bottom: 20px; }

.summary-row { display: flex; justify-content: space-between; font-size: 14px; color: var(--text-light); margin-bottom: 12px; }
.summary-divider { border: none; border-top: 1px solid var(--border); margin: 16px 0; }
.summary-total { display: flex; justify-content: space-between; font-size: 18px; font-weight: 700; margin-bottom: 24px; }

.checkout-btn { width: 100%; justify-content: center; padding: 14px; font-size: 15px; margin-bottom: 10px; }
.continue-btn { width: 100%; justify-content: center; padding: 12px; font-size: 14px; }

.success-msg { color: #2da44e; font-size: 13px; margin-bottom: 12px; font-weight: 500; }

@media (max-width: 900px) {
  .carrito-layout { grid-template-columns: 1fr; }
}
</style>
