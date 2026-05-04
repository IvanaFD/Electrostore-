<template>
  <div class="admin-layout">
    <aside class="sidebar">
      <div class="sidebar-header">
        <router-link to="/" class="sidebar-logo">
          <div class="logo-icon">
            <img src="/logo.png" alt="Logo" />
          </div>
          <span>ElectroStore</span>
        </router-link>
      </div>

      <nav class="sidebar-nav">
        <router-link to="/admin" class="nav-item" exact>
          <LayoutDashboard :size="18" /> Dashboard
        </router-link>
        <router-link to="/admin/inventario" class="nav-item">
          <Package :size="18" /> Inventario
        </router-link>
        <router-link to="/admin/ventas" class="nav-item">
          <ShoppingCart :size="18" /> Ventas
        </router-link>
        <router-link to="/admin/ordenes" class="nav-item">
          <Truck :size="18" /> Órdenes
        </router-link>
        <router-link v-if="auth.isAdmin" to="/admin/empleados" class="nav-item">
          <Users :size="18" /> Empleados
        </router-link>
        <router-link to="/admin/perfil" class="nav-item">
          <UserCircle :size="18" /> Mi Perfil
        </router-link>
      </nav>

      <div class="sidebar-footer">
        <div class="user-info">
          <div class="user-avatar">{{ iniciales }}</div>
          <div>
            <p class="user-name">{{ auth.user?.username }}</p>
            <p class="user-rol">{{ auth.user?.rol }}</p>
          </div>
        </div>
        <button class="logout-btn" @click="handleLogout">
          <LogOut :size="16" />
        </button>
      </div>
    </aside>

    <main class="admin-content">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { LayoutDashboard, Package, ShoppingCart, Truck, Users, UserCircle, LogOut } from 'lucide-vue-next'

const router = useRouter()
const auth = useAuthStore()

const iniciales = computed(() => auth.user?.username?.slice(0, 2).toUpperCase() || 'AD')

const handleLogout = () => {
  auth.logout()
  router.push('/login')
}
</script>

<style scoped>
.admin-layout { display: grid; grid-template-columns: 240px 1fr; min-height: 100vh; }

.sidebar {
  background: var(--dark);
  display: flex; flex-direction: column;
  position: sticky; top: 0; height: 100vh; overflow-y: auto;
}

.sidebar-header { padding: 20px; border-bottom: 1px solid rgba(255,255,255,0.06); }

.sidebar-logo {
  display: flex; align-items: center; gap: 10px;
  color: var(--white); font-family: 'Syne', sans-serif;
  font-weight: 800; font-size: 16px;
}

.logo-icon {
  width: 36px; height: 36px; background: var(--teal);
  border-radius: 8px; display: flex; align-items: center;
  justify-content: center; overflow: hidden;
}
.logo-icon img { width: 100%; height: 100%; object-fit: contain; }

.sidebar-nav { flex: 1; padding: 16px 12px; display: flex; flex-direction: column; gap: 4px; }

.nav-item {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 12px; border-radius: var(--radius-sm);
  color: rgba(255,255,255,0.5); font-size: 14px; font-weight: 500;
  transition: all 0.2s;
}
.nav-item:hover { background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.9); }
.nav-item.router-link-active { background: var(--teal); color: white; }

.sidebar-footer {
  padding: 16px; border-top: 1px solid rgba(255,255,255,0.06);
  display: flex; align-items: center; gap: 10px;
}

.user-info { display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0; }

.user-avatar {
  width: 36px; height: 36px; border-radius: 50%;
  background: var(--dark2); border: 2px solid var(--teal);
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 700; color: var(--teal); flex-shrink: 0;
}

.user-name { font-size: 13px; font-weight: 600; color: var(--white); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.user-rol { font-size: 11px; color: rgba(255,255,255,0.4); text-transform: capitalize; }

.logout-btn {
  background: none; border: none; color: rgba(255,255,255,0.4);
  cursor: pointer; padding: 6px; border-radius: 6px; transition: all 0.2s; flex-shrink: 0;
}
.logout-btn:hover { color: #e05555; background: rgba(224,85,85,0.1); }

.admin-content { background: var(--gray); min-height: 100vh; }
</style>