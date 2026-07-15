import axios from "axios"
import { toast } from "sonner"

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

      // Petición cancelada a propósito (ej. React Query aborta un
      // fetch que ya no importa porque el componente se desmontó o
      // cambió el query key). No es un error real — no hay nada que
      // mostrarle al usuario, y menos "Ocurrió un error inesperado".
      if (axios.isCancel(err)) {
        return Promise.reject(err)
      }

      if (err?.response?.status === 401) {

        authSession.set(null)
        useAuthStore.getState().logout()

        if (typeof window !== "undefined") {
          window.location.href = "/login"
        }

        return Promise.reject(err)
      }

      if (!err?.config?.skipGlobalErrorToast) {

        const status = err?.response?.status
        const backendMessage = err?.response?.data?.message

        const message =
          backendMessage ??
          (status === 400
            ? "Solicitud inválida. Revisa los datos ingresados."
            : status >= 500
              ? "Error del servidor. Intenta nuevamente en unos minutos."
              : "Ocurrió un error inesperado.")

        toast.error(message)
      }

      return Promise.reject(err)
    }
  )
}