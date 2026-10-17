import axios from "axios"
import {auth} from "../config/firebase"

const axiosClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api",
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

export default axiosClient
