export function addEntity<
  T extends{
    position:number
  },
>(
  items:T[],
  created:T,
){

  return[

    ...items,

    created,

  ].sort(
    (a,b)=>
      a.position-b.position,
  )

}