import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'
import '@/styles/productCard.css'

export default function ProductCard({ producto }) {
    const navigate = useNavigate()
    const cart = useCart()
    const auth = useAuth()

    const cartItem = useMemo(
        () => cart.items.find(i => i.id_producto === producto.id_producto),
        [cart.items, producto.id_producto]
    )

    const inCart = !!cartItem
    const qty = cartItem?.cantidad || 0

    const handleAdd = (e) => {
        e.stopPropagation()
        if (!auth.isLoggedIn) return navigate('/login')
        cart.addItem(producto)
    }

    const handleIncrease = (e) => {
        e.stopPropagation()
        if (qty >= producto.stock_actual) return
        cart.updateQuantity(producto.id_producto, qty + 1)
    }

    const handleDecrease = (e) => {
        e.stopPropagation()
        cart.updateQuantity(producto.id_producto, qty - 1)
    }

    return (
        <div className="product-card" onClick={() => navigate(`/producto/${producto.id_producto}`)}>
        <div className="product-img-wrap">
            <img
            src={producto.imagen_url || 'https://placehold.co/300x300?text=Sin+imagen'}
            alt={producto.nombre}
            className="product-img"
            onError={e => e.target.src = 'https://placehold.co/300x300?text=Sin+imagen'}
            />
        </div>

        <div className="product-body">
            <p className="product-marca">{producto.marca}</p>
            <h3 className="product-name">{producto.nombre}</h3>
            <p className="product-price">Q{parseFloat(producto.precio_venta).toFixed(2)}</p>

            <div className="product-actions">
            {producto.stock_actual === 0 ? (
                <div className="out-of-stock">Sin stock</div>
            ) : !inCart ? (
                <div className="add-btn" onClick={handleAdd}>
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M12 5v14M5 12h14"/>
                </svg>
                Agregar
                </div>
            ) : (
                <div className="qty-control" onClick={e => e.stopPropagation()}>
                <button onClick={handleDecrease}>−</button>
                <span>{qty}</span>
                <button onClick={handleIncrease} disabled={qty >= producto.stock_actual}>+</button>
                </div>
            )}
            </div>
        </div>
        </div>
    )
}
