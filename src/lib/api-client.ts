import { api } from "./api"
import { authSession } from "./auth-session"
import { useAuthStore } from "@/features/auth/store/auth-store"

export function initApiClient() {

  console.log("API CLIENT INIT")

  api.interceptors.request.use((config) => {

    const token = authSession.get()

    console.log("REQUEST TOKEN:", token)

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  })

  api.interceptors.response.use(
    (res) => res,
    (err) => {

      if (
        err?.response?.status === 401 &&
        err?.config?.url === "/auth/me"
      ) {
        authSession.set(null)
        useAuthStore.getState().logout()
      }

      return Promise.reject(err)
    }
  )
}