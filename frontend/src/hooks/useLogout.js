import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useCart } from '@/contexts/CartContext'

export function useLogout() {
    const { logout } = useAuth()
    const { clearCart } = useCart()
    const navigate = useNavigate()

    return useCallback(() => {
        clearCart()
        logout()
        navigate('/login')
    }, [logout, clearCart, navigate])
}
