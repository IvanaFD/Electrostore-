import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
    Cpu, Radio, MemoryStick, Omega, Equal, Lightbulb,
    Wrench, Cable, BatteryFull, ToggleLeft, SlidersHorizontal,
    Cog, CircuitBoard
} from 'lucide-react'
import Navbar from '@/components/Navbar'
import ProductCard from '@/components/ProductCard'
import { useAuth } from '@/contexts/AuthContext'
import api from '@/services/api'
import '@/styles/home.css'

const BANNERS = [
    'https://res.cloudinary.com/dajf4aqhf/image/upload/v1777849435/banner1_ai1f3k.jpg',
    'https://res.cloudinary.com/dajf4aqhf/image/upload/v1777849404/banner3_ypwpr4.jpg',
    'https://res.cloudinary.com/dajf4aqhf/image/upload/v1777849694/banner4_rew9cc.jpg',
]

const CAT_ICONS = {
    'Boards de Desarrollo': Cpu,
    'Sensores': Radio,
    'Modulos': MemoryStick,
    'Resistencias': Omega,
    'Capacitores': Equal,
    'LED': Lightbulb,
    'Herramienta': Wrench,
    'Cable y Alambre': Cable,
    'Fuentes de Poder y Baterias': BatteryFull,
    'Reles, Pulsadores y Switches': ToggleLeft,
    'Potenciometros': SlidersHorizontal,
    'Motores y Servos': Cog,
    'Circuitos Integrados': CircuitBoard,
    }

    export default function HomePage() {
    const auth = useAuth()
    const [current, setCurrent] = useState(0)
    const [masVendidos, setMasVendidos] = useState([])
    const [categorias, setCategorias] = useState([])
    const [loading, setLoading] = useState(true)

    const next = useCallback(() => {
        setCurrent(c => (c + 1) % BANNERS.length)
    }, [])

    const prev = useCallback(() => {
        setCurrent(c => (c - 1 + BANNERS.length) % BANNERS.length)
    }, [])

    useEffect(() => {
        const fetchData = async () => {
        try {
            const [{ data: prods }, { data: cats }] = await Promise.all([
            api.get('/api/productos'),
            api.get('/api/categorias'),
            ])
            setMasVendidos(prods.slice(0, 8))
            setCategorias(cats)
        } catch { /* network error, ignore */ }
        setLoading(false)
        }
        fetchData()
    }, [])

    useEffect(() => {
        const timer = setInterval(next, 4000)
        return () => clearInterval(timer)
    }, [next])

    return (
        <div>
        <Navbar />
        <main>

            <section className="carousel-section">
            <div className="carousel">
                <div
                className="carousel-track"
                style={{ transform: `translateX(-${current * 100}%)` }}
                >
                {BANNERS.map((img, i) => (
                    <div key={i} className="carousel-slide">
                    <img src={img} alt={`Banner ${i + 1}`} />
                    </div>
                ))}
                </div>
                <button className="carousel-btn prev" onClick={prev}>&#8249;</button>
                <button className="carousel-btn next" onClick={next}>&#8250;</button>
                <div className="carousel-dots">
                {BANNERS.map((_, i) => (
                    <span
                    key={i}
                    className={`dot${i === current ? ' active' : ''}`}
                    onClick={() => setCurrent(i)}
                    />
                ))}
                </div>
            </div>
            </section>

            <section className="section">
            <div className="container">
                <div className="section-header">
                <h2>Más Vendidos</h2>
                <Link to="/tienda" className="btn btn-outline">Ver todos</Link>
                </div>
                {loading ? (
                <div className="loading-grid">
                    {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="skeleton-card" />
                    ))}
                </div>
                ) : (
                <div className="products-grid">
                    {masVendidos.map(p => (
                    <ProductCard key={p.id_producto} producto={p} />
                    ))}
                </div>
                )}
            </div>
            </section>

            <section className="section section-gray">
            <div className="container">
                <div className="section-header">
                <h2>Explora por Categoría</h2>
                </div>
                <div className="categories-grid">
                {categorias.map(cat => {
                    const Icon = CAT_ICONS[cat.nombre] || Cpu
                    return (
                    <Link
                        key={cat.id_categoria}
                        to={`/tienda/categoria/${cat.id_categoria}`}
                        className="category-card"
                    >
                        <div className="category-icon"><Icon size={28} /></div>
                        <span>{cat.nombre}</span>
                    </Link>
                    )
                })}
                </div>
            </div>
            </section>

            <section className="cta-section">
            <div className="container">
                <div className="cta-box">
                <div className="cta-content">
                    <h2>¿Listo para tu próximo proyecto?</h2>
                    <p>Encuentra todos los componentes que necesitas para hacer realidad tus ideas.</p>
                    <div className="cta-actions">
                    {!auth.isLoggedIn ? (
                        <>
                        <Link to="/registro" className="btn btn-teal">Crear cuenta gratis</Link>
                        <Link to="/login" className="btn-outline-white">Iniciar sesión</Link>
                        </>
                    ) : (
                        <Link to="/tienda" className="btn btn-teal">Ir a la tienda</Link>
                    )}
                    </div>
                </div>
                <div className="cta-decoration">⚡</div>
                </div>
            </div>
            </section>

        </main>
        <footer className="footer">
            <div className="container">
            <p>© 2026 ElectroStore</p>
            </div>
        </footer>
        </div>
    )
}
