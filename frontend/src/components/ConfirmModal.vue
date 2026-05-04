<template>
  <div v-if="show" class="confirm-overlay">
    <div class="confirm-modal">
      <div class="confirm-icon" :class="tipo">
        <AlertTriangle v-if="tipo === 'danger'" :size="24" />
        <CheckCircle v-else :size="24" />
      </div>
      <h3>{{ titulo }}</h3>
      <p>{{ mensaje }}</p>
      <div class="confirm-actions">
        <button class="btn btn-outline" @click="$emit('cancelar')">Cancelar</button>
        <button class="btn" :class="tipo === 'danger' ? 'btn-danger' : 'btn-primary'" @click="$emit('confirmar')">
          {{ textoConfirmar }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { AlertTriangle, CheckCircle } from 'lucide-vue-next'

defineProps({
  show: Boolean,
  titulo: { type: String, default: '¿Estás seguro?' },
  mensaje: { type: String, default: 'Esta acción no se puede deshacer.' },
  textoConfirmar: { type: String, default: 'Confirmar' },
  tipo: { type: String, default: 'danger' }
})

defineEmits(['confirmar', 'cancelar'])
</script>

<style scoped>
.confirm-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex; align-items: center; justify-content: center;
  z-index: 2000;
}

.confirm-modal {
  background: var(--white);
  border-radius: var(--radius);
  padding: 32px;
  width: 100%;
  max-width: 400px;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0,0,0,0.2);
}

.confirm-icon {
  width: 56px; height: 56px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 16px;
}

.confirm-icon.danger { background: #fde8e8; color: #cf3131; }
.confirm-icon.success { background: #d4f0dc; color: #1a7f37; }
.confirm-icon.warning { background: #fff3cd; color: #856404; }

.confirm-modal h3 { font-size: 18px; margin-bottom: 8px; }
.confirm-modal p { color: var(--text-light); font-size: 14px; margin-bottom: 24px; line-height: 1.5; }

.confirm-actions { display: flex; gap: 12px; justify-content: center; }

.btn-danger {
  background: #cf3131; color: white;
  border: none; padding: 10px 20px;
  border-radius: var(--radius-sm); font-size: 14px;
  font-weight: 500; cursor: pointer; transition: all 0.2s;
}
.btn-danger:hover { background: #b02828; }
</style>