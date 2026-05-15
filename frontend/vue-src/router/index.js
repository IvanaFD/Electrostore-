import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const routes = [
  // Cliente
  { path: '/', component: () => import('../views/client/HomeView.vue') },
  { path: '/tienda', component: () => import('../views/client/TiendaView.vue') },
  { path: '/tienda/categoria/:id', component: () => import('../views/client/CategoriaView.vue') },
  { path: '/carrito', component: () => import('../views/client/CarritoView.vue') },
  { path: '/perfil', component: () => import('../views/client/PerfilView.vue'), meta: { requiresAuth: true, rol: 'cliente' } },
  { path: '/producto/:id', component: () => import('../views/client/ProductoDetailView.vue') },

  // Auth
  { path: '/login', component: () => import('../views/auth/LoginView.vue') },
  { path: '/registro', component: () => import('../views/auth/RegistroView.vue') },

  // Admin/vendedor (los haremos después)
  { 
  path: '/admin',
  component: () => import('../views/admin/AdminLayout.vue'),
  meta: { requiresAuth: true, rol: 'staff' },
  children: [
    { path: '', component: () => import('../views/admin/DashboardView.vue') },
    { path: 'inventario', component: () => import('../views/admin/InventarioView.vue') },
    { path: 'ventas', component: () => import('../views/admin/VentasAdminView.vue') },
    { path: 'ordenes', component: () => import('../views/admin/OrdenesAdminView.vue') },
    { path: 'empleados', component: () => import('../views/admin/EmpleadosAdminView.vue') },
    { path: 'perfil', component: () => import('../views/admin/PerfilAdminView.vue') },
  ]
}
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

router.beforeEach((to) => {
  const auth = useAuthStore()

  if (to.meta.requiresAuth && !auth.isLoggedIn) {
    return '/login'
  }

  if (to.meta.rol === 'cliente' && !auth.isCliente) {
    return '/'
  }

  if (to.meta.rol === 'staff' && !auth.isStaff) {
    return '/'
  }
})

export default router