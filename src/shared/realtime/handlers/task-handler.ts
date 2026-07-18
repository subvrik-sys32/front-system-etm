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

import{
  sidebarCountsQueryKey,
}from"@/shared/responsive/layout/hooks/use-sidebar-counts"

import type{
  RealtimeEvent,
}from"../types/realtime-event"

export function taskHandler(
  event:RealtimeEvent,
){

  const queryClient=
    getQueryClient()

  // Crear/borrar tareas cambia "activeTasksCount" y los contadores
  // por proceso del sidebar — invalidación liviana (COUNT), no
  // cuesta nada de más.
  queryClient.invalidateQueries({
    queryKey:sidebarCountsQueryKey,
  })

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

      // El payload ahora es liviano: solo {id,position}[] de las
      // tareas que en verdad cambiaron de posición — antes era el
      // array de tareas COMPLETO (con todos los includes pesados),
      // reemplazando la cache entera solo para actualizar un campo.
      // Acá se parchea nada más que "position" en las que matchean,
      // preservando el resto de cada tarea tal cual estaba.
      const reorderedItems=
        event.payload as{ id:string; position:number }[]

      queryClient.setQueryData<Task[]>(

        ["tasks"],

        current=>{

          if(!current){
            return current
          }

          const positionById=
            new Map(
              reorderedItems.map(item=>[item.id,item.position]),
            )

          return current
            .map(task=>{

              const nextPosition=
                positionById.get(task.id)

              return nextPosition===undefined
                ? task
                : { ...task, position:nextPosition }

            })
            .sort((a,b)=>a.position-b.position)

        },

      )

      return

    }

  }

}