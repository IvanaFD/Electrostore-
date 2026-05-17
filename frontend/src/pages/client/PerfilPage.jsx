import { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '@/components/Navbar'
import { useAuth } from '@/contexts/AuthContext'
import api from '@/services/api'
import '@/styles/perfil.css'

const formatDate = (fecha) =>
    new Date(fecha).toLocaleDateString('es-GT', {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
    })

export default function PerfilPage() {
    const navigate = useNavigate()
    const { user, logout } = useAuth()

    const [cliente, setCliente] = useState(null)
    const [ventas, setVentas] = useState([])
    const [loadingVentas, setLoadingVentas] = useState(true)
    const [filtroInicio, setFiltroInicio] = useState('')
    const [filtroFin, setFiltroFin] = useState('')
    const [filtroActivo, setFiltroActivo] = useState(false)

    useEffect(() => {
        Promise.all([
            api.get('/api/clientes/me'),
            api.get('/api/ventas/mis-compras')
        ]).then(([clienteRes, ventasRes]) => {
            setCliente(clienteRes.data)
            setVentas(ventasRes.data)
        }).catch(err => {
            console.error('Error cargando perfil:', err)
        }).finally(() => {
            setLoadingVentas(false)
        })
    }, [])

    const iniciales = useMemo(() => {
        if (!cliente) return '?'
        return (cliente.nombre[0] + cliente.apellido[0]).toUpperCase()
    }, [cliente])

    const ventasFiltradas = useMemo(() => {
        if (!filtroActivo) return ventas
        return ventas.filter(v => {
            const fecha = new Date(v.fecha_venta)
            const inicio = filtroInicio ? new Date(filtroInicio) : null
            const fin = filtroFin ? new Date(filtroFin + 'T23:59:59') : null
            if (inicio && fecha < inicio) return false
            if (fin && fecha > fin) return false
            return true
        })
    }, [ventas, filtroInicio, filtroFin, filtroActivo])

    const filtrar = useCallback(() => setFiltroActivo(true), [])
    const limpiarFiltro = useCallback(() => {
        setFiltroInicio('')
        setFiltroFin('')
        setFiltroActivo(false)
    }, [])

    const handleLogout = useCallback(() => {
        logout()
        navigate('/')
    }, [logout, navigate])

    return (
        <div>
            <Navbar />
            <main className="perfil-page">
                <div className="container">
                    <div className="perfil-layout">
                        <aside className="perfil-sidebar">
                            <div className="avatar">{iniciales}</div>
                            <h3>{cliente?.nombre} {cliente?.apellido}</h3>
                            <p>{user?.username}</p>
                            <span className="rol-badge">Cliente</span>
                            <button className="btn btn-outline logout-btn" onClick={handleLogout}>
                                Cerrar sesión
                            </button>
                        </aside>

                        <div className="perfil-content">
                            <section className="perfil-section">
                                <h2>Mis Datos</h2>
                                {cliente && (
                                    <div className="datos-grid">
                                        <div className="dato">
                                            <span className="dato-label">Nombre</span>
                                            <span>{cliente.nombre} {cliente.apellido}</span>
                                        </div>
                                        <div className="dato">
                                            <span className="dato-label">Email</span>
                                            <span>{cliente.email}</span>
                                        </div>
                                        <div className="dato">
                                            <span className="dato-label">Teléfono</span>
                                            <span>{cliente.telefono}</span>
                                        </div>
                                        <div className="dato">
                                            <span className="dato-label">Dirección</span>
                                            <span>{cliente.direccion}</span>
                                        </div>
                                    </div>
                                )}
                            </section>

                            <section className="perfil-section">
                                <div className="section-header-row">
                                    <h2>Mis Compras</h2>
                                    <div className="filtros">
                                        <input
                                            type="date"
                                            className="form-control date-input"
                                            value={filtroInicio}
                                            onChange={e => setFiltroInicio(e.target.value)}
                                        />
                                        <span>a</span>
                                        <input
                                            type="date"
                                            className="form-control date-input"
                                            value={filtroFin}
                                            onChange={e => setFiltroFin(e.target.value)}
                                        />
                                        <button className="btn btn-teal" onClick={filtrar}>Filtrar</button>
                                        <button className="btn btn-outline" onClick={limpiarFiltro}>Limpiar</button>
                                    </div>
                                </div>

                                {loadingVentas ? (
                                    <p className="loading-text">Cargando compras...</p>
                                ) : ventasFiltradas.length === 0 ? (
                                    <p className="empty-state">No tienes compras registradas</p>
                                ) : (
                                    <div className="ventas-list">
                                        {ventasFiltradas.map(venta => (
                                            <div key={venta.id_venta} className="venta-card">
                                                <div className="venta-header">
                                                    <div>
                                                        <p className="venta-id">Pedido #{venta.id_venta}</p>
                                                        <p className="venta-fecha">{formatDate(venta.fecha_venta)}</p>
                                                    </div>
                                                    <div className="venta-right">
                                                        <span className={`venta-estado ${venta.estado}`}>{venta.estado}</span>
                                                        <p className="venta-total">Q{parseFloat(venta.total).toFixed(2)}</p>
                                                    </div>
                                                </div>
                                                {venta.detalle && (
                                                    <div className="venta-detalle">
                                                        {venta.detalle.map(d => (
                                                            <div key={d.id_producto} className="detalle-item">
                                                                <span>{d.producto}</span>
                                                                <span>x{d.cantidad} · Q{parseFloat(d.subtotal).toFixed(2)}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>
                        </div>
                    </div>
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
