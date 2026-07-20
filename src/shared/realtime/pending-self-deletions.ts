// Cuando el propio usuario borra una notificación desde la UI
// (use-delete-notification.ts), el backend le hace eco del mismo
// evento NOTIFICATION/DELETED por SSE a ese mismo usuario (ver
// NotificationsService.remove en el backend). Sin este registro, el
// handler de realtime no tiene forma de distinguir:
//
//   a) "esto lo borró el sistema en otro lado (se eliminó el
//      comentario) y es la primera vez que me entero" → hay que
//      descontar el contador acá.
//
//   b) "esto ya lo desconté yo mismo hace un instante al hacer clic
//      en borrar, este evento es solo el rebote del propio backend"
//      → NO hay que descontar de nuevo.
//
// Un Set en memoria alcanza: la ventana entre la acción local y la
// llegada del eco es de milisegundos, y consumePendingSelfDeletion
// borra la marca apenas la usa, así que no crece indefinidamente.
const pendingIds = new Set<string>()

export function markPendingSelfDeletion(id: string) {
  pendingIds.add(id)
}

// Devuelve true si el id estaba marcado (y lo limpia). Se usa una
// sola vez por evento: si el eco tarda más de la cuenta y el usuario
// alcanza a borrar la MISMA notificación de nuevo antes de que llegue,
// no hay riesgo real porque el backend ya la eliminó la primera vez
// (segunda petición no encontraría filas y no dispararía otro evento).
export function consumePendingSelfDeletion(id: string): boolean {
  if (pendingIds.has(id)) {
    pendingIds.delete(id)
    return true
  }
  return false
}