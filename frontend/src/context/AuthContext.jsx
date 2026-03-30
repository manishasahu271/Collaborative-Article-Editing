import { createContext, useContext, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import api from '../api/axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')
    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  const login = async (username, password) => {
    try {
      const tokenRes = await api.post('/auth/token', { username, password }, { responseType: 'text' })
      const jwt = tokenRes.data
      localStorage.setItem('token', jwt)
      setToken(jwt)

      const userRes = await api.get(`/user/username/${encodeURIComponent(username)}`)
      const userData = userRes.data
      localStorage.setItem('user', JSON.stringify(userData))
      setUser(userData)
      toast.success('Signed in')
      return true
    } catch (err) {
      console.error(err)
      toast.error('Invalid credentials')
      return false
    }
  }

  const register = async (username, password, role) => {
    try {
      await api.post('/auth/register', { username, password, role })
      toast.success('Account created')
      // auto login
      await login(username, password)
      return true
    } catch (err) {
      console.error(err)
      toast.error('Unable to register')
      return false
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
    toast('Signed out')
  }

  const value = { user, token, loading, login, register, logout }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuthContext() {
  return useContext(AuthContext)
}
