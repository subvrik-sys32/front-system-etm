"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

import type {
  FilterChip,
  FilterModule,
} from "../types/filter.types"

type FilterStore={

  filters:Record<
    FilterModule,
    FilterChip[]
  >

  addFilter:(
    module:FilterModule,
    filter:FilterChip
  )=>void

  updateFilter:(
    module:FilterModule,
    previous:FilterChip,
    next:FilterChip
  )=>void

  removeFilter:(
    module:FilterModule,
    filter:FilterChip
  )=>void

  clearFilters:(
    module:FilterModule
  )=>void

}

export const useFilterStore=
  create<FilterStore>()(

    persist(

      (set)=>({

        filters:{

          tasks:[],

          processes:[],

          projects:[],

        },

        addFilter:(
          module,
          filter
        )=>

          set(state=>{

            const exists=
              state.filters[
                module
              ].some(
                current=>

                  current.field===
                    filter.field &&

                  current.value===
                    filter.value
              )

            if(exists){
              return state
            }

            return{

              filters:{

                ...state.filters,

                [module]:[

                  ...state.filters[
                    module
                  ],

                  filter,

                ],

              },

            }

          }),

        updateFilter:(
          module,
          previous,
          next
        )=>

          set(state=>({

            filters:{

              ...state.filters,

              [module]:

                state.filters[
                  module
                ].map(
                  current=>

                    current.field===
                      previous.field &&

                    current.value===
                      previous.value

                      ? next

                      : current
                ),

            },

          })),

        removeFilter:(
          module,
          filter
        )=>

          set(state=>({

            filters:{

              ...state.filters,

              [module]:

                state.filters[
                  module
                ].filter(
                  current=>

                    !(

                      current.field===
                        filter.field &&

                      current.value===
                        filter.value

                    )
                ),

            },

          })),

        clearFilters:
          module=>

            set(state=>({

              filters:{

                ...state.filters,

                [module]:[],

              },

            })),

      }),

      {
        name:
          "prod-erp-filters",
      }

    )

  )