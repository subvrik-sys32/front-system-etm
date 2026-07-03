import type{
  Task,
}from"@/features/tasks/types/task.types"

import{
  getQueryClient,
}from"@/lib/query-client"

import{
  cacheAddEntity,
  cacheReplaceEntity,
  cacheRemoveEntity,
}from"@/shared/core/entity/cache/entity-cache"

import type{
  RealtimeEvent,
}from"../types/realtime-event"

export function taskHandler(
  event:RealtimeEvent,
){

  const queryClient=
    getQueryClient()

  switch(event.action){

    case"CREATED":{

      cacheAddEntity<Task>(

        queryClient,

        "tasks",

        "task",

        event.payload as Task,

        (a,b)=>
          a.position-b.position,

      )

      return

    }

    case"UPDATED":{

      cacheReplaceEntity<Task>(

        queryClient,

        "tasks",

        "task",

        event.payload as Task,

      )

      return

    }

    case"DELETED":{

      const payload=

        event.payload as

          |{

              cascade:true

              projectId:string

            }

          |undefined

      if(payload?.cascade){

        queryClient.setQueryData<Task[]>(

          ["tasks"],

          current=>

            (current??[]).filter(

              task=>

                task.project.id!==payload.projectId,

            ),

        )

        return

      }

      cacheRemoveEntity<Task>(

        queryClient,

        "tasks",

        "task",

        event.id,

      )

      return

    }

    case"REORDERED":{

      queryClient.setQueryData<Task[]>(

        ["tasks"],

        event.payload as Task[],

      )

      return

    }

  }

}