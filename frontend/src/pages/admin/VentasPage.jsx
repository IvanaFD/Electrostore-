import { useState, useEffect, useMemo, useCallback } from 'react'
import { Eye, X } from 'lucide-react'
import api from '@/services/api'

const formatDate = (f) => new Date(f).toLocaleDateString('es-GT', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
})

const NUEVA_VENTA = { id_cliente: '', id_empleado: '', items: [{ id_producto: '', cantidad: 1 }] }

export default function VentasPage() {
    const [ventas, setVentas] = useState([])
    const [clientes, setClientes] = useState([])
    const [empleados, setEmpleados] = useState([])
    const [productos, setProductos] = useState([])
    const [detalleVenta, setDetalleVenta] = useState([])
    const [ventaSeleccionada, setVentaSeleccionada] = useState(null)
    const [showDetalle, setShowDetalle] = useState(false)
    const [showNueva, setShowNueva] = useState(false)
    const [nueva, setNueva] = useState(NUEVA_VENTA)
    const [loadingNueva, setLoadingNueva] = useState(false)
    const [errorNueva, setErrorNueva] = useState('')
    const [filtroInicio, setFiltroInicio] = useState('')
    const [filtroFin, setFiltroFin] = useState('')
    const [filtroEstado, setFiltroEstado] = useState('')
    const [confirm, setConfirm] = useState({ show: false, titulo: '', mensaje: '', accion: null })

    const cargar = useCallback(async () => {
        const [v, c, e, p] = await Promise.all([
            api.get('/api/ventas'),
            api.get('/api/clientes'),
            api.get('/api/empleados'),
            api.get('/api/productos'),
        ])
        setVentas(v.data)
        setClientes(c.data)
        setEmpleados(e.data)
        setProductos(p.data)
    }, [])

    useEffect(() => { cargar() }, [cargar])

    const ventasFiltradas = useMemo(() => {
        let list = ventas
        if (filtroEstado) list = list.filter(v => v.estado === filtroEstado)
        if (filtroInicio) list = list.filter(v => new Date(v.fecha_venta) >= new Date(filtroInicio))
        if (filtroFin) list = list.filter(v => new Date(v.fecha_venta) <= new Date(filtroFin + 'T23:59:59'))
        return list
    }, [ventas, filtroEstado, filtroInicio, filtroFin])

    const verDetalle = async (v) => {
        setVentaSeleccionada(v)
        const { data } = await api.get(`/api/ventas/${v.id_venta}`)
        setDetalleVenta(data.detalle)
        setShowDetalle(true)
    }

    const cancelar = useCallback((v) => {
        setConfirm({
            show: true,
            titulo: 'Cancelar venta',
            mensaje: `¿Cancelar venta #${v.id_venta}? El stock será devuelto automáticamente.`,
            accion: async () => {
                try {
                    await api.patch(`/api/ventas/${v.id_venta}/cancelar`)
                    await cargar()
                } catch (err) {
                    setConfirm({ show: true, titulo: 'Error', mensaje: err.response?.data?.error || 'Error al cancelar', accion: null })
                }
            }
        })
    }, [cargar])

    const setItem = (idx, campo, valor) => {
        setNueva(prev => ({
            ...prev,
            items: prev.items.map((item, i) => i === idx ? { ...item, [campo]: valor } : item)
        }))
    }

    const crearVenta = async () => {
        if (!nueva.id_cliente) { setErrorNueva('Selecciona un cliente'); return }
        const items = nueva.items.filter(i => i.id_producto && i.cantidad > 0)
        if (!items.length) { setErrorNueva('Agrega al menos un producto'); return }
        setLoadingNueva(true)
        setErrorNueva('')
        try {
            await api.post('/api/ventas', { id_cliente: nueva.id_cliente, id_empleado: nueva.id_empleado || null, items })
            setShowNueva(false)
            await cargar()
        } catch (err) {
            setErrorNueva(err.response?.data?.error || 'Error al crear venta')
        } finally {
            setLoadingNueva(false)
        }
    }

    return (
        <div className="page">
            {confirm.show && (
                <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setConfirm(c => ({ ...c, show: false })) }}>
                    <div className="modal modal-sm">
                        <div className="modal-header"><h3>{confirm.titulo}</h3></div>
                        <div className="modal-body">
                            <p>{confirm.mensaje}</p>
                            <div className="modal-footer">
                                <button className="btn btn-outline" onClick={() => setConfirm(c => ({ ...c, show: false }))}>Cancelar</button>
                                {confirm.accion && (
                                    <button className="btn btn-danger" onClick={async () => { setConfirm(c => ({ ...c, show: false })); await confirm.accion() }}>Confirmar</button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="page-header">
                <div><h1>Ventas</h1><p>{ventasFiltradas.length} ventas</p></div>
                <button className="btn btn-primary" onClick={() => { setErrorNueva(''); setNueva(NUEVA_VENTA); setShowNueva(true) }}>+ Nueva Venta</button>
            </div>

            <div className="filtros-bar">
                <input type="date" className="form-control" value={filtroInicio} onChange={e => setFiltroInicio(e.target.value)} />
                <span>a</span>
                <input type="date" className="form-control" value={filtroFin} onChange={e => setFiltroFin(e.target.value)} />
                <select className="form-control" value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}>
                    <option value="">Todos los estados</option>
                    <option value="completada">Completada</option>
                    <option value="cancelada">Cancelada</option>
                </select>
                <button className="btn btn-outline" onClick={() => { setFiltroInicio(''); setFiltroFin(''); setFiltroEstado('') }}>Limpiar</button>
            </div>

            <div className="card">
                <table className="data-table">
                    <thead><tr><th>#</th><th>Fecha</th><th>Cliente</th><th>Empleado</th><th>Total</th><th>Estado</th><th>Acciones</th></tr></thead>
                    <tbody>
                        {ventasFiltradas.map(v => (
                            <tr key={v.id_venta}>
                                <td>{v.id_venta}</td>
                                <td>{formatDate(v.fecha_venta)}</td>
                                <td>{v.cliente}</td>
                                <td>{v.empleado || '—'}</td>
                                <td>Q{parseFloat(v.total).toFixed(2)}</td>
                                <td><span className={`estado-badge ${v.estado}`}>{v.estado}</span></td>
                                <td>
                                    <div className="acciones">
                                        <button className="btn-icon" title="Ver detalle" onClick={() => verDetalle(v)}><Eye size={15} /></button>
                                        {v.estado === 'completada' && (
                                            <button className="btn-icon danger" title="Cancelar" onClick={() => cancelar(v)}><X size={15} /></button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showDetalle && (
                <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowDetalle(false) }}>
                    <div className="modal">
                        <div className="modal-header">
                            <h3>Detalle Venta #{ventaSeleccionada?.id_venta}</h3>
                            <button onClick={() => setShowDetalle(false)}>✕</button>
                        </div>
                        <div className="modal-body">
                            <div className="detalle-info">
                                <p><strong>Cliente:</strong> {ventaSeleccionada?.cliente}</p>
                                <p><strong>Empleado:</strong> {ventaSeleccionada?.empleado || 'Sin empleado'}</p>
                                <p><strong>Fecha:</strong> {ventaSeleccionada ? formatDate(ventaSeleccionada.fecha_venta) : ''}</p>
                                <p><strong>Estado:</strong> <span className={`estado-badge ${ventaSeleccionada?.estado}`}>{ventaSeleccionada?.estado}</span></p>
                            </div>
                            <table className="data-table">
                                <thead><tr><th>Producto</th><th>SKU</th><th>Cantidad</th><th>Precio Unit.</th><th>Subtotal</th></tr></thead>
                                <tbody>
                                    {detalleVenta.map(d => (
                                        <tr key={d.id_producto}>
                                            <td>{d.producto}</td><td>{d.sku}</td><td>{d.cantidad}</td>
                                            <td>Q{parseFloat(d.precio_unitario).toFixed(2)}</td>
                                            <td>Q{parseFloat(d.subtotal).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div className="total-row"><strong>Total: Q{parseFloat(ventaSeleccionada?.total || 0).toFixed(2)}</strong></div>
                        </div>
                    </div>
                </div>
            )}

            {showNueva && (
                <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowNueva(false) }}>
                    <div className="modal">
                        <div className="modal-header"><h3>Nueva Venta</h3><button onClick={() => setShowNueva(false)}>✕</button></div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Cliente</label>
                                <select className="form-control" value={nueva.id_cliente} onChange={e => setNueva(p => ({ ...p, id_cliente: e.target.value }))}>
                                    <option value="">Seleccionar cliente...</option>
                                    {clientes.map(c => <option key={c.id_cliente} value={c.id_cliente}>{c.nombre} {c.apellido}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Empleado (opcional)</label>
                                <select className="form-control" value={nueva.id_empleado} onChange={e => setNueva(p => ({ ...p, id_empleado: e.target.value }))}>
                                    <option value="">Sin empleado</option>
                                    {empleados.map(e => <option key={e.id_empleado} value={e.id_empleado}>{e.nombre} {e.apellido}</option>)}
                                </select>
                            </div>
                            <div className="items-section">
                                <div className="items-header">
                                    <label>Productos</label>
                                    <button className="btn btn-outline" onClick={() => setNueva(p => ({ ...p, items: [...p.items, { id_producto: '', cantidad: 1 }] }))}>+ Agregar</button>
                                </div>
                                {nueva.items.map((item, i) => (
                                    <div key={i} className="item-row">
                                        <select className="form-control" value={item.id_producto} onChange={e => setItem(i, 'id_producto', e.target.value)}>
                                            <option value="">Seleccionar producto...</option>
                                            {productos.map(p => <option key={p.id_producto} value={p.id_producto}>{p.nombre} (Stock: {p.stock_actual})</option>)}
                                        </select>
                                        <input type="number" min="1" className="form-control qty-input" placeholder="Cant." value={item.cantidad} onChange={e => setItem(i, 'cantidad', e.target.value)} />
                                        <button className="btn-icon danger" onClick={() => setNueva(p => ({ ...p, items: p.items.filter((_, idx) => idx !== i) }))}>✕</button>
                                    </div>
                                ))}
                            </div>
                            {errorNueva && <p className="error-msg">{errorNueva}</p>}
                            <div className="modal-footer">
                                <button className="btn btn-outline" onClick={() => setShowNueva(false)}>Cancelar</button>
                                <button className="btn btn-primary" onClick={crearVenta} disabled={loadingNueva}>{loadingNueva ? 'Procesando...' : 'Crear Venta'}</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
