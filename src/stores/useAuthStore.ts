import { defineStore } from "pinia"

interface AuthState {
  token: string | null
  username: string | null
  id: string | null
}

export const useAuthStore = defineStore("auth", {
  state: (): AuthState => ({
    token: null,
    username: null,
    id: null,
  }),

  getters: {
    isAuthenticated: (state) => Boolean(state.token),
  },

  actions: {
    setAuthData(token: string, username: string, id?: string | null) {
      this.token = token
      this.username = username
      this.id = id ?? null
    },
    clearAuthData() {
      this.token = null
      this.username = null
      this.id = null
    },
  },

  persist: true,
})
