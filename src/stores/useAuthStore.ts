import { defineStore } from "pinia"

interface AuthState {
  token: string | null
  username: string | null
  id: string | null
  isGuest: boolean
}

export const useAuthStore = defineStore("auth", {
  state: (): AuthState => ({
    token: null,
    username: null,
    id: null,
    isGuest: false,
  }),

  getters: {
    isAuthenticated: (state) => Boolean(state.token),
  },

  actions: {
    setAuthData(token: string, username: string, id?: string | null) {
      this.token = token
      this.username = username
      this.id = id ?? null
      this.isGuest = false
    },
    setGuest() {
      this.token = null
      this.username = "游客"
      this.id = null
      this.isGuest = true
    },
    clearAuthData() {
      this.token = null
      this.username = null
      this.id = null
      this.isGuest = false
    },
  },

  persist: true,
})
