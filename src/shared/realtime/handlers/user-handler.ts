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