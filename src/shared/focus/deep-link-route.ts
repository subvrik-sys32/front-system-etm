"use client"

/**
 * Ruta programática unificada.
 * idle → directing → arrived → idle
 */
import { create } from "zustand"

export type DeepLinkPhase = "idle" | "directing" | "arrived"

export type DeepLinkRoute = {
  phase: DeepLinkPhase
  taskId?: string
  projectId?: string
  focusToken?: string
  tab?: string | null
  key: string
}

type Store = {
  route: DeepLinkRoute | null
  begin: (input: Omit<DeepLinkRoute, "phase">) => void
  arrive: () => void
  finish: () => void
  cancel: () => void
}

export const useDeepLinkRoute = create<Store>((set, get) => ({
  route: null,
  begin: input => {
    const cur = get().route
    if (cur && cur.key === input.key && cur.phase !== "idle") return
    set({ route: { ...input, phase: "directing" } })
  },
  arrive: () => {
    const route = get().route
    if (!route || route.phase !== "directing") return
    set({ route: { ...route, phase: "arrived" } })
  },
  finish: () => set({ route: null }),
  cancel: () => set({ route: null }),
}))

export function selectIsDirecting(s: Store) {
  return s.route?.phase === "directing"
}
