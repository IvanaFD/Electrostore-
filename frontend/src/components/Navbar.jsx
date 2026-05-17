import { useState, useEffect, useMemo, useCallback } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { User, ShoppingCart } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useCart } from '@/contexts/CartContext'
import { useDebounce } from '@/hooks/useDebounce'
import api from '@/services/api'
import '@/styles/navbar.css'

const MAX_VISIBLE = 5

export default function Navbar() {
    const navigate = useNavigate()
    const auth = useAuth()
    const cart = useCart()

    const [searchQuery, setSearchQuery] = useState('')
    const [categorias, setCategorias] = useState([])
    const [productos, setProductos] = useState([])
    const [showSugerencias, setShowSugerencias] = useState(false)
    const [showMore, setShowMore] = useState(false)

    const debouncedQuery = useDebounce(searchQuery, 250)

    useEffect(() => {
        const fetchData = async () => {
        try {
            const [{ data: cats }, { data: prods }] = await Promise.all([
            api.get('/api/categorias'),
            api.get('/api/productos')
            ])
            setCategorias(cats)
            setProductos(prods)
        } catch {}
        }
        fetchData()
    }, [])

    const categoriasVisibles = useMemo(() => categorias.slice(0, MAX_VISIBLE), [categorias])
    const categoriasOcultas = useMemo(() => categorias.slice(MAX_VISIBLE), [categorias])

    const buscar = useCallback((e) => {
        e.preventDefault()
        if (searchQuery.trim()) {
        navigate(`/tienda?q=${searchQuery}`)
        setSearchQuery('')
        setShowSugerencias(false)
        }
    }, [searchQuery, navigate])

    const sugerencias = useMemo(() => {
        const q = debouncedQuery.toLowerCase().trim()
        if (q.length < 2) return []
        return productos
            .filter(p => p.nombre.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q))
            .slice(0, 6)
    }, [debouncedQuery, productos])

    useEffect(() => {
        setShowSugerencias(sugerencias.length > 0)
    }, [sugerencias])

    const buscarSugerencias = useCallback((e) => {
        setSearchQuery(e.target.value)
    }, [])

    const seleccionarSugerencia = (p) => {
        setShowSugerencias(false)
        setSearchQuery('')
        navigate(`/producto/${p.id_producto}`)
    }

    const handlePerfil = () => {
        if (!auth.isLoggedIn) return navigate('/login')
        if (auth.isCliente) return navigate('/perfil')
        navigate('/admin')
    }

    const handleCarrito = () => {
        if (!auth.isLoggedIn) return navigate('/login')
        navigate('/carrito')
    }

    return (
        <header className="navbar-wrapper" onClick={() => setShowMore(false)}>
            <nav className="navbar">
                <div className="container navbar-inner">
                <NavLink to="/" className="logo">
                    <div className="logo-icon">
                    <img src="/logo.png" alt="Logo" />
                    </div>
                    <span className="logo-text">ElectroStore</span>
                </NavLink>

                <form className="search-bar" onSubmit={buscar} style={{ position: 'relative' }}>
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                    </svg>
                    <input
                    type="text"
                    placeholder="¿Qué componente buscas?"
                    value={searchQuery}
                    onChange={buscarSugerencias}
                    onBlur={() => setTimeout(() => setShowSugerencias(false), 200)}
                    />
                    {showSugerencias && (
                    <div className="search-dropdown">
                        {sugerencias.map(p => (
                        <div key={p.id_producto} className="search-item" onMouseDown={() => seleccionarSugerencia(p)}>
                            <img
                            src={p.imagen_url || 'https://placehold.co/40x40'}
                            alt={p.nombre}
                            className="search-img"
                            onError={e => e.target.src = 'https://placehold.co/40x40'}
                            />
                            <div className="search-info">
                            <p className="search-name">{p.nombre}</p>
                            <p className="search-sku">{p.sku}</p>
                            </div>
                            <p className="search-price">Q{parseFloat(p.precio_venta).toFixed(2)}</p>
                        </div>
                        ))}
                    </div>
                    )}
                </form>

                <div className="nav-actions">
                    <div className="nav-action" onClick={handlePerfil}>
                    <User size={22} strokeWidth={1.8} />
                    <span className="nav-action-label">
                        {auth.isLoggedIn ? auth.user.username : 'Cuenta'}
                    </span>
                    </div>

                    <div className="nav-action cart-action" onClick={handleCarrito}>
                    <div className="cart-icon-wrap">
                        <ShoppingCart size={22} strokeWidth={1.8} />
                        {cart.totalItems > 0 && (
                        <span className="badge cart-badge">{cart.totalItems}</span>
                        )}
                    </div>
                    <span className="nav-action-label">Carrito</span>
                    </div>
                </div>
                </div>
            </nav>

            <div className="categories-bar">
                <div className="container categories-inner">
                {categoriasVisibles.map(cat => (
                    <NavLink
                    key={cat.id_categoria}
                    to={`/tienda/categoria/${cat.id_categoria}`}
                    className={({ isActive }) => `cat-link${isActive ? ' active' : ''}`}
                    >
                    {cat.nombre}
                    </NavLink>
                ))}

                {categoriasOcultas.length > 0 && (
                    <div className="cat-more-wrap" onClick={e => e.stopPropagation()}>
                    <div className="cat-more" onClick={e => { e.stopPropagation(); setShowMore(p => !p) }}>
                        Más
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="m6 9 6 6 6-6"/>
                        </svg>
                    </div>
                    {showMore && (
                        <div className="cat-dropdown">
                        {categoriasOcultas.map(cat => (
                            <NavLink
                            key={cat.id_categoria}
                            to={`/tienda/categoria/${cat.id_categoria}`}
                            className="cat-dropdown-item"
                            onClick={() => setShowMore(false)}
                            >
                            {cat.nombre}
                            </NavLink>
                        ))}
                        </div>
                    )}
                    </div>
                )}
                </div>
            </div>
        </header>
    )
}
