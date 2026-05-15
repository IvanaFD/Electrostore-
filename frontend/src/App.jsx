import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { useAuth } from './contexts/AuthContext'
import LoginPage from './pages/auth/LoginPage'
import RegistroPage from './pages/auth/RegistroPage'

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

        
            

        <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    )
}

export default function App() {
    return (
        <BrowserRouter>
        <AuthProvider>
            <AppRoutes />
        </AuthProvider>
        </BrowserRouter>
    )
}
