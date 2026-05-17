import { useState, useEffect, useMemo, useCallback } from 'react'
import { Eye, Check, X } from 'lucide-react'
import api from '@/services/api'

const formatDate = (f) => new Date(f).toLocaleDateString('es-GT', { day: '2-digit', month: '2-digit', year: 'numeric' })
const NUEVA_ORDEN = { id_proveedor: '', id_empleado: '', items: [{ id_producto: '', cantidad: 1, precio_compra: '' }] }

export default function OrdenesPage() {
    const [ordenes, setOrdenes] = useState([])
    const [proveedores, setProveedores] = useState([])
    const [empleados, setEmpleados] = useState([])
    const [productos, setProductos] = useState([])
    const [detalleOrden, setDetalleOrden] = useState([])
    const [ordenSeleccionada, setOrdenSeleccionada] = useState(null)
    const [showDetalle, setShowDetalle] = useState(false)
    const [showNueva, setShowNueva] = useState(false)
    const [nueva, setNueva] = useState(NUEVA_ORDEN)
    const [loadingNueva, setLoadingNueva] = useState(false)
    const [errorNueva, setErrorNueva] = useState('')
    const [filtroInicio, setFiltroInicio] = useState('')
    const [filtroFin, setFiltroFin] = useState('')
    const [filtroEstado, setFiltroEstado] = useState('')
    const [confirm, setConfirm] = useState({ show: false, titulo: '', mensaje: '', accion: null })

    const cargar = useCallback(async () => {
        const [o, p, e, prods] = await Promise.all([
            api.get('/api/ordenes'),
            api.get('/api/proveedores'),
            api.get('/api/empleados'),
            api.get('/api/productos'),
        ])
        setOrdenes(o.data)
        setProveedores(p.data)
        setEmpleados(e.data)
        setProductos(prods.data)
    }, [])

    useEffect(() => { cargar() }, [cargar])

    const ordenesFiltradas = useMemo(() => {
        let list = ordenes
        if (filtroEstado) list = list.filter(o => o.estado === filtroEstado)
        if (filtroInicio) list = list.filter(o => new Date(o.fecha_orden) >= new Date(filtroInicio))
        if (filtroFin) list = list.filter(o => new Date(o.fecha_orden) <= new Date(filtroFin + 'T23:59:59'))
        return list
    }, [ordenes, filtroEstado, filtroInicio, filtroFin])

    const verDetalle = async (o) => {
        setOrdenSeleccionada(o)
        const { data } = await api.get(`/api/ordenes/${o.id_orden}`)
        setDetalleOrden(data.detalle)
        setShowDetalle(true)
    }

    const recibir = useCallback((o) => {
        setConfirm({
            show: true,
            titulo: 'Recibir orden',
            mensaje: `¿Marcar orden #${o.id_orden} como recibida? Esto aumentará el stock.`,
            accion: async () => {
                try { await api.patch(`/api/ordenes/${o.id_orden}/recibir`); await cargar() }
                catch (err) { setConfirm({ show: true, titulo: 'Error', mensaje: err.response?.data?.error || 'Error', accion: null }) }
            }
        })
    }, [cargar])

    const cancelar = useCallback((o) => {
        setConfirm({
            show: true,
            titulo: 'Cancelar orden',
            mensaje: `¿Cancelar orden #${o.id_orden}? Esta acción no se puede deshacer.`,
            accion: async () => {
                try { await api.delete(`/api/ordenes/${o.id_orden}`); await cargar() }
                catch (err) { setConfirm({ show: true, titulo: 'Error', mensaje: err.response?.data?.error || 'Error', accion: null }) }
            }
        })
    }, [cargar])

    const setItem = (idx, campo, valor) => {
        setNueva(prev => ({
            ...prev,
            items: prev.items.map((item, i) => i === idx ? { ...item, [campo]: valor } : item)
        }))
    }

    const crearOrden = async () => {
        if (!nueva.id_proveedor) { setErrorNueva('Selecciona un proveedor'); return }
        if (!nueva.id_empleado) { setErrorNueva('Selecciona un empleado'); return }
        const items = nueva.items.filter(i => i.id_producto && i.cantidad > 0 && i.precio_compra > 0)
        if (!items.length) { setErrorNueva('Agrega al menos un producto con precio'); return }
        setLoadingNueva(true)
        setErrorNueva('')
        try {
            await api.post('/api/ordenes', { ...nueva, items })
            setShowNueva(false)
            await cargar()
        } catch (err) {
            setErrorNueva(err.response?.data?.error || 'Error al crear orden')
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
                <div><h1>Órdenes de Compra</h1><p>{ordenesFiltradas.length} órdenes</p></div>
                <button className="btn btn-primary" onClick={() => { setErrorNueva(''); setNueva(NUEVA_ORDEN); setShowNueva(true) }}>+ Nueva Orden</button>
            </div>

            <div className="filtros-bar">
                <input type="date" className="form-control" value={filtroInicio} onChange={e => setFiltroInicio(e.target.value)} />
                <span>a</span>
                <input type="date" className="form-control" value={filtroFin} onChange={e => setFiltroFin(e.target.value)} />
                <select className="form-control" value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}>
                    <option value="">Todos los estados</option>
                    <option value="pendiente">Pendiente</option>
                    <option value="recibida">Recibida</option>
                </select>
                <button className="btn btn-outline" onClick={() => { setFiltroInicio(''); setFiltroFin(''); setFiltroEstado('') }}>Limpiar</button>
            </div>

            <div className="card">
                <table className="data-table">
                    <thead><tr><th>#</th><th>Fecha</th><th>Proveedor</th><th>Empleado</th><th>Estado</th><th>Acciones</th></tr></thead>
                    <tbody>
                        {ordenesFiltradas.map(o => (
                            <tr key={o.id_orden}>
                                <td>{o.id_orden}</td>
                                <td>{formatDate(o.fecha_orden)}</td>
                                <td>{o.proveedor}</td>
                                <td>{o.empleado}</td>
                                <td><span className={`estado-badge ${o.estado}`}>{o.estado}</span></td>
                                <td>
                                    <div className="acciones">
                                        <button className="btn-icon" title="Ver detalle" onClick={() => verDetalle(o)}><Eye size={15} /></button>
                                        {o.estado === 'pendiente' && <>
                                            <button className="btn-icon success" title="Recibir" onClick={() => recibir(o)}><Check size={15} /></button>
                                            <button className="btn-icon danger" title="Cancelar" onClick={() => cancelar(o)}><X size={15} /></button>
                                        </>}
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
                        <div className="modal-header"><h3>Orden #{ordenSeleccionada?.id_orden}</h3><button onClick={() => setShowDetalle(false)}>✕</button></div>
                        <div className="modal-body">
                            <div className="detalle-info">
                                <p><strong>Proveedor:</strong> {ordenSeleccionada?.proveedor}</p>
                                <p><strong>Empleado:</strong> {ordenSeleccionada?.empleado}</p>
                                <p><strong>Fecha:</strong> {ordenSeleccionada ? formatDate(ordenSeleccionada.fecha_orden) : ''}</p>
                                <p><strong>Estado:</strong> <span className={`estado-badge ${ordenSeleccionada?.estado}`}>{ordenSeleccionada?.estado}</span></p>
                            </div>
                            <table className="data-table">
                                <thead><tr><th>Producto</th><th>SKU</th><th>Cantidad</th><th>Precio compra</th><th>Subtotal</th></tr></thead>
                                <tbody>
                                    {detalleOrden.map(d => (
                                        <tr key={d.id_producto}>
                                            <td>{d.producto}</td><td>{d.sku}</td><td>{d.cantidad}</td>
                                            <td>Q{parseFloat(d.precio_compra).toFixed(2)}</td>
                                            <td>Q{(d.cantidad * d.precio_compra).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {showNueva && (
                <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowNueva(false) }}>
                    <div className="modal">
                        <div className="modal-header"><h3>Nueva Orden de Compra</h3><button onClick={() => setShowNueva(false)}>✕</button></div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Proveedor</label>
                                <select className="form-control" value={nueva.id_proveedor} onChange={e => setNueva(p => ({ ...p, id_proveedor: e.target.value }))}>
                                    <option value="">Seleccionar proveedor...</option>
                                    {proveedores.map(p => <option key={p.id_proveedor} value={p.id_proveedor}>{p.nombre}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Empleado</label>
                                <select className="form-control" value={nueva.id_empleado} onChange={e => setNueva(p => ({ ...p, id_empleado: e.target.value }))}>
                                    <option value="">Seleccionar empleado...</option>
                                    {empleados.map(e => <option key={e.id_empleado} value={e.id_empleado}>{e.nombre} {e.apellido}</option>)}
                                </select>
                            </div>
                            <div className="items-section">
                                <div className="items-header">
                                    <label>Productos a ordenar</label>
                                    <button className="btn btn-outline" onClick={() => setNueva(p => ({ ...p, items: [...p.items, { id_producto: '', cantidad: 1, precio_compra: '' }] }))}>+ Agregar</button>
                                </div>
                                {nueva.items.map((item, i) => (
                                    <div key={i} className="item-row">
                                        <select className="form-control" value={item.id_producto} onChange={e => setItem(i, 'id_producto', e.target.value)}>
                                            <option value="">Seleccionar producto...</option>
                                            {productos.map(p => <option key={p.id_producto} value={p.id_producto}>{p.nombre}</option>)}
                                        </select>
                                        <input type="number" min="1" className="form-control qty-input" placeholder="Cant." value={item.cantidad} onChange={e => setItem(i, 'cantidad', e.target.value)} />
                                        <input type="number" step="0.01" className="form-control qty-input" placeholder="Precio" value={item.precio_compra} onChange={e => setItem(i, 'precio_compra', e.target.value)} />
                                        <button className="btn-icon danger" onClick={() => setNueva(p => ({ ...p, items: p.items.filter((_, idx) => idx !== i) }))}>✕</button>
                                    </div>
                                ))}
                            </div>
                            {errorNueva && <p className="error-msg">{errorNueva}</p>}
                            <div className="modal-footer">
                                <button className="btn btn-outline" onClick={() => setShowNueva(false)}>Cancelar</button>
                                <button className="btn btn-primary" onClick={crearOrden} disabled={loadingNueva}>{loadingNueva ? 'Creando...' : 'Crear Orden'}</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
