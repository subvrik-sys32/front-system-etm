"use client"
import { create } from "zustand"

export type SidebarMode =
  | "open"
  | "preview"
  | "closed"

type SidebarStore = {
  mode: SidebarMode
  lastVisibleMode: "open" | "preview"
  open: () => void
  preview: () => void
  close: () => void
  togglePinned: () => void
}

export const useSidebarStore = create<SidebarStore>()(set => ({
  mode: "open",
  lastVisibleMode: "open",
  open: () =>
    set({ mode: "open", lastVisibleMode: "open" }),
  preview: () =>
    set({ mode: "preview", lastVisibleMode: "preview" }),
  close: () =>
    set(state => ({
      mode: "closed",
      lastVisibleMode:
        state.mode === "preview" ? "preview" : "open",
    })),
  togglePinned: () =>
    set(state => ({
      mode: state.mode === "open" ? "preview" : "open",
      lastVisibleMode:
        state.mode === "open" ? "preview" : "open",
    })),
}))