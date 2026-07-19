export function formatCommentDate(dateInput:string){

  const date=new Date(dateInput)
  const now=new Date()
  const diffMs=now.getTime()-date.getTime()
  const diffMin=Math.floor(diffMs/60000)
  const diffHours=Math.floor(diffMin/60)

  if(diffMin<1)return"Ahora"
  if(diffMin<60)return`Hace ${diffMin} min`
  if(diffHours<24)return`Hace ${diffHours} ${diffHours===1?"hora":"horas"}`

  // Comparamos por medianoche local en vez de restar getDate() directo:
  // "now.getDate()-1" se rompe el primer día de cada mes (da 0, que
  // nunca matchea ningún día real), así que un comentario de ayer, si
  // ayer fue el último día del mes anterior, terminaba mostrando la
  // fecha completa en vez de "Ayer".
  const startOfToday=new Date(now.getFullYear(),now.getMonth(),now.getDate())
  const startOfDate=new Date(date.getFullYear(),date.getMonth(),date.getDate())
  const dayDiff=Math.round((startOfToday.getTime()-startOfDate.getTime())/86400000)

  if(dayDiff===1)return"Ayer"

  return date.toLocaleDateString("es-AR",{
    day:"numeric",
    month:"short",
  })

}