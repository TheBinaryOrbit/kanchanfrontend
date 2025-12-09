import axios from 'axios'

// const baseURL = 'https://2q766kvz-3000.inc1.devtunnels.ms'
const baseURL = 'https://apikanchan.xcentic.com'

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Attach token from localStorage when available (client-side only)
api.interceptors.request.use((config) => {
  try {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('adminToken')
      if (token) {
        // eslint-disable-next-line no-param-reassign
        config.headers = config.headers || {}
        // attach Bearer token
        // @ts-ignore
        config.headers.Authorization = `Bearer ${token}`
      }
    }
  } catch (err) {
    // ignore
  }
  return config
})

export async function login(uid: string, password: string) {
  return api.post('/api/users/login', { uid, password })
}

export default api
