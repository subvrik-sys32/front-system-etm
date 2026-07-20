export function formatNotificationDate(dateInput:string){

  const date=new Date(dateInput)
  const now=new Date()
  const diffMin=Math.floor((now.getTime()-date.getTime())/60000)
  const diffHours=Math.floor(diffMin/60)

  if(diffMin<1)return"Ahora"
  if(diffMin<60)return`${diffMin} min`
  if(diffHours<24)return`${diffHours}h`

  return date.toLocaleDateString("es-AR",{ day:"numeric", month:"short" })

}