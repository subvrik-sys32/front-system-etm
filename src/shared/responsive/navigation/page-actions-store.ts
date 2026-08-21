import { create } from "zustand"
import type { ReactNode } from "react"

type PageActionsState = {
  actions: ReactNode | null
  setActions: (actions: ReactNode | null) => void
}

/**
 * Acciones de página (ej. "+") en el chrome del shell.
 * Mismo contrato que usePageTitle: cada page setea y limpia al desmontar.
 * DesktopTopBar las renderiza a la derecha del pill de título.
 */
export const usePageActionsStore = create<PageActionsState>(set => ({
  actions: null,
  setActions: actions => set({ actions }),
}))
