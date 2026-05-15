import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

// Parsea el payload del JWT 
const parseJWT = (token) => {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    return JSON.parse(atob(base64))
  } catch {
    return null
  }
}


const isTokenValid = (token) => {
  const payload = parseJWT(token)
  if (!payload) return false
  return payload.exp * 1000 > Date.now()
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const savedToken = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')

    if (savedToken && isTokenValid(savedToken)) {
      setToken(savedToken)
      setUser(JSON.parse(savedUser))
    } else {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
    setLoading(false)
  }, [])

  const isLoggedIn = !!token
  const isCliente = user?.rol === 'cliente'
  const isAdmin = user?.rol === 'admin'
  const isVendedor = user?.rol === 'vendedor'
  const isStaff = ['admin', 'vendedor'].includes(user?.rol)

  const login = useCallback(async (username, password) => {
    const { data } = await api.post('/api/auth/login', { username, password })
    setToken(data.token)
    setUser(data.user)
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
    return data
  }, [])

  const logout = useCallback(() => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }, [])

  return (
    <AuthContext.Provider value={{
      token, user, isLoggedIn,
      isCliente, isAdmin, isVendedor, isStaff,
      login, logout, loading
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}
