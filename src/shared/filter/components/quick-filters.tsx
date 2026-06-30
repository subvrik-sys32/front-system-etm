"use client"

import type {
  QuickFilter,
} from "../types/filter.types"

type Props={
  onSelect:(
    filter:QuickFilter
  )=>void
}

const filters:{
  key:QuickFilter
  label:string
}[]=[
  {
    key:"pending",
    label:"Pendientes",
  },
  {
    key:"progress",
    label:"En proceso",
  },
  {
    key:"completed",
    label:"Completadas",
  },
  {
    key:"critical",
    label:"Urgentes",
  },
  {
    key:"today",
    label:"Vence hoy",
  },
  {
    key:"week",
    label:"Esta semana",
  },
  {
    key:"overdue",
    label:"Atrasadas",
  },
  {
    key:"unassigned",
    label:"Sin operario",
  },
]

export function QuickFilters({
  onSelect,
}:Props){

  return(

    <div className="flex flex-wrap gap-2">

      {filters.map(
        filter=>(

          <button
            key={filter.key}
            type="button"
            onClick={()=>
                
              onSelect(
                filter.key
              )
            }
            className="h-8 rounded-full bg-white/5 px-3 text-xs font-semibold uppercase tracking-[0.08em] text-white transition-colors hover:bg-white/10"
          >

            {filter.label}

          </button>

        )
      )}

    </div>

  )

}