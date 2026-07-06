export function formatCommentDate(dateInput:string){

  const date=new Date(dateInput)
  const now=new Date()
  const diffMs=now.getTime()-date.getTime()
  const diffMin=Math.floor(diffMs/60000)
  const diffHours=Math.floor(diffMin/60)

  if(diffMin<1)return"Ahora"
  if(diffMin<60)return`Hace ${diffMin} min`
  if(diffHours<24)return`Hace ${diffHours} ${diffHours===1?"hora":"horas"}`

  const isYesterday=
    date.getDate()===now.getDate()-1&&
    date.getMonth()===now.getMonth()&&
    date.getFullYear()===now.getFullYear()

  if(isYesterday)return"Ayer"

  return date.toLocaleDateString("es-AR",{
    day:"numeric",
    month:"short",
  })

}