"use client"

import { create } from "zustand"

/**
 * Intent de deep-link de un solo uso (memoria).
 * La URL se limpia al capturar; el trabajo corre contra este store.
 * F5 → memoria vacía + URL limpia → no re-dirige.
 */
export type DeepLinkIntent = {
  taskId?: string
  projectId?: string
  focusToken?: string
  tab?: string | null
  key: string
}

type FocusIntentStore = {
  intent: DeepLinkIntent | null
  capture: (intent: DeepLinkIntent) => void
  consumeTab: () => void
  consume: () => void
}

export const useFocusIntentStore = create<FocusIntentStore>(set => ({
  intent: null,
  capture: intent => set({ intent }),
  consumeTab: () =>
    set(state => {
      if (!state.intent) return state
      return { intent: { ...state.intent, tab: null } }
    }),
  consume: () => set({ intent: null }),
}))
