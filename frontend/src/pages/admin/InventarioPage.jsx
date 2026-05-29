import { useState, useEffect, useMemo, useCallback } from 'react'
import { Eye, Pencil, Trash2 } from 'lucide-react'
import api from '@/services/api'
import { useAuth } from '@/contexts/AuthContext'
import '@/styles/inventario.css'

const FORM_VACIO = {
    sku: '', nombre: '', marca: '', precio_venta: '', precio_costo: '',
    stock_actual: 0, stock_minimo: 5, descripcion: '', imagen_url: '',
    id_categoria: '', id_proveedor: ''
}

const getStockClass = (p) => {
    if (p.stock_actual === 0) return 'sin-stock'
    if (p.stock_actual <= p.stock_minimo) return 'stock-bajo'
    return 'en-stock'
}

export default function InventarioPage() {
    const { isAdmin, isBodeguero } = useAuth()
    const canCreate = isAdmin || isBodeguero
    const canEdit   = isAdmin || isBodeguero
    const canDelete = isAdmin

    const [productos, setProductos] = useState([])
    const [categorias, setCategorias] = useState([])
    const [proveedores, setProveedores] = useState([])
    const [filtroNombre, setFiltroNombre] = useState('')
    const [filtroCategoria, setFiltroCategoria] = useState('')
    const [filtroStock, setFiltroStock] = useState('')
    const [showModal, setShowModal] = useState(false)
    const [showVer, setShowVer] = useState(false)
    const [productoVer, setProductoVer] = useState(null)
    const [editando, setEditando] = useState(null)
    const [form, setForm] = useState(FORM_VACIO)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [confirm, setConfirm] = useState({ show: false, titulo: '', mensaje: '', accion: null })

    const cargar = useCallback(async () => {
        const [prods, cats, provs] = await Promise.all([
            api.get('/api/productos'),
            api.get('/api/categorias'),
            api.get('/api/proveedores'),
        ])
        setProductos(prods.data)
        setCategorias(cats.data)
        setProveedores(provs.data)
    }, [])

    useEffect(() => { cargar() }, [cargar])

    const productosFiltrados = useMemo(() => {
        let list = productos
        if (filtroNombre) {
            const q = filtroNombre.toLowerCase()
            list = list.filter(p => p.nombre.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q))
        }
        if (filtroCategoria) list = list.filter(p => p.id_categoria === parseInt(filtroCategoria))
        if (filtroStock === 'bajo') list = list.filter(p => p.stock_actual <= p.stock_minimo && p.stock_actual > 0)
        if (filtroStock === 'sin') list = list.filter(p => p.stock_actual === 0)
        return list
    }, [productos, filtroNombre, filtroCategoria, filtroStock])

    const abrirModal = useCallback((p = null) => {
        setError('')
        if (p) {
            setEditando(p.id_producto)
            setForm({ ...p })
        } else {
            setEditando(null)
            setForm(FORM_VACIO)
        }
        setShowModal(true)
    }, [])

    const guardar = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        try {
            if (editando) {
                await api.put(`/api/productos/${editando}`, form)
            } else {
                await api.post('/api/productos', form)
            }
            setShowModal(false)
            await cargar()
        } catch (err) {
            setError(err.response?.data?.error || 'Error al guardar')
        } finally {
            setLoading(false)
        }
    }

    const eliminar = useCallback((p) => {
        setConfirm({
            show: true,
            titulo: 'Eliminar producto',
            mensaje: `¿Eliminar "${p.nombre}"? Esta acción no se puede deshacer.`,
            accion: async () => {
                try {
                    await api.delete(`/api/productos/${p.id_producto}`)
                    await cargar()
                } catch (err) {
                    setConfirm({
                        show: true,
                        titulo: 'No se puede eliminar',
                        mensaje: err.response?.data?.error || 'Error al eliminar',
                        accion: null
                    })
                }
            }
        })
    }, [cargar])

    const setField = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

    return (
        <div className="page">
            {/* Confirm Modal */}
            {confirm.show && (
                <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setConfirm(c => ({ ...c, show: false })) }}>
                    <div className="modal modal-sm">
                        <div className="modal-header">
                            <h3>{confirm.titulo}</h3>
                        </div>
                        <div className="modal-body">
                            <p>{confirm.mensaje}</p>
                            <div className="modal-footer">
                                <button className="btn btn-outline" onClick={() => setConfirm(c => ({ ...c, show: false }))}>
                                    Cancelar
                                </button>
                                {confirm.accion && (
                                    <button className="btn btn-danger" onClick={async () => { setConfirm(c => ({ ...c, show: false })); await confirm.accion() }}>
                                        Eliminar
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="page-header">
                <div>
                    <h1>Inventario</h1>
                    <p>{productosFiltrados.length} productos</p>
                </div>
                {canCreate && (
                    <button className="btn btn-primary" onClick={() => abrirModal()}>+ Nuevo Producto</button>
                )}
            </div>

            <div className="filtros-bar">
                <input
                    type="text"
                    className="form-control search-input"
                    placeholder="Buscar por nombre o SKU..."
                    value={filtroNombre}
                    onChange={e => setFiltroNombre(e.target.value)}
                />
                <select className="form-control filter-select" value={filtroCategoria} onChange={e => setFiltroCategoria(e.target.value)}>
                    <option value="">Todas las categorías</option>
                    {categorias.map(c => <option key={c.id_categoria} value={c.id_categoria}>{c.nombre}</option>)}
                </select>
                <select className="form-control filter-select" value={filtroStock} onChange={e => setFiltroStock(e.target.value)}>
                    <option value="">Todo el stock</option>
                    <option value="bajo">Stock bajo</option>
                    <option value="sin">Sin stock</option>
                </select>
            </div>

            <div className="card">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>SKU</th><th>Producto</th><th>Categoría</th>
                            <th>Proveedor</th><th>Precio</th><th>Stock</th><th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {productosFiltrados.map(p => (
                            <tr key={p.id_producto}>
                                <td><span className="sku-badge">{p.sku}</span></td>
                                <td>
                                    <div className="producto-info">
                                        <img
                                            src={p.imagen_url || 'https://placehold.co/40x40'}
                                            alt={p.nombre}
                                            className="prod-img"
                                            onError={e => e.target.src = 'https://placehold.co/40x40'}
                                        />
                                        <div>
                                            <p className="prod-name">{p.nombre}</p>
                                            <p className="prod-marca">{p.marca}</p>
                                        </div>
                                    </div>
                                </td>
                                <td>{p.categoria}</td>
                                <td>{p.proveedor}</td>
                                <td>Q{parseFloat(p.precio_venta).toFixed(2)}</td>
                                <td><span className={`stock-badge ${getStockClass(p)}`}>{p.stock_actual}</span></td>
                                <td>
                                    <div className="acciones">
                                        <button className="btn-icon" title="Ver" onClick={() => { setProductoVer(p); setShowVer(true) }}>
                                            <Eye size={15} />
                                        </button>
                                        {canEdit && (
                                            <button className="btn-icon" title="Editar" onClick={() => abrirModal(p)}>
                                                <Pencil size={15} />
                                            </button>
                                        )}
                                        {canDelete && (
                                            <button className="btn-icon danger" title="Eliminar" onClick={() => eliminar(p)}>
                                                <Trash2 size={15} />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal Ver */}
            {showVer && (
                <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowVer(false) }}>
                    <div className="modal">
                        <div className="modal-header">
                            <h3>{productoVer?.nombre}</h3>
                            <button onClick={() => setShowVer(false)}>✕</button>
                        </div>
                        <div className="modal-body">
                            <div className="form-row">
                                <div className="form-group"><label>SKU</label><input value={productoVer?.sku || ''} className="form-control" disabled /></div>
                                <div className="form-group"><label>Marca</label><input value={productoVer?.marca || ''} className="form-control" disabled /></div>
                            </div>
                            <div className="form-group"><label>Nombre</label><input value={productoVer?.nombre || ''} className="form-control" disabled /></div>
                            <div className="form-row">
                                <div className="form-group"><label>Precio Venta</label><input value={productoVer?.precio_venta || ''} className="form-control" disabled /></div>
                                <div className="form-group"><label>Precio Costo</label><input value={productoVer?.precio_costo || ''} className="form-control" disabled /></div>
                            </div>
                            <div className="form-row">
                                <div className="form-group"><label>Stock Actual</label><input value={productoVer?.stock_actual ?? ''} className="form-control" disabled /></div>
                                <div className="form-group"><label>Stock Mínimo</label><input value={productoVer?.stock_minimo ?? ''} className="form-control" disabled /></div>
                            </div>
                            <div className="form-row">
                                <div className="form-group"><label>Categoría</label><input value={productoVer?.categoria || ''} className="form-control" disabled /></div>
                                <div className="form-group"><label>Proveedor</label><input value={productoVer?.proveedor || ''} className="form-control" disabled /></div>
                            </div>
                            <div className="form-group"><label>URL Imagen</label><input value={productoVer?.imagen_url || ''} className="form-control" disabled /></div>
                            <div className="form-group"><label>Descripción</label><textarea value={productoVer?.descripcion || ''} className="form-control" rows={3} disabled /></div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Crear/Editar */}
            {showModal && (
                <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowModal(false) }}>
                    <div className="modal">
                        <div className="modal-header">
                            <h3>{editando ? 'Editar Producto' : 'Nuevo Producto'}</h3>
                            <button onClick={() => setShowModal(false)}>✕</button>
                        </div>
                        <form onSubmit={guardar} className="modal-body">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>SKU</label>
                                    <input className="form-control" value={form.sku} onChange={e => setField('sku', e.target.value)} disabled={!!editando} required />
                                </div>
                                <div className="form-group">
                                    <label>Marca</label>
                                    <input className="form-control" value={form.marca} onChange={e => setField('marca', e.target.value)} required />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Nombre</label>
                                <input className="form-control" value={form.nombre} onChange={e => setField('nombre', e.target.value)} required />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Precio Venta</label>
                                    <input type="number" step="0.01" className="form-control" value={form.precio_venta} onChange={e => setField('precio_venta', e.target.value)} required />
                                </div>
                                <div className="form-group">
                                    <label>Precio Costo</label>
                                    <input type="number" step="0.01" className="form-control" value={form.precio_costo} onChange={e => setField('precio_costo', e.target.value)} required />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Stock Actual</label>
                                    <input type="number" className="form-control" value={form.stock_actual} onChange={e => setField('stock_actual', e.target.value)} required />
                                </div>
                                <div className="form-group">
                                    <label>Stock Mínimo</label>
                                    <input type="number" className="form-control" value={form.stock_minimo} onChange={e => setField('stock_minimo', e.target.value)} required />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Categoría</label>
                                    <select className="form-control" value={form.id_categoria} onChange={e => setField('id_categoria', e.target.value)} required>
                                        <option value="">Seleccionar...</option>
                                        {categorias.map(c => <option key={c.id_categoria} value={c.id_categoria}>{c.nombre}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Proveedor</label>
                                    <select className="form-control" value={form.id_proveedor} onChange={e => setField('id_proveedor', e.target.value)} required>
                                        <option value="">Seleccionar...</option>
                                        {proveedores.map(p => <option key={p.id_proveedor} value={p.id_proveedor}>{p.nombre}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="form-group">
                                <label>URL Imagen</label>
                                <input className="form-control" value={form.imagen_url} onChange={e => setField('imagen_url', e.target.value)} placeholder="https://..." />
                            </div>
                            <div className="form-group">
                                <label>Descripción</label>
                                <textarea className="form-control" rows={3} value={form.descripcion} onChange={e => setField('descripcion', e.target.value)} required />
                            </div>
                            {error && <p className="error-msg">{error}</p>}
                            <div className="modal-footer">
                                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancelar</button>
                                <button type="submit" className="btn btn-primary" disabled={loading}>
                                    {loading ? 'Guardando...' : 'Guardar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
