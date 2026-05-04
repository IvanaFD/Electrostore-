<template>
  <div class="product-card" @click="router.push(`/producto/${producto.id_producto}`)">
    <div class="product-img-wrap">
      <img
        :src="producto.imagen_url || 'https://placehold.co/300x300?text=Sin+imagen'"
        :alt="producto.nombre"
        class="product-img"
        @error="e => e.target.src = 'https://placehold.co/300x300?text=Sin+imagen'"
      />
      <div class="product-category">{{ producto.categoria }}</div>
    </div>

    <div class="product-body">
      <p class="product-marca">{{ producto.marca }}</p>
      <h3 class="product-name">{{ producto.nombre }}</h3>
      <p class="product-price">Q{{ parseFloat(producto.precio_venta).toFixed(2) }}</p>

      <div class="product-actions" @click.stop>
        <div v-if="producto.stock_actual === 0" class="out-of-stock">
          Sin stock
        </div>
        <div v-else-if="!inCart" class="add-btn" @click="add">
          <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          Agregar
        </div>
        <div v-else class="qty-control" @click.stop>
          <button @click="decrease">−</button>
          <span>{{ qty }}</span>
          <button @click="increase" :disabled="qty >= producto.stock_actual">+</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useCartStore } from '../stores/cart'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'

const props = defineProps({ producto: Object })
const cart = useCartStore()
const auth = useAuthStore()
const router = useRouter()

const cartItem = computed(() => cart.items.find(i => i.id_producto === props.producto.id_producto))
const inCart = computed(() => !!cartItem.value)
const qty = computed(() => cartItem.value?.cantidad || 0)

const add = () => {
  if (!auth.isLoggedIn) return router.push('/login')
  cart.addItem(props.producto)
}

const increase = () => {
  if (qty.value >= props.producto.stock_actual) return
  cart.updateQuantity(props.producto.id_producto, qty.value + 1)
}

const decrease = () => cart.updateQuantity(props.producto.id_producto, qty.value - 1)
</script>

<style scoped>
.product-card {
  background: var(--white);
  border-radius: var(--radius);
  border: 1.5px solid var(--border);
  overflow: hidden;
  transition: all 0.25s;
  cursor: pointer;
}

.product-card:hover {
  border-color: var(--teal);
  box-shadow: 0 8px 32px rgba(115,191,176,0.15);
  transform: translateY(-3px);
}

.product-img-wrap {
  position: relative;
  aspect-ratio: 1;
  background: var(--gray);
  overflow: hidden;
}

.product-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 16px;
  transition: transform 0.3s;
}

.product-card:hover .product-img { transform: scale(1.05); }

.product-category {
  position: absolute;
  top: 10px;
  left: 10px;
  background: var(--dark);
  color: var(--white);
  font-size: 10px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 999px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.product-body {
  padding: 14px;
}

.product-marca {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--teal);
  margin-bottom: 4px;
}

.product-name {
  font-family: 'Syne', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 8px;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-price {
  font-size: 18px;
  font-weight: 700;
  color: var(--dark);
  margin-bottom: 12px;
}

.add-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  padding: 9px;
  background: var(--dark);
  color: var(--white);
  border-radius: var(--radius-sm);
  font-size: 13px;
  font-weight: 600;
  transition: all 0.2s;
}

.add-btn:hover { background: var(--teal); }

.qty-control {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--gray);
  border-radius: var(--radius-sm);
  overflow: hidden;
  border: 1.5px solid var(--teal);
}

.qty-control button {
  width: 38px;
  height: 36px;
  background: none;
  border: none;
  font-size: 18px;
  font-weight: 700;
  color: var(--dark);
  transition: background 0.15s;
}

.out-of-stock {
  width: 100%;
  padding: 9px;
  background: var(--alabaster);
  color: var(--text-light);
  border-radius: var(--radius-sm);
  font-size: 13px;
  font-weight: 600;
  text-align: center;
  cursor: not-allowed;
}

.qty-control button:hover { background: var(--teal); color: white; }

.qty-control span {
  font-weight: 700;
  font-size: 15px;
  color: var(--dark);
}
</style>