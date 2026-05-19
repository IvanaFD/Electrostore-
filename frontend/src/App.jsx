import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { useAuth } from './contexts/AuthContext'
import LoginPage from './pages/auth/LoginPage'
import RegistroPage from './pages/auth/RegistroPage'
import { CartProvider } from './contexts/CartContext'
import HomePage from './pages/client/HomePage'
import TiendaPage from './pages/client/TiendaPage'
import CategoriaPage from './pages/client/CategoriaPage'
import ProductoDetailPage from './pages/client/ProductoDetailPage'
import CarritoPage from './pages/client/CarritoPage'
import PerfilPage from './pages/client/PerfilPage'
import AdminLayout from './pages/admin/AdminLayout'
import DashboardPage from './pages/admin/DashboardPage'
import InventarioPage from './pages/admin/InventarioPage'
import VentasPage from './pages/admin/VentasPage'
import OrdenesPage from './pages/admin/OrdenesPage'
import EmpleadosPage from './pages/admin/EmpleadosPage'
import PerfilAdminPage from './pages/admin/PerfilAdminPage'




function ProtectedRoute({ children, requiredRol, allowedRoles }) {
    const { isLoggedIn, isStaff, isCliente, loading, user } = useAuth()

    if (loading) return null
    if (!isLoggedIn) return <Navigate to="/login" replace />
    if (requiredRol === 'staff' && !isStaff) return <Navigate to="/" replace />
    if (requiredRol === 'cliente' && !isCliente) return <Navigate to="/" replace />
    if (allowedRoles && !allowedRoles.includes(user?.rol)) return <Navigate to="/admin" replace />

    return children
}

function AdminIndex() {
    const { isBodeguero } = useAuth()
    if (isBodeguero) return <Navigate to="/admin/inventario" replace />
    return <DashboardPage />
}

function ClienteRoute({ children }) {
    const { isLoggedIn, isStaff, loading } = useAuth()

    if (loading) return null
    if (isLoggedIn && isStaff) return <Navigate to="/" replace />

    return children
}

function AppRoutes() {
    const { loading } = useAuth()
    if (loading) return null

    return (
        <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registro" element={<RegistroPage />} />

        <Route path="/" element={<HomePage />} />
        <Route path="/tienda" element={<ClienteRoute><TiendaPage /></ClienteRoute>} />
        <Route path="/tienda/categoria/:id" element={<ClienteRoute><CategoriaPage /></ClienteRoute>} />
        <Route path="/producto/:id" element={<ClienteRoute><ProductoDetailPage /></ClienteRoute>} />

        <Route path="/carrito" element={<ClienteRoute><CarritoPage /></ClienteRoute>} />
        <Route path="/perfil" element={
            <ProtectedRoute requiredRol="cliente">
                <PerfilPage />
            </ProtectedRoute>
        } />

        <Route path="/admin" element={
            <ProtectedRoute requiredRol="staff">
                <AdminLayout />
            </ProtectedRoute>
        }>
            <Route index element={<AdminIndex />} />
            <Route path="inventario" element={<InventarioPage />} />
            <Route path="ventas" element={
                <ProtectedRoute allowedRoles={['admin', 'vendedor']}>
                    <VentasPage />
                </ProtectedRoute>
            } />
            <Route path="ordenes" element={
                <ProtectedRoute allowedRoles={['admin', 'vendedor', 'bodeguero']}>
                    <OrdenesPage />
                </ProtectedRoute>
            } />
            <Route path="empleados" element={
                <ProtectedRoute allowedRoles={['admin']}>
                    <EmpleadosPage />
                </ProtectedRoute>
            } />
            <Route path="perfil" element={<PerfilAdminPage />} />
        </Route>


        <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    )
}

export default function App() {
    return (
        <BrowserRouter>
        <AuthProvider>
            <CartProvider>
                <AppRoutes />
            </CartProvider>
        </AuthProvider>
        </BrowserRouter>
    )
}
