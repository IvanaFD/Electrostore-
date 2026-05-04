import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCartStore = defineStore('cart', () => {
  const items = ref(JSON.parse(localStorage.getItem('cart') || '[]'))

  const totalItems = computed(() => items.value.reduce((sum, i) => sum + i.cantidad, 0))
  const totalPrice = computed(() => items.value.reduce((sum, i) => sum + i.precio_venta * i.cantidad, 0))

  const saveCart = () => localStorage.setItem('cart', JSON.stringify(items.value))

  const addItem = (producto, cantidad = 1) => {
    const existing = items.value.find(i => i.id_producto === producto.id_producto)
    if (existing) {
      existing.cantidad += cantidad
    } else {
      items.value.push({ ...producto, cantidad })
    }
    saveCart()
  }

  const removeItem = (id_producto) => {
    items.value = items.value.filter(i => i.id_producto !== id_producto)
    saveCart()
  }

  const updateQuantity = (id_producto, cantidad) => {
    const item = items.value.find(i => i.id_producto === id_producto)
    if (item) {
      if (cantidad <= 0) removeItem(id_producto)
      else item.cantidad = cantidad
    }
    saveCart()
  }

  const clearCart = () => {
    items.value = []
    localStorage.removeItem('cart')
  }

  return { items, totalItems, totalPrice, addItem, removeItem, updateQuantity, clearCart }
})