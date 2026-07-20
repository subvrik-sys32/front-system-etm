import{
  QueryClient,
}from"@tanstack/react-query"

import{
  replaceEntity,
}from"./replace-entity"

import{
  removeEntity,
}from"./remove-entity"

type Entity={
  id:string
}

export function cacheAddEntity<
  T extends Entity,
>(
  queryClient:QueryClient,
  listKey:string,
  entityKey:string,
  entity:T,
  sort?:(a:T,b:T)=>number,
){

  queryClient.setQueryData<T[]>(

    [listKey],

    current=>{

      const items=current??[]

      const exists=
        items.some(
          item=>item.id===entity.id,
        )

      const next=exists

        ?items.map(
            item=>
              item.id===entity.id
                ?entity
                :item,
          )

        :[
            ...items,
            entity,
          ]

      return sort
        ?next.sort(sort)
        :next

    },

  )

  queryClient.setQueryData<T>(

    [
      entityKey,
      entity.id,
    ],

    entity,

  )

}

export function cacheReplaceEntity<
  T extends Entity,
>(
  queryClient:QueryClient,
  listKey:string,
  entityKey:string,
  entity:T,
){

  queryClient.setQueryData<T[]>(

    [listKey],

    current=>

      replaceEntity(

        current??[],

        entity,

      ),

  )

  queryClient.setQueryData<T>(

    [

      entityKey,

      entity.id,

    ],

    entity,

  )

}

export function cacheRemoveEntity<
  T extends Entity,
>(
  queryClient:QueryClient,
  listKey:string,
  entityKey:string,
  id:string,
){

  queryClient.setQueryData<T[]>(

    [listKey],

    current=>

      removeEntity(

        current??[],

        id,

      ),

  )

  queryClient.removeQueries({

    queryKey:[

      entityKey,

      id,

    ],

  })

}