import type {
  Project,
} from "../types/project.types"

import type {
  ProjectSortMode,
} from "@/shared/sorting/store/sort-store"

export function sortProjects({
  projects,
  mode,
}:{
  projects:Project[]
  mode:ProjectSortMode
}){

  const sorted=[
    ...projects,
  ]

  if(mode==="manual"){

    return sorted.sort(
      (a,b)=>
        a.position-b.position
    )

  }

  if(mode==="sequence"){

    return sorted.sort(
      (a,b)=>
        a.sequence-b.sequence
    )

  }

  return sorted.sort(
    (a,b)=>{

      const aDate=
        a.deliveryDate
          ? new Date(
              a.deliveryDate
            ).getTime()
          : Number.MAX_SAFE_INTEGER

      const bDate=
        b.deliveryDate
          ? new Date(
              b.deliveryDate
            ).getTime()
          : Number.MAX_SAFE_INTEGER

      if(aDate!==bDate){
        return aDate-bDate
      }

      return a.sequence-b.sequence

    }
  )

}