export const authSession = {
  get(): string | null {
    if (typeof window === "undefined") {
      return null
    }

    return localStorage.getItem("accessToken")
  },

  set(token: string | null): void {
    if (typeof window === "undefined") {
      return
    }

    if (!token) {
      localStorage.removeItem("accessToken")
      return
    }

    localStorage.setItem("accessToken", token)
  },
}