import { api } from "./api"
import { authSession } from "./auth-session"
import { useAuthStore } from "@/features/auth/store/auth-store"

export function initApiClient() {

  api.interceptors.request.use((config) => {

    const token = authSession.get()

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  })

  api.interceptors.response.use(
    (res) => res,
    (err) => {

      if (err?.response?.status === 401) {

        authSession.set(null)
        useAuthStore.getState().logout()

        if (typeof window !== "undefined") {
          window.location.href = "/login"
        }

      }

      return Promise.reject(err)
    }
  )
}