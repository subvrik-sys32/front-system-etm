export function replaceNestedEntity<
  T,
  N extends{ id:string },
>(
  items:T[],
  getNested:(item:T)=>N[],
  setNested:(item:T,nested:N[])=>T,
  updated:Partial<N>&{ id:string },
){

  return items.map(item=>{

    const nested=
      getNested(item)

    let changed=
      false

    const nextNested=
      nested.map(entity=>{

        if(entity.id!==updated.id){

          return entity

        }

        changed=
          true

        return{
          ...entity,
          ...updated,
        }

      })

    if(!changed){

      return item

    }

    return setNested(
      item,
      nextNested,
    )

  })

}