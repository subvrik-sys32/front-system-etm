import { create } from "zustand"
import type { ReactNode } from "react"

type PageToolbarState = {
  toolbar: ReactNode | null
  setToolbar: (toolbar: ReactNode | null) => void
}

/** Toolbar de lista (search/filter/sort) en DesktopTopBar. */
export const usePageToolbarStore = create<PageToolbarState>(set => ({
  toolbar: null,
  setToolbar: toolbar => set({ toolbar }),
}))
