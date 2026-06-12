import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://backend-api-reimburseku.vercel.app/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 10000 // opsional
})
apiClient.interceptors.request.use((config) => {
  const authStore = useAuthStore()
  const token = authStore.token // Mengambil token dari store
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
export default apiClient