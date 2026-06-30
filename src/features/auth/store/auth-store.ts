"use client"

import { create } from "zustand"

type AuthStore = {
  user: any | null

  setUser: (
    user: any | null,
  ) => void

  logout: () => void
}

export const useAuthStore =
  create<AuthStore>()(
    (set) => ({

      user: null,

      setUser: (user) =>
        set({ user }),

      logout: () =>
        set({
          user: null,
        }),

    })
  )