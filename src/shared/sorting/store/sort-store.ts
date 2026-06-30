"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

export type TaskSortMode=
  | "priority"
  | "delivery"
  | "sequence"
  | "manual"

export type ProjectSortMode=
  | "delivery"
  | "sequence"
  | "manual"

type SortStore={

  taskSortMode:TaskSortMode

  projectSortMode:ProjectSortMode

  setTaskSortMode:(
    mode:TaskSortMode
  )=>void

  setProjectSortMode:(
    mode:ProjectSortMode
  )=>void

}

export const useSortStore=
  create<SortStore>()(

    persist(

      set=>({

        taskSortMode:
          "priority",

        projectSortMode:
          "sequence",

        setTaskSortMode:
          taskSortMode=>

            set({
              taskSortMode,
            }),

        setProjectSortMode:
          projectSortMode=>

            set({
              projectSortMode,
            }),

      }),

      {
        name:
          "prod-erp-sort",
      }

    )

  )