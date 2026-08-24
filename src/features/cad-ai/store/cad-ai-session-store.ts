"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

import type { ChatMessage, PlanGeometry } from "../types"

type CadAiSessionState = {
  messages: ChatMessage[]
  geometry: PlanGeometry | null
  dxf: string
  setMessages: (
    updater: ChatMessage[] | ((prev: ChatMessage[]) => ChatMessage[]),
  ) => void
  setGeometry: (geometry: PlanGeometry | null) => void
  setDxf: (dxf: string) => void
  /** Limpia sesión (Reset / descartar). */
  reset: () => void
}

/**
 * Sesión CAD IA — sobrevive navegación y toggle IA↔Plantillas
 * (mismo criterio que draft de Nesting).
 */
export const useCadAiSessionStore = create<CadAiSessionState>()(
  persist(
    set => ({
      messages: [],
      geometry: null,
      dxf: "",
      setMessages: updater =>
        set(s => ({
          messages:
            typeof updater === "function" ? updater(s.messages) : updater,
        })),
      setGeometry: geometry => set({ geometry }),
      setDxf: dxf => set({ dxf }),
      reset: () => set({ messages: [], geometry: null, dxf: "" }),
    }),
    {
      name: "etm:cad-ai:session:v1",
      version: 1,
      partialize: s => ({
        messages: s.messages,
        geometry: s.geometry,
        dxf: s.dxf,
      }),
    },
  ),
)
