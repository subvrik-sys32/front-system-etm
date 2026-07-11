"use client"
import { create } from "zustand"

export type SidebarMode = "open" | "collapsed" | "closed"

type SidebarStore = {
  mode: SidebarMode
  lastVisibleMode: "open" | "collapsed"

  // Botón 1 (flecha): expande / comprime a solo iconos
  toggleCollapsed: () => void

  // Botón 2 (nuevo): oculta / muestra el sidebar por completo
  toggleClosed: () => void
}

export const useSidebarStore = create<SidebarStore>()(set => ({
  mode: "open",
  lastVisibleMode: "open",

  toggleCollapsed: () =>
    set(state => {
      if (state.mode === "closed") return state

      const next: SidebarMode = state.mode === "open" ? "collapsed" : "open"

      return { mode: next, lastVisibleMode: next }
    }),

  toggleClosed: () =>
    set(state => {
      if (state.mode === "closed") {
        return { mode: state.lastVisibleMode }
      }

      return {
        mode: "closed",
        lastVisibleMode: state.mode as "open" | "collapsed",
      }
    }),
}))