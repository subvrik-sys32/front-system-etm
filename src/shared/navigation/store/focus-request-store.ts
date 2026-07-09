"use client"

import { create } from "zustand"

export type FocusEntity =
  | "task"
  | "process"

export type FocusRequest = {
  entity: FocusEntity
  id: string
  token: number
}

type FocusRequestStore = {

  request: FocusRequest | null

  requestFocus: (
    entity: FocusEntity,
    id: string,
  ) => void

  clearFocus: () => void

}

export const useFocusRequestStore =
  create<FocusRequestStore>()(
    set => ({

      request: null,

      requestFocus: (
        entity,
        id,
      ) =>

        set({

          request: {

            entity,
            id,
            token: Date.now(),

          },

        }),

      clearFocus: () =>

        set({

          request: null,

        }),

    }),
  )