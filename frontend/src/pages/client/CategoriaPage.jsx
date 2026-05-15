import { useState, useEffect, useCallback } from 'react'
import { Link, useParams } from 'react-router-dom'
import Navbar from '@/components/Navbar'
import ProductCard from '@/components/ProductCard'
import api from '@/services/api'
import '@/styles/tienda.css'

export default function CategoriaPage() {
    const { id } = useParams()

    const [productos, setProductos] = useState([])
    const [categoriaNombre, setCategoriaNombre] = useState('')
    const [loading, setLoading] = useState(true)

    const cargar = useCallback(async () => {
        setLoading(true)
        try {
        const [{ data: prods }, { data: cat }] = await Promise.all([
            api.get('/api/productos'),
            api.get(`/api/categorias/${id}`)
        ])
        setProductos(prods.filter(p => p.id_categoria === parseInt(id)))
        setCategoriaNombre(cat.nombre)
        } finally {
        setLoading(false)
        }
    }, [id])

    useEffect(() => {
        cargar()
    }, [cargar])

    return (
        <div>
        <Navbar />
        <main className="tienda-page">
            <div className="container">
            <div className="tienda-header">
                <Link to="/tienda" className="back-link">← Todos los productos</Link>
                <h1>{categoriaNombre}</h1>
                <p>{productos.length} productos</p>
            </div>

            {loading ? (
                <div className="loading-grid">
                {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="skeleton-card" />
                ))}
                </div>
            ) : productos.length === 0 ? (
                <div className="empty-state">No hay productos en esta categoría</div>
            ) : (
                <div className="products-grid">
                {productos.map(p => (
                    <ProductCard key={p.id_producto} producto={p} />
                ))}
                </div>
            )}
            </div>
        </main>

        <footer className="footer">
            <div className="container"><p>© 2026 ElectroStore</p></div>
        </footer>
        </div>
    )
}
