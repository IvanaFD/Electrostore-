import { useState, useEffect, useCallback } from 'react'
import { Eye, Pencil, Trash2 } from 'lucide-react'
import api from '@/services/api'

const FORM_VACIO = { nombre: '', apellido: '', email: '', telefono: '', cargo: 'vendedor' }

export default function EmpleadosPage() {
    const [empleados, setEmpleados] = useState([])
    const [showModal, setShowModal] = useState(false)
    const [showVer, setShowVer] = useState(false)
    const [empleadoVer, setEmpleadoVer] = useState(null)
    const [editando, setEditando] = useState(null)
    const [form, setForm] = useState(FORM_VACIO)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [confirm, setConfirm] = useState({ show: false, titulo: '', mensaje: '', accion: null })

    const cargar = useCallback(async () => {
        const { data } = await api.get('/api/empleados')
        setEmpleados(data)
    }, [])

    useEffect(() => { cargar() }, [cargar])

    const abrirModal = useCallback((e = null) => {
        setError('')
        if (e) {
            setEditando(e.id_empleado)
            setForm({ nombre: e.nombre, apellido: e.apellido, email: e.email, telefono: e.telefono, cargo: e.cargo })
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
            if (editando) { await api.put(`/api/empleados/${editando}`, form) }
            else { await api.post('/api/empleados', form) }
            setShowModal(false)
            await cargar()
        } catch (err) {
            setError(err.response?.data?.error || 'Error al guardar')
        } finally {
            setLoading(false)
        }
    }

    const eliminar = useCallback((e) => {
        setConfirm({
            show: true,
            titulo: 'Eliminar empleado',
            mensaje: `¿Eliminar a ${e.nombre} ${e.apellido}? Esta acción no se puede deshacer.`,
            accion: async () => {
                try { await api.delete(`/api/empleados/${e.id_empleado}`); await cargar() }
                catch (err) { setConfirm({ show: true, titulo: 'No se puede eliminar', mensaje: err.response?.data?.error || 'Error', accion: null }) }
            }
        })
    }, [cargar])

    const setField = (campo, valor) => setForm(prev => ({ ...prev, [campo]: valor }))

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
                                    <button className="btn btn-danger" onClick={async () => { setConfirm(c => ({ ...c, show: false })); await confirm.accion() }}>Eliminar</button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="page-header">
                <div><h1>Empleados</h1><p>{empleados.length} empleados</p></div>
                <button className="btn btn-primary" onClick={() => abrirModal()}>+ Nuevo Empleado</button>
            </div>

            <div className="card">
                <table className="data-table">
                    <thead><tr><th>#</th><th>Nombre</th><th>Email</th><th>Teléfono</th><th>Cargo</th><th>Usuario</th><th>Acciones</th></tr></thead>
                    <tbody>
                        {empleados.map(e => (
                            <tr key={e.id_empleado}>
                                <td>{e.id_empleado}</td>
                                <td><strong>{e.nombre} {e.apellido}</strong></td>
                                <td>{e.email}</td>
                                <td>{e.telefono}</td>
                                <td><span className={`cargo-badge ${e.cargo}`}>{e.cargo}</span></td>
                                <td>
                                    {e.username
                                        ? <span className="username-badge">{e.username}</span>
                                        : <span className="sin-usuario">Sin acceso</span>}
                                </td>
                                <td>
                                    <div className="acciones">
                                        <button className="btn-icon" title="Ver" onClick={() => { setEmpleadoVer(e); setShowVer(true) }}><Eye size={15} /></button>
                                        <button className="btn-icon" title="Editar" onClick={() => abrirModal(e)}><Pencil size={15} /></button>
                                        <button className="btn-icon danger" title="Eliminar" onClick={() => eliminar(e)}><Trash2 size={15} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showVer && (
                <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowVer(false) }}>
                    <div className="modal">
                        <div className="modal-header"><h3>{empleadoVer?.nombre} {empleadoVer?.apellido}</h3><button onClick={() => setShowVer(false)}>✕</button></div>
                        <div className="modal-body">
                            <div className="form-row">
                                <div className="form-group"><label>Nombre</label><input value={empleadoVer?.nombre || ''} className="form-control" disabled /></div>
                                <div className="form-group"><label>Apellido</label><input value={empleadoVer?.apellido || ''} className="form-control" disabled /></div>
                            </div>
                            <div className="form-group"><label>Email</label><input value={empleadoVer?.email || ''} className="form-control" disabled /></div>
                            <div className="form-row">
                                <div className="form-group"><label>Teléfono</label><input value={empleadoVer?.telefono || ''} className="form-control" disabled /></div>
                                <div className="form-group"><label>Cargo</label><input value={empleadoVer?.cargo || ''} className="form-control" disabled /></div>
                            </div>
                            <div className="form-group"><label>Usuario del sistema</label><input value={empleadoVer?.username || 'Sin acceso al sistema'} className="form-control" disabled /></div>
                        </div>
                    </div>
                </div>
            )}

            {showModal && (
                <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowModal(false) }}>
                    <div className="modal">
                        <div className="modal-header"><h3>{editando ? 'Editar Empleado' : 'Nuevo Empleado'}</h3><button onClick={() => setShowModal(false)}>✕</button></div>
                        <form onSubmit={guardar} className="modal-body">
                            <div className="form-row">
                                <div className="form-group"><label>Nombre</label><input className="form-control" value={form.nombre} onChange={e => setField('nombre', e.target.value)} required /></div>
                                <div className="form-group"><label>Apellido</label><input className="form-control" value={form.apellido} onChange={e => setField('apellido', e.target.value)} required /></div>
                            </div>
                            <div className="form-group"><label>Email</label><input type="email" className="form-control" value={form.email} onChange={e => setField('email', e.target.value)} required /></div>
                            <div className="form-row">
                                <div className="form-group"><label>Teléfono</label><input className="form-control" value={form.telefono} onChange={e => setField('telefono', e.target.value)} required /></div>
                                <div className="form-group">
                                    <label>Cargo</label>
                                    <select className="form-control" value={form.cargo} onChange={e => setField('cargo', e.target.value)} required>
                                        <option value="vendedor">Vendedor</option>
                                        <option value="supervisor">Supervisor</option>
                                        <option value="bodeguero">Bodeguero</option>
                                    </select>
                                </div>
                            </div>
                            {error && <p className="error-msg">{error}</p>}
                            <div className="modal-footer">
                                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancelar</button>
                                <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Guardando...' : 'Guardar'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
