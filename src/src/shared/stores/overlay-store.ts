import { create } from "zustand"

type OverlayId =
  | "filters"
  | "export"
  | "profile"
  | "notifications"
  | null

type OverlayStore = {
  open: OverlayId
  setOpen: (id: OverlayId) => void
  close: () => void
}

export const useOverlayStore =
  create<OverlayStore>(set => ({
    open: null,
    setOpen: open =>
      set({ open }),
    close: () =>
      set({ open: null }),
  }))