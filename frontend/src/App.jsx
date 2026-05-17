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




function ProtectedRoute({ children, requiredRol }) {
    const { isLoggedIn, isStaff, isCliente, loading } = useAuth()

    if (loading) return null
    if (!isLoggedIn) return <Navigate to="/login" replace />
    if (requiredRol === 'staff' && !isStaff) return <Navigate to="/" replace />
    if (requiredRol === 'cliente' && !isCliente) return <Navigate to="/" replace />

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
        <Route path="/tienda" element={<TiendaPage />} />
        <Route path="/tienda/categoria/:id" element={<CategoriaPage />} />
        <Route path="/producto/:id" element={<ProductoDetailPage />} />


        <Route path="/carrito" element={<CarritoPage />} />
        <Route path="/perfil" element={
            <ProtectedRoute requiredRol="cliente">
                <PerfilPage />
            </ProtectedRoute>
        } />

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
