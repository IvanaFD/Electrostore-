import { useState, useEffect } from 'react'
import { Package, ShoppingCart, Users, AlertTriangle, Download } from 'lucide-react'
import api from '@/services/api'
import '@/styles/dashboard.css'

const exportarCSV = async (tipo) => {
    try {
        const token = localStorage.getItem('token')
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/reportes/exportar-csv?tipo=${tipo}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `${tipo}.csv`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
    } catch (err) {
        console.error('Error al exportar:', err)
    }
}

export default function DashboardPage() {
    const [stats, setStats] = useState({ productos: 0, ventas: 0, clientes: 0 })
    const [masVendidos, setMasVendidos] = useState([])
    const [stockBajo, setStockBajo] = useState([])
    const [ventasPorCategoria, setVentasPorCategoria] = useState([])
    const [clientesConCompras, setClientesConCompras] = useState([])
    const [productosSinVentas, setProductosSinVentas] = useState([])
    const [ventasPorEmpleado, setVentasPorEmpleado] = useState([])

    useEffect(() => {
        Promise.all([
            api.get('/api/productos'),
            api.get('/api/ventas'),
            api.get('/api/clientes'),
            api.get('/api/reportes/productos-mas-vendidos'),
            api.get('/api/reportes/stock-bajo'),
            api.get('/api/reportes/ventas-por-categoria'),
            api.get('/api/reportes/clientes-con-compras'),
            api.get('/api/reportes/productos-sin-ventas'),
            api.get('/api/reportes/ventas-por-empleado'),
        ]).then(([prods, ventas, clientes, vendidos, bajo, porCat, conCompras, sinVentas, porEmpleado]) => {
            setStats({
                productos: prods.data.length,
                ventas: ventas.data.length,
                clientes: clientes.data.length
            })
            setMasVendidos(vendidos.data)
            setStockBajo(bajo.data)
            setVentasPorCategoria(porCat.data)
            setClientesConCompras(conCompras.data)
            setProductosSinVentas(sinVentas.data)
            setVentasPorEmpleado(porEmpleado.data)
        }).catch(console.error)
    }, [])

    return (
        <div className="dashboard">
            <div className="page-header">
                <h1>Dashboard</h1>
                <p>Resumen general de ElectroStore</p>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon teal"><Package size={22} /></div>
                    <div>
                        <p className="stat-label">Productos</p>
                        <p className="stat-value">{stats.productos}</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon green"><ShoppingCart size={22} /></div>
                    <div>
                        <p className="stat-label">Ventas totales</p>
                        <p className="stat-value">{stats.ventas}</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon dark"><Users size={22} /></div>
                    <div>
                        <p className="stat-label">Clientes</p>
                        <p className="stat-value">{stats.clientes}</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon red"><AlertTriangle size={22} /></div>
                    <div>
                        <p className="stat-label">Stock bajo</p>
                        <p className="stat-value">{stockBajo.length}</p>
                    </div>
                </div>
            </div>

            <div className="dashboard-grid">
                <div className="card">
                    <div className="card-header-row">
                        <h2>Productos Más Vendidos</h2>
                        <button className="btn-export" onClick={() => exportarCSV('productos-mas-vendidos')}>
                            <Download size={13} /> CSV
                        </button>
                    </div>
                    <table className="data-table">
                        <thead><tr><th>Producto</th><th>Categoría</th><th>Vendidos</th><th>Ingresos</th></tr></thead>
                        <tbody>
                            {masVendidos.slice(0, 5).map(p => (
                                <tr key={p.id_producto}>
                                    <td>{p.nombre}</td>
                                    <td>{p.categoria}</td>
                                    <td>{p.total_vendido}</td>
                                    <td>Q{parseFloat(p.total_ingresos).toFixed(2)}</td>
                                </tr>
                            ))}
                            {masVendidos.length === 0 && <tr><td colSpan={4} className="empty-msg">Sin datos</td></tr>}
                        </tbody>
                    </table>
                </div>

                <div className="card">
                    <div className="card-header-row">
                        <h2>Stock Bajo</h2>
                        <button className="btn-export" onClick={() => exportarCSV('stock-bajo')}>
                            <Download size={13} /> CSV
                        </button>
                    </div>
                    <table className="data-table">
                        <thead><tr><th>SKU</th><th>Producto</th><th>Stock</th><th>Mínimo</th></tr></thead>
                        <tbody>
                            {stockBajo.slice(0, 5).map(p => (
                                <tr key={p.id_producto}>
                                    <td>{p.sku}</td>
                                    <td>{p.nombre}</td>
                                    <td className="text-red">{p.stock_actual}</td>
                                    <td>{p.stock_minimo}</td>
                                </tr>
                            ))}
                            {stockBajo.length === 0 && <tr><td colSpan={4} className="empty-msg">Sin datos</td></tr>}
                        </tbody>
                    </table>
                </div>

                <div className="card">
                    <div className="card-header-row">
                        <h2>Ventas por Categoría</h2>
                        <button className="btn-export" onClick={() => exportarCSV('ventas-por-categoria')}>
                            <Download size={13} /> CSV
                        </button>
                    </div>
                    <table className="data-table">
                        <thead><tr><th>Categoría</th><th>Ventas</th><th>Unidades</th><th>Ingresos</th></tr></thead>
                        <tbody>
                            {ventasPorCategoria.map(v => (
                                <tr key={v.categoria}>
                                    <td>{v.categoria}</td>
                                    <td>{v.total_ventas}</td>
                                    <td>{v.unidades_vendidas}</td>
                                    <td>Q{parseFloat(v.total_ingresos).toFixed(2)}</td>
                                </tr>
                            ))}
                            {ventasPorCategoria.length === 0 && <tr><td colSpan={4} className="empty-msg">Sin datos</td></tr>}
                        </tbody>
                    </table>
                </div>

                <div className="card">
                    <div className="card-header-row">
                        <h2>Mejores Clientes</h2>
                        <button className="btn-export" onClick={() => exportarCSV('clientes-con-compras')}>
                            <Download size={13} /> CSV
                        </button>
                    </div>
                    <table className="data-table">
                        <thead><tr><th>Cliente</th><th>Compras</th><th>Total gastado</th></tr></thead>
                        <tbody>
                            {clientesConCompras.slice(0, 5).map(c => (
                                <tr key={c.id_cliente}>
                                    <td>{c.nombre} {c.apellido}</td>
                                    <td>{c.total_compras}</td>
                                    <td>Q{parseFloat(c.total_gastado).toFixed(2)}</td>
                                </tr>
                            ))}
                            {clientesConCompras.length === 0 && <tr><td colSpan={3} className="empty-msg">Sin datos</td></tr>}
                        </tbody>
                    </table>
                </div>

                <div className="card">
                    <div className="card-header-row">
                        <h2>Productos Sin Ventas</h2>
                        <button className="btn-export" onClick={() => exportarCSV('productos-sin-ventas')}>
                            <Download size={13} /> CSV
                        </button>
                    </div>
                    <table className="data-table">
                        <thead><tr><th>SKU</th><th>Producto</th><th>Categoría</th><th>Stock</th></tr></thead>
                        <tbody>
                            {productosSinVentas.slice(0, 5).map(p => (
                                <tr key={p.sku}>
                                    <td>{p.sku}</td>
                                    <td>{p.nombre}</td>
                                    <td>{p.categoria}</td>
                                    <td>{p.stock_actual}</td>
                                </tr>
                            ))}
                            {productosSinVentas.length === 0 && <tr><td colSpan={4} className="empty-msg">Sin datos</td></tr>}
                        </tbody>
                    </table>
                </div>

                <div className="card">
                    <div className="card-header-row">
                        <h2>Ventas por Empleado</h2>
                        <button className="btn-export" onClick={() => exportarCSV('ventas-por-empleado')}>
                            <Download size={13} /> CSV
                        </button>
                    </div>
                    <table className="data-table">
                        <thead><tr><th>Empleado</th><th>Cargo</th><th>Ventas</th><th>Ingresos</th></tr></thead>
                        <tbody>
                            {ventasPorEmpleado.map(e => (
                                <tr key={e.id_empleado}>
                                    <td>{e.empleado}</td>
                                    <td>{e.cargo}</td>
                                    <td>{e.total_ventas}</td>
                                    <td>Q{parseFloat(e.total_ingresos).toFixed(2)}</td>
                                </tr>
                            ))}
                            {ventasPorEmpleado.length === 0 && <tr><td colSpan={4} className="empty-msg">Sin datos</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
