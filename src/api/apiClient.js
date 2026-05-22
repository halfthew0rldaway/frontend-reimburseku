import axios from 'axios'

const apiClient = axios.create({
  baseURL: 'https://backend-api-reimburseku.vercel.app/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 10000 // opsional
})

export default apiClient