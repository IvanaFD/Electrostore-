import { useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart } from 'lucide-react'
import Navbar from '@/components/Navbar'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'
import api from '@/services/api'
import '@/styles/carrito.css'

export default function CarritoPage() {
    const navigate = useNavigate()
    const { items, totalItems, totalPrice, removeItem, updateQuantity, clearCart } = useCart()
    const { isLoggedIn } = useAuth()

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    const confirmarCompra = useCallback(async () => {
        if (!isLoggedIn) return navigate('/login')
        setError('')
        setLoading(true)
        try {
            const itemsPayload = items.map(i => ({
                id_producto: i.id_producto,
                cantidad: i.cantidad
            }))
            await api.post('/api/ventas', { items: itemsPayload })
            setSuccess('¡Compra realizada exitosamente!')
            clearCart()
            setTimeout(() => navigate('/'), 2000)
        } catch (err) {
            setError(err.response?.data?.error || 'Error al procesar la compra')
        } finally {
            setLoading(false)
        }
    }, [items, isLoggedIn, navigate, clearCart])

    return (
        <div>
            <Navbar />
            <main className="carrito-page">
                <div className="container">
                    <h1>Tu Carrito</h1>

                    {items.length === 0 ? (
                        <div className="empty-cart">
                            <ShoppingCart size={64} strokeWidth={1} color="var(--teal)" />
                            <h3>Tu carrito está vacío</h3>
                            <p>Agrega productos desde la tienda para comenzar</p>
                            <Link to="/tienda" className="btn btn-primary">Ir a la tienda</Link>
                        </div>
                    ) : (
                        <div className="carrito-layout">
                            <div className="carrito-items">
                                {items.map(item => (
                                    <div key={item.id_producto} className="cart-item">
                                        <img
                                            src={item.imagen_url || 'https://placehold.co/80x80?text=?'}
                                            alt={item.nombre}
                                            className="item-img"
                                            onError={e => e.target.src = 'https://placehold.co/80x80?text=?'}
                                        />
                                        <div className="item-info">
                                            <p className="item-marca">{item.marca}</p>
                                            <h4 className="item-name">{item.nombre}</h4>
                                            <p className="item-price">Q{parseFloat(item.precio_venta).toFixed(2)}</p>
                                        </div>
                                        <div className="item-qty">
                                            <button onClick={() => updateQuantity(item.id_producto, item.cantidad - 1)}>−</button>
                                            <span>{item.cantidad}</span>
                                            <button onClick={() => updateQuantity(item.id_producto, item.cantidad + 1)}>+</button>
                                        </div>
                                        <div className="item-subtotal">
                                            Q{(item.precio_venta * item.cantidad).toFixed(2)}
                                        </div>
                                        <button className="item-remove" onClick={() => removeItem(item.id_producto)}>✕</button>
                                    </div>
                                ))}
                            </div>

                            <div className="carrito-summary">
                                <h3>Resumen del pedido</h3>
                                <div className="summary-row">
                                    <span>Subtotal ({totalItems} items)</span>
                                    <span>Q{totalPrice.toFixed(2)}</span>
                                </div>
                                <div className="summary-divider" />
                                <div className="summary-total">
                                    <span>Total</span>
                                    <span>Q{totalPrice.toFixed(2)}</span>
                                </div>

                                {error && <p className="error-msg">{error}</p>}
                                {success && <p className="success-msg">{success}</p>}

                                <button
                                    className="btn btn-primary checkout-btn"
                                    onClick={confirmarCompra}
                                    disabled={loading}
                                >
                                    {loading ? 'Procesando...' : 'Confirmar Compra'}
                                </button>

                                <Link to="/tienda" className="btn btn-outline continue-btn">
                                    Seguir comprando
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            <footer className="footer">
                <div className="container">
                    <p>© 2026 ElectroStore</p>
                </div>
            </footer>
        </div>
    )
}
