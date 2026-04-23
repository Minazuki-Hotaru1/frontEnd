import axios from "axios"
import pinia from "../stores"
import { useAuthStore } from "../stores/useAuthStore"

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

export default request
