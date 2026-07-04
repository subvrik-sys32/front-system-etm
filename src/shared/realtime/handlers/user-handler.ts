import type{
  User,
}from"@/features/users/types/user.types"

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

type PresencePayload={
  id:string
  online:boolean
}

function isPresenceOnlyPayload(
  payload:unknown,
):payload is PresencePayload{

  if(
    !payload ||
    typeof payload!=="object"
  ){
    return false
  }

  const keys=
    Object.keys(payload as object)

  return(
    keys.length===2 &&
    keys.includes("id") &&
    keys.includes("online")
  )

}

// Query keys que contienen listas de usuarios y deben
// reflejar el estado de presencia en tiempo real.
const USER_LIST_QUERY_KEYS=[
  ["users"],
  ["users","directory"],
] as const

export function userHandler(
  event:RealtimeEvent,
){

  const queryClient=
    getQueryClient()

  switch(event.action){

    case"CREATED":{

      cacheAddEntity<User>(

        queryClient,

        "users",

        "user",

        event.payload as User,

      )

      return

    }

    case"UPDATED":{

      // Evento de presencia: solo trae { id, online }.
      // Debe hacer merge parcial, sin reemplazar el resto del usuario,
      // y en TODAS las listas de usuarios cacheadas (findAll y directory).
      if(isPresenceOnlyPayload(event.payload)){

        const{
          id,
          online,
        }=
          event.payload as PresencePayload

        for(const queryKey of USER_LIST_QUERY_KEYS){

          queryClient.setQueryData<User[]>(

            queryKey as unknown as string[],

            current=>

              current?.map(user=>

                user.id===id

                  ?{
                      ...user,
                      online,
                    }

                  :user,

              ),

          )

        }

        queryClient.setQueryData<User>(

          [
            "user",
            id,
          ],

          current=>

            current

              ?{
                  ...current,
                  online,
                }

              :current,

        )

        return

      }

      // Evento normal: el payload trae el usuario completo.
      cacheReplaceEntity<User>(

        queryClient,

        "users",

        "user",

        event.payload as User,

      )

      return

    }

    case"DELETED":{

      cacheRemoveEntity<User>(

        queryClient,

        "users",

        "user",

        event.id,

      )

      return

    }

  }

}