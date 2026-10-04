import axios from "axios"
import {auth} from "../config/firebase"

const axiosClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: { "Content-Type": "application/json" }
})

// Gắn token
axiosClient.interceptors.request.use(async (config) => {
  const user = auth.currentUser
  if (user) {
    const token = await user.getIdToken()
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Trả thẳng data
axiosClient.interceptors.response.use(
  (response) => response.data,
  (error) => Promise.reject(error)
)

export default axiosClient