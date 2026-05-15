import { createContext, useContext, useReducer, useEffect, useMemo, useCallback } from 'react'

const CartContext = createContext(null)

const cartReducer = (state, action) => {
    switch (action.type) {
        case 'ADD_ITEM': {
        const existing = state.items.find(i => i.id_producto === action.payload.id_producto)
        if (existing) {
            return {
            ...state,
            items: state.items.map(i =>
                i.id_producto === action.payload.id_producto
                ? { ...i, cantidad: i.cantidad + action.payload.cantidad }
                : i
            )
            }
        }
        return { ...state, items: [...state.items, action.payload] }
        }
        case 'REMOVE_ITEM':
        return { ...state, items: state.items.filter(i => i.id_producto !== action.payload) }
        case 'UPDATE_QUANTITY': {
        const { id_producto, cantidad } = action.payload
        if (cantidad <= 0) {
            return { ...state, items: state.items.filter(i => i.id_producto !== id_producto) }
        }
        return {
            ...state,
            items: state.items.map(i =>
            i.id_producto === id_producto ? { ...i, cantidad } : i
            )
        }
        }
        case 'CLEAR_CART':
        return { ...state, items: [] }
        default:
        return state
    }
}

export function CartProvider({ children }) {
    const [state, dispatch] = useReducer(cartReducer, null, () => ({
        items: JSON.parse(localStorage.getItem('cart') || '[]')
    }))

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(state.items))
    }, [state.items])

    const totalItems = useMemo(
        () => state.items.reduce((sum, i) => sum + i.cantidad, 0),
        [state.items]
    )

    const totalPrice = useMemo(
        () => state.items.reduce((sum, i) => sum + i.precio_venta * i.cantidad, 0),
        [state.items]
    )

    const addItem = useCallback((producto, cantidad = 1) => {
        dispatch({ type: 'ADD_ITEM', payload: { ...producto, cantidad } })
    }, [])

    const removeItem = useCallback((id_producto) => {
        dispatch({ type: 'REMOVE_ITEM', payload: id_producto })
    }, [])

    const updateQuantity = useCallback((id_producto, cantidad) => {
        dispatch({ type: 'UPDATE_QUANTITY', payload: { id_producto, cantidad } })
    }, [])

    const clearCart = useCallback(() => {
        dispatch({ type: 'CLEAR_CART' })
    }, [])

    return (
        <CartContext.Provider value={{
        items: state.items, totalItems, totalPrice,
        addItem, removeItem, updateQuantity, clearCart
        }}>
        {children}
        </CartContext.Provider>
    )
}

export function useCart() {
    const ctx = useContext(CartContext)
    if (!ctx) throw new Error('useCart debe usarse dentro de CartProvider')
    return ctx
}
