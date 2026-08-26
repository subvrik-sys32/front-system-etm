"use client"

import { create } from "zustand"

export type WorkflowFieldKey = "piecesOutput" | "plRtReal" | "paintKgReal"

type Entry = {
  fields: WorkflowFieldKey[]
  at: number
}

type WorkflowFieldErrorsStore = {
  byStep: Record<string, Entry>
  flash: (stepId: string, fields: WorkflowFieldKey[]) => void
  clear: (stepId: string, field?: WorkflowFieldKey) => void
  has: (stepId: string, field: WorkflowFieldKey) => boolean
}

export const useWorkflowFieldErrorsStore = create<WorkflowFieldErrorsStore>(
  (set, get) => ({
    byStep: {},

    flash(stepId, fields) {
      if (!stepId || fields.length === 0) return
      set(state => ({
        byStep: {
          ...state.byStep,
          [stepId]: { fields: [...fields], at: Date.now() },
        },
      }))
      window.setTimeout(() => {
        const current = get().byStep[stepId]
        if (!current) return
        if (current.at && Date.now() - current.at >= 3900) {
          get().clear(stepId)
        }
      }, 4000)
    },

    clear(stepId, field) {
      set(state => {
        const entry = state.byStep[stepId]
        if (!entry) return state

        if (!field) {
          const { [stepId]: _, ...rest } = state.byStep
          return { byStep: rest }
        }

        const nextFields = entry.fields.filter(f => f !== field)
        if (nextFields.length === 0) {
          const { [stepId]: _, ...rest } = state.byStep
          return { byStep: rest }
        }

        return {
          byStep: {
            ...state.byStep,
            [stepId]: { ...entry, fields: nextFields },
          },
        }
      })
    },

    has(stepId, field) {
      return get().byStep[stepId]?.fields.includes(field) ?? false
    },
  }),
)
