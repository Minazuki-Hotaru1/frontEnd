import axios from "axios"
import pinia from "../stores"
import { useAuthStore } from "../stores/useAuthStore"
import { ElMessage } from "element-plus"

const request = axios.create({
  baseURL: "http://localhost:8081/city",
  timeout: 10000,
})

request.interceptors.request.use((config) => {
  const authStore = useAuthStore(pinia)
  const token = authStore.token

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

request.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const authStore = useAuthStore(pinia)
      authStore.clearAuthData()
      ElMessage.error("登录已过期，请重新登录")
      window.location.href = "/"
    }
    return Promise.reject(error)
  }
)

export default request
