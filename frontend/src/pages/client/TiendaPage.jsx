import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import Navbar from '@/components/Navbar'
import ProductCard from '@/components/ProductCard'
import api from '@/services/api'
import '@/styles/tienda.css'

export default function TiendaPage() {
    const [searchParams] = useSearchParams()
    const searchQuery = searchParams.get('q') || ''

    const [productos, setProductos] = useState([])
    const [categorias, setCategorias] = useState([])
    const [selectedCat, setSelectedCat] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
        try {
            const [{ data: prods }, { data: cats }] = await Promise.all([
            api.get('/api/productos'),
            api.get('/api/categorias'),
            ])
            setProductos(prods)
            setCategorias(cats)
        } finally {
            setLoading(false)
        }
        }
        fetchData()
    }, [])

    const productosFiltrados = useMemo(() => {
        let list = productos
        if (selectedCat) list = list.filter(p => p.id_categoria === selectedCat)
        if (searchQuery) {
        const q = searchQuery.toLowerCase()
        list = list.filter(p =>
            p.nombre.toLowerCase().includes(q) ||
            p.marca.toLowerCase().includes(q) ||
            p.sku.toLowerCase().includes(q)
        )
        }
        return list
    }, [productos, selectedCat, searchQuery])

    return (
        <div>
        <Navbar />
        <main className="tienda-page">
            <div className="container">
            <div className="tienda-header">
                <h1>{searchQuery ? `Resultados: "${searchQuery}"` : 'Todos los Productos'}</h1>
                <p>{productosFiltrados.length} productos encontrados</p>
            </div>

            <div className="tienda-layout">
                <aside className="tienda-sidebar">
                <div className="sidebar-section">
                    <h3>Categorías</h3>
                    <div className="cat-list">
                    <button
                        className={`cat-item${!selectedCat ? ' active' : ''}`}
                        onClick={() => setSelectedCat(null)}
                    >
                        Todas
                    </button>
                    {categorias.map(cat => (
                        <button
                        key={cat.id_categoria}
                        className={`cat-item${selectedCat === cat.id_categoria ? ' active' : ''}`}
                        onClick={() => setSelectedCat(cat.id_categoria)}
                        >
                        {cat.nombre}
                        </button>
                    ))}
                    </div>
                </div>
                </aside>

                <div className="productos-area">
                {loading ? (
                    <div className="loading-grid">
                    {Array.from({ length: 12 }).map((_, i) => (
                        <div key={i} className="skeleton-card" />
                    ))}
                    </div>
                ) : productosFiltrados.length === 0 ? (
                    <div className="empty-state">
                    <p>No se encontraron productos</p>
                    </div>
                ) : (
                    <div className="products-grid">
                    {productosFiltrados.map(p => (
                        <ProductCard key={p.id_producto} producto={p} />
                    ))}
                    </div>
                )}
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
