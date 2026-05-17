import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import api from '@/services/api'

export default function PerfilAdminPage() {
    const { user } = useAuth()
    const [empleado, setEmpleado] = useState(null)

    const iniciales = useMemo(
        () => user?.username?.slice(0, 2).toUpperCase() || 'AD',
        [user]
    )

    useEffect(() => {
        api.get('/api/empleados').then(({ data }) => {
            setEmpleado(data.find(e => e.id_usuario === user?.id_usuario) || null)
        }).catch(() => {})
    }, [user])

    return (
        <div className="page">
            <div className="page-header"><h1>Mi Perfil</h1></div>
            <div className="admin-perfil-layout">
                <div className="card admin-perfil-card">
                    <div className="admin-avatar">{iniciales}</div>
                    <h3>{user?.username}</h3>
                    <span className="admin-rol-badge">{user?.rol}</span>

                    {empleado ? (
                        <div className="admin-perfil-datos">
                            <div className="dato"><span className="dato-label">Nombre</span><span>{empleado.nombre} {empleado.apellido}</span></div>
                            <div className="dato"><span className="dato-label">Email</span><span>{empleado.email}</span></div>
                            <div className="dato"><span className="dato-label">Teléfono</span><span>{empleado.telefono}</span></div>
                            <div className="dato"><span className="dato-label">Cargo</span><span className={`cargo-badge ${empleado.cargo}`}>{empleado.cargo}</span></div>
                        </div>
                    ) : (
                        <p className="sin-datos">Este usuario no tiene empleado vinculado</p>
                    )}
                </div>
            </div>
        </div>
    )
}
