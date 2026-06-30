import type { Task } from "../types/task.types"
import type { TaskSortMode } from "../../../shared/sorting/store/sort-store"

const PRIORITY_ORDER={
  "priority-critical":0,
  "priority-high":1,
  "priority-medium":2,
  "priority-low":3,
} as const

export function sortTasks({
  tasks,
  mode,
}:{
  tasks:Task[]
  mode:TaskSortMode
}){

  const sorted=[...tasks]

  if(mode==="manual"){

    return sorted.sort(
      (a,b)=>
        a.position-b.position,
    )

  }

  if(mode==="sequence"){

    return sorted.sort(
      (a,b)=>
        a.taskNumber-b.taskNumber,
    )

  }

  if(mode==="priority"){

    return sorted.sort((a,b)=>{

      const priorityDiff=

        PRIORITY_ORDER[
          a.priority.id as keyof typeof PRIORITY_ORDER
        ]-

        PRIORITY_ORDER[
          b.priority.id as keyof typeof PRIORITY_ORDER
        ]

      if(priorityDiff!==0){
        return priorityDiff
      }

      const aDate=
        a.deliveryDate
          ?new Date(a.deliveryDate).getTime()
          :Number.MAX_SAFE_INTEGER

      const bDate=
        b.deliveryDate
          ?new Date(b.deliveryDate).getTime()
          :Number.MAX_SAFE_INTEGER

      if(aDate!==bDate){
        return aDate-bDate
      }

      return a.position-b.position

    })

  }

  return sorted.sort((a,b)=>{

    const aDate=
      a.deliveryDate
        ?new Date(a.deliveryDate).getTime()
        :Number.MAX_SAFE_INTEGER

    const bDate=
      b.deliveryDate
        ?new Date(b.deliveryDate).getTime()
        :Number.MAX_SAFE_INTEGER

    if(aDate!==bDate){
      return aDate-bDate
    }

    const priorityDiff=

      PRIORITY_ORDER[
        a.priority.id as keyof typeof PRIORITY_ORDER
      ]-

      PRIORITY_ORDER[
        b.priority.id as keyof typeof PRIORITY_ORDER
      ]

    if(priorityDiff!==0){
      return priorityDiff
    }

    return a.position-b.position

  })

}