import { useAuthStore } from "../store/auth-store"

export function useAuth() {

  const user =
    useAuthStore(
      s => s.user,
    )

  const logout =
    useAuthStore(
      s => s.logout,
    )

  return {

    user,

    logout,

    authenticated:
      Boolean(user),

  }

}