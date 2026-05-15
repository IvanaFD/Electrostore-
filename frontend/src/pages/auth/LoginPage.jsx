import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import '../../styles/LoginPage.css'

export default function LoginPage() {
    const navigate = useNavigate()
    const auth = useAuth()

    const [form, setForm] = useState({ username: '', password: '' })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [showPass, setShowPass] = useState(false)

    useEffect(() => {
        if (auth.isLoggedIn) {
        navigate(auth.isStaff ? '/admin' : '/')
        }
    }, [auth.isLoggedIn, auth.isStaff, navigate])

    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const handleLogin = useCallback(async (e) => {
        e.preventDefault()
        if (!form.username.trim() || !form.password.trim()) {
        setError('Completa todos los campos')
        return
        }
        setError('')
        setLoading(true)
        try {
        const data = await auth.login(form.username, form.password)
        navigate(data.user.rol === 'cliente' ? '/' : '/admin')
        } catch (err) {
        setError(err.response?.data?.error || 'Error al iniciar sesión')
        } finally {
        setLoading(false)
        }
    }, [form, auth, navigate])

    return (
        <div className="auth-page">
        <div className="auth-left">
            <div className="auth-brand">
            <Link to="/" className="logo">
                <div className="logo-icon">
                <img src="/logo.png" alt="Logo" />
                </div>
                <span className="logo-text">ElectroStore</span>
            </Link>
            <h1>Bienvenido de vuelta</h1>
            <p>Inicia sesión para continuar con tus compras o gestionar tu cuenta.</p>
            </div>
        </div>

        <div className="auth-right">
            <div className="auth-card">
            <h2>Iniciar Sesión</h2>
            <p className="auth-subtitle">Ingresa tus credenciales</p>

            <form onSubmit={handleLogin}>
                <div className="form-group">
                <label>Usuario</label>
                <input
                    name="username"
                    type="text"
                    className="form-control"
                    placeholder="tu_usuario"
                    value={form.username}
                    onChange={handleChange}
                />
                </div>

                <div className="form-group">
                <label>Contraseña</label>
                <div className="password-wrap">
                    <input
                    name="password"
                    type={showPass ? 'text' : 'password'}
                    className="form-control"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={handleChange}
                    />
                    <button
                    type="button"
                    className="toggle-pass"
                    onClick={() => setShowPass(p => !p)}
                    >
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>
                </div>

                {error && <p className="error-msg">{error}</p>}

                <button
                type="submit"
                className="btn btn-primary w-full"
                disabled={loading}
                >
                {loading ? 'Ingresando...' : 'Iniciar Sesión'}
                </button>
            </form>

            <div className="auth-footer">
                <p>¿No tienes cuenta? <Link to="/registro">Regístrate</Link></p>
            </div>
            </div>
        </div>
        </div>
    )
}
