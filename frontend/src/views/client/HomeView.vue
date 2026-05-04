<template>
  <div>
    <ClientNavbar />

    <main>
      <!-- Carousel -->
      <section class="carousel-section">
        <div class="carousel">
          <div class="carousel-track" :style="{ transform: `translateX(-${current * 100}%)` }">
            <div v-for="(img, i) in banners" :key="i" class="carousel-slide">
              <img :src="img" alt="Banner" />
            </div>
          </div>
          <button class="carousel-btn prev" @click="prev">&#8249;</button>
          <button class="carousel-btn next" @click="next">&#8250;</button>
          <div class="carousel-dots">
            <span
              v-for="(_, i) in banners"
              :key="i"
              class="dot"
              :class="{ active: i === current }"
              @click="current = i"
            />
          </div>
        </div>
      </section>

      <!-- Productos mas vendidos -->
      <section class="section">
        <div class="container">
          <div class="section-header">
            <h2>Más Vendidos</h2>
            <router-link to="/tienda" class="btn btn-outline">Ver todos</router-link>
          </div>
          <div class="products-grid" v-if="masVendidos.length">
            <ProductCard v-for="p in masVendidos.slice(0,8)" :key="p.id_producto" :producto="p" />
          </div>
          <div v-else class="loading-grid">
            <div v-for="i in 8" :key="i" class="skeleton-card" />
          </div>
        </div>
      </section>

      <!-- Categorias -->
      <section class="section section-gray">
        <div class="container">
          <div class="section-header">
            <h2>Explora por Categoría</h2>
          </div>
          <div class="categories-grid">
            <router-link
              v-for="cat in categorias"
              :key="cat.id_categoria"
              :to="`/tienda/categoria/${cat.id_categoria}`"
              class="category-card"
            >
              <div class="category-icon">
                <component :is="getCatIcon(cat.nombre)" :size="28" />
              </div>
              <span>{{ cat.nombre }}</span>
            </router-link>
          </div>
        </div>
      </section>

      <!-- CTA -->
      <section class="cta-section">
        <div class="container">
          <div class="cta-box">
            <div class="cta-content">
              <h2>¿Listo para tu próximo proyecto?</h2>
              <p>Encuentra todos los componentes que necesitas para hacer realidad tus ideas.</p>
              <div class="cta-actions">
                <router-link v-if="!auth.isLoggedIn" to="/registro" class="btn btn-teal">
                  Crear cuenta gratis
                </router-link>
                <router-link v-if="!auth.isLoggedIn" to="/login" class="btn btn-outline-white">
                  Iniciar sesión
                </router-link>
                <router-link v-else to="/tienda" class="btn btn-teal">
                  Ir a la tienda
                </router-link>
              </div>
            </div>
            <div class="cta-decoration">⚡</div>
          </div>
        </div>
      </section>
    </main>

    <!-- Footer simple -->
    <footer class="footer">
      <div class="container">
        <p>© 2026 ElectroStore </p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import ClientNavbar from '../../components/ClientNavbar.vue'
import ProductCard from '../../components/ProductCard.vue'
import { useAuthStore } from '../../stores/auth'
import api from '../../services/api'


const auth = useAuthStore()

const banners = [
  'https://res.cloudinary.com/dajf4aqhf/image/upload/v1777849435/banner1_ai1f3k.jpg',
  'https://res.cloudinary.com/dajf4aqhf/image/upload/v1777849404/banner3_ypwpr4.jpg',
  'https://res.cloudinary.com/dajf4aqhf/image/upload/v1777849694/banner4_rew9cc.jpg',
]

const current = ref(0)
const masVendidos = ref([])
const categorias = ref([])
let timer = null

const prev = () => current.value = (current.value - 1 + banners.length) % banners.length
const next = () => current.value = (current.value + 1) % banners.length

import { BatteryFull,Cpu, Radio, MemoryStick, Omega, Equal, Lightbulb, Wrench, Cable, Battery, ToggleLeft, SlidersHorizontal, Cog, CircuitBoard } from 'lucide-vue-next'

const getCatIcon = (nombre) => {
  const icons = {
    'Boards de Desarrollo': Cpu,
    'Sensores': Radio,
    'Modulos': MemoryStick,
    'Resistencias': Omega,
    'Capacitores': Equal,
    'LED': Lightbulb,
    'Herramienta': Wrench,
    'Cable y Alambre': Cable,
    'Fuentes de Poder y Baterias': BatteryFull,
    'Reles, Pulsadores y Switches': ToggleLeft,
    'Potenciometros': SlidersHorizontal,
    'Motores y Servos': Cog,
    'Circuitos Integrados': CircuitBoard,
  }
  return icons[nombre] || Cpu
}


onMounted(async () => {
  try {
    const [prods, cats] = await Promise.all([
      api.get('/api/productos'),
      api.get('/api/categorias'),
    ])
    masVendidos.value = prods.data.slice(0, 8)
    categorias.value = cats.data
  } catch {}

  timer = setInterval(next, 4000)
})

onUnmounted(() => clearInterval(timer))
</script>

<style scoped>
/* Carousel */
.carousel-section { background: var(--dark); }
.carousel { position: relative; overflow: hidden; height: 40rem;  }
.carousel-track { display: flex; height: 100%; transition: transform 1s ease; }
.carousel-slide { min-width: 100%; height: 100%; overflow: hidden; }
.carousel-slide img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center top;
}

.carousel-btn {
  position: absolute; top: 50%; transform: translateY(-50%);
  background: rgba(255,255,255,0.15); backdrop-filter: blur(8px);
  border: none; color: white; font-size: 28px; width: 48px; height: 48px;
  border-radius: 50%; cursor: pointer; transition: all 0.2s; z-index: 10;
}
.carousel-btn:hover { background: rgba(255,255,255,0.3); }
.prev { left: 20px; }
.next { right: 20px; }

.carousel-dots {
  position: absolute; bottom: 16px; left: 50%; transform: translateX(-50%);
  display: flex; gap: 8px;
}
.dot { width: 8px; height: 8px; border-radius: 50%; background: rgba(255,255,255,0.4); cursor: pointer; transition: all 0.2s; }
.dot.active { background: var(--teal); transform: scale(1.3); }

/* Sections */
.section { padding: 64px 0; }
.section-gray { background: var(--gray); }

.section-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 32px;
}
.section-header h2 { font-size: 28px; }

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
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: var(--radius);
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Categories */
.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 16px;
}

.category-card {
  display: flex; flex-direction: column; align-items: center; gap: 10px;
  padding: 24px 16px; background: var(--white); border-radius: var(--radius);
  border: 1.5px solid var(--border); text-align: center;
  font-size: 13px; font-weight: 500; color: var(--text);
  transition: all 0.2s;
}

.category-card:hover {
  border-color: var(--teal); background: var(--teal);
  color: white; transform: translateY(-3px);
}

.category-icon { font-size: 28px; }

/* CTA */
.cta-section { padding: 64px 0; background: var(--dark); }
.cta-box {
  display: flex; align-items: center; justify-content: space-between;
  background: var(--dark2); border-radius: 24px; padding: 56px;
  border: 1px solid rgba(115,191,176,0.2);
}

.cta-content h2 { font-size: 36px; color: var(--white); margin-bottom: 12px; }
.cta-content p { color: rgba(255,255,255,0.6); font-size: 16px; margin-bottom: 28px; }

.cta-actions { display: flex; gap: 12px; flex-wrap: wrap; }

.btn-outline-white {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 10px 20px; border-radius: var(--radius-sm);
  font-size: 14px; font-weight: 500;
  background: transparent; color: white;
  border: 1.5px solid rgba(255,255,255,0.3);
  transition: all 0.2s;
}
.btn-outline-white:hover { border-color: white; background: rgba(255,255,255,0.1); }

.cta-decoration { font-size: 120px; opacity: 0.15; }

/* Footer */
.footer {
  background: var(--dark); border-top: 1px solid rgba(255,255,255,0.06);
  padding: 24px 0; text-align: center;
  color: rgba(255,255,255,0.4); font-size: 13px;
}
</style>
