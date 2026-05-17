import { useMemo, useCallback } from 'react'
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Package, ShoppingCart, Truck, Users, UserCircle, LogOut } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import '@/styles/admin.css'

export default function AdminLayout() {
    const navigate = useNavigate()
    const { user, logout, isAdmin } = useAuth()

    const iniciales = useMemo(
        () => user?.username?.slice(0, 2).toUpperCase() || 'AD',
        [user]
    )

    const handleLogout = useCallback(() => {
        logout()
        navigate('/login')
    }, [logout, navigate])

    const navClass = ({ isActive }) => `nav-item${isActive ? ' active' : ''}`

    return (
        <div className="admin-layout">
            <aside className="sidebar">
                <div className="sidebar-header">
                    <Link to="/" className="sidebar-logo">
                        <div className="logo-icon">
                            <img src="/logo.png" alt="Logo" />
                        </div>
                        <span>ElectroStore</span>
                    </Link>
                </div>

                <nav className="sidebar-nav">
                    <NavLink to="/admin" end className={navClass}>
                        <LayoutDashboard size={18} /> Dashboard
                    </NavLink>
                    <NavLink to="/admin/inventario" className={navClass}>
                        <Package size={18} /> Inventario
                    </NavLink>
                    <NavLink to="/admin/ventas" className={navClass}>
                        <ShoppingCart size={18} /> Ventas
                    </NavLink>
                    <NavLink to="/admin/ordenes" className={navClass}>
                        <Truck size={18} /> Órdenes
                    </NavLink>
                    {isAdmin && (
                        <NavLink to="/admin/empleados" className={navClass}>
                            <Users size={18} /> Empleados
                        </NavLink>
                    )}
                    <NavLink to="/admin/perfil" className={navClass}>
                        <UserCircle size={18} /> Mi Perfil
                    </NavLink>
                </nav>

                <div className="sidebar-footer">
                    <div className="user-info">
                        <div className="user-avatar">{iniciales}</div>
                        <div>
                            <p className="user-name">{user?.username}</p>
                            <p className="user-rol">{user?.rol}</p>
                        </div>
                    </div>
                    <button className="logout-btn" onClick={handleLogout}>
                        <LogOut size={16} />
                    </button>
                </div>
            </aside>

            <main className="admin-content">
                <Outlet />
            </main>
        </div>
    )
}
