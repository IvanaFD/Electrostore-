import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import api from '@/services/api'
import '@/styles/auth.css'

export default function RegistroPage() {
    const navigate = useNavigate()
    const auth = useAuth()

    const [form, setForm] = useState({
        nombre: '', apellido: '', email: '',
        telefono: '', direccion: '', username: '', password: ''
    })
    const [errors, setErrors] = useState({})
    const [serverError, setServerError] = useState('')
    const [loading, setLoading] = useState(false)
    const [showPass, setShowPass] = useState(false)

    useEffect(() => {
        if (auth.isLoggedIn) navigate('/')
    }, [auth.isLoggedIn, navigate])

    const handleChange = (e) => {
        const { name, value } = e.target
        setForm(prev => ({ ...prev, [name]: value }))
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
    }

    const validate = () => {
        const newErrors = {}
        if (!form.nombre.trim()) newErrors.nombre = 'El nombre es requerido'
        if (!form.apellido.trim()) newErrors.apellido = 'El apellido es requerido'
        if (!form.email.trim()) {
        newErrors.email = 'El email es requerido'
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
        newErrors.email = 'Ingresa un email válido'
        }
        if (!form.telefono.trim()) newErrors.telefono = 'El teléfono es requerido'
        if (!form.direccion.trim()) newErrors.direccion = 'La dirección es requerida'
        if (form.username.trim().length < 3) newErrors.username = 'Mínimo 3 caracteres'
        if (form.password.length < 6) newErrors.password = 'Mínimo 6 caracteres'
        return newErrors
    }

    const handleRegistro = async (e) => {
        e.preventDefault()
        const validationErrors = validate()
        if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors)
        return
        }
        setServerError('')
        setLoading(true)
        try {
        await api.post('/api/auth/register', form)
        await auth.login(form.username, form.password)
        navigate('/')
        } catch (err) {
        setServerError(err.response?.data?.error || 'Error al crear la cuenta')
        } finally {
        setLoading(false)
        }
    }

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
            <h1>Únete a ElectroStore</h1>
            <p>Crea tu cuenta y accede a todos los componentes electrónicos que necesitas para tus proyectos.</p>
            </div>
        </div>

        <div className="auth-right">
            <div className="auth-card">
            <h2>Crear Cuenta</h2>
            <p className="auth-subtitle">Llena tus datos para registrarte</p>

            <form onSubmit={handleRegistro}>
                <div className="form-row">
                <div className="form-group">
                    <label>Nombre</label>
                    <input
                    name="nombre"
                    type="text"
                    className="form-control"
                    value={form.nombre}
                    onChange={handleChange}
                    />
                    {errors.nombre && <p className="error-msg">{errors.nombre}</p>}
                </div>
                <div className="form-group">
                    <label>Apellido</label>
                    <input
                    name="apellido"
                    type="text"
                    className="form-control"
                    value={form.apellido}
                    onChange={handleChange}
                    />
                    {errors.apellido && <p className="error-msg">{errors.apellido}</p>}
                </div>
                </div>

                <div className="form-group">
                <label>Email</label>
                <input
                    name="email"
                    type="email"
                    className="form-control"
                    value={form.email}
                    onChange={handleChange}
                />
                {errors.email && <p className="error-msg">{errors.email}</p>}
                </div>

                <div className="form-group">
                <label>Teléfono</label>
                <input
                    name="telefono"
                    type="text"
                    className="form-control"
                    value={form.telefono}
                    onChange={handleChange}
                />
                {errors.telefono && <p className="error-msg">{errors.telefono}</p>}
                </div>

                <div className="form-group">
                <label>Dirección</label>
                <input
                    name="direccion"
                    type="text"
                    className="form-control"
                    value={form.direccion}
                    onChange={handleChange}
                />
                {errors.direccion && <p className="error-msg">{errors.direccion}</p>}
                </div>

                <div className="form-group">
                <label>Usuario</label>
                <input
                    name="username"
                    type="text"
                    className="form-control"
                    value={form.username}
                    onChange={handleChange}
                />
                {errors.username && <p className="error-msg">{errors.username}</p>}
                </div>

                <div className="form-group">
                <label>Contraseña</label>
                <div className="password-wrap">
                    <input
                    name="password"
                    type={showPass ? 'text' : 'password'}
                    className="form-control"
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
                {errors.password && <p className="error-msg">{errors.password}</p>}
                </div>

                {serverError && <p className="error-msg">{serverError}</p>}

                <button
                type="submit"
                className="btn btn-primary w-full"
                disabled={loading}
                >
                {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
                </button>
            </form>

            <div className="auth-footer">
                <p>¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link></p>
            </div>
            </div>
        </div>
        </div>
    )
}
