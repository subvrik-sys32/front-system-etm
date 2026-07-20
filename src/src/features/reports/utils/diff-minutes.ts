export function diffMinutes(
  start:string|null,
  end:string|null,
):number|null{

  if(!start||!end){

    return null

  }

  const ms=
    new Date(end).getTime()-
    new Date(start).getTime()

  if(
    Number.isNaN(ms)||
    ms<0
  ){

    return null

  }

  return Math.round(
    ms/60000,
  )

}