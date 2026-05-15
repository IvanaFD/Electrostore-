import { useState, useEffect, useMemo } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import Navbar from '@/components/Navbar'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'
import api from '@/services/api'
import '@/styles/producto-detail.css'

export default function ProductoDetailPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const cart = useCart()
    const auth = useAuth()

    const [producto, setProducto] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchProducto = async () => {
        try {
            const { data } = await api.get(`/api/productos/${id}`)
            setProducto(data)
        } catch {
            navigate('/tienda')
        } finally {
            setLoading(false)
        }
        }
        fetchProducto()
    }, [id, navigate])

    const cartItem = useMemo(
        () => cart.items.find(i => i.id_producto === producto?.id_producto),
        [cart.items, producto]
    )
    const inCart = !!cartItem
    const qty = cartItem?.cantidad || 0

    const stockClass = useMemo(() => {
        if (!producto) return ''
        if (producto.stock_actual === 0) return 'badge-sin-stock'
        if (producto.stock_actual <= producto.stock_minimo) return 'badge-stock-bajo'
        return 'badge-en-stock'
    }, [producto])

    const stockLabel = useMemo(() => {
        if (!producto) return ''
        if (producto.stock_actual === 0) return 'Sin stock'
        if (producto.stock_actual <= producto.stock_minimo) return 'Stock bajo'
        return 'En stock'
    }, [producto])

    const handleAdd = () => {
        if (!auth.isLoggedIn) return navigate('/login')
        cart.addItem(producto)
    }

    const handleIncrease = () => {
        if (qty >= producto.stock_actual) return
        cart.updateQuantity(producto.id_producto, qty + 1)
    }

    const handleDecrease = () => {
        cart.updateQuantity(producto.id_producto, qty - 1)
    }

    if (loading) {
        return (
        <div>
            <Navbar />
            <div className="detail-loading">
            <div className="container">
                <div className="skeleton-detail" />
            </div>
            </div>
        </div>
        )
    }

    return (
        <div>
        <Navbar />
        <main className="detail-page">
            <div className="container">
            <Link to={`/tienda/categoria/${producto.id_categoria}`} className="back-link">
                ← Volver a {producto.categoria}
            </Link>

            <div className="detail-layout">
                <div className="detail-img-wrap">
                <img
                    src={producto.imagen_url || 'https://placehold.co/500x500?text=Sin+imagen'}
                    alt={producto.nombre}
                    className="detail-img"
                    onError={e => e.target.src = 'https://placehold.co/500x500?text=Sin+imagen'}
                />
                </div>

                <div className="detail-info">
                <div className="detail-badges">
                    <span className="badge-categoria">{producto.categoria}</span>
                    <span className={`badge-stock ${stockClass}`}>{stockLabel}</span>
                </div>

                <p className="detail-marca">{producto.marca}</p>
                <h1 className="detail-nombre">{producto.nombre}</h1>
                <p className="detail-sku">SKU: {producto.sku}</p>
                <p className="detail-precio">Q{parseFloat(producto.precio_venta).toFixed(2)}</p>

                <div className="detail-descripcion">
                    <h3>Descripción</h3>
                    <p>{producto.descripcion}</p>
                </div>

                <div className="detail-stock-info">
                    <div className="stock-item">
                    <span className="stock-label">Proveedor</span>
                    <span className="stock-value">{producto.proveedor}</span>
                    </div>
                    <div className="stock-item">
                    <span className="stock-label">Stock disponible</span>
                    <span className={`stock-value${producto.stock_actual <= producto.stock_minimo ? ' low-stock' : ''}`}>
                        {producto.stock_actual} unidades
                    </span>
                    </div>
                </div>

                <div className="detail-actions">
                    {producto.stock_actual === 0 ? (
                    <div className="out-of-stock-btn">Sin stock disponible</div>
                    ) : !inCart ? (
                    <div className="add-to-cart" onClick={handleAdd}>
                        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                        <line x1="3" y1="6" x2="21" y2="6"/>
                        <path d="M16 10a4 4 0 0 1-8 0"/>
                        </svg>
                        Agregar al carrito
                    </div>
                    ) : (
                    <div className="qty-control-detail">
                        <button onClick={handleDecrease}>−</button>
                        <span>{qty} en carrito</span>
                        <button onClick={handleIncrease} disabled={qty >= producto.stock_actual}>+</button>
                    </div>
                    )}
                </div>
                </div>
            </div>
            </div>
        </main>

        <footer className="footer">
            <div className="container"><p>© 2026 ElectroStore</p></div>
        </footer>
        </div>
    )
}
