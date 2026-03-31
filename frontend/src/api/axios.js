import axios from 'axios'

const baseURL = import.meta.env.VITE_API_BASE_URL || ''

const api = axios.create({
  baseURL, // Vercel env var or local proxy/nginx
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  if (baseURL.includes('ngrok-free.')) {
    config.headers['ngrok-skip-browser-warning'] = 'true'
  }
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  },
)

export default api
