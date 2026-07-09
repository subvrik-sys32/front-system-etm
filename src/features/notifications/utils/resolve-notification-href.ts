import type { Notification } from "../types/notification.types"

export function resolveNotificationHref(notification: Notification) {

  // Token de solicitud de foco: identifica ESTA navegación en particular,
  // no la tarea/proceso destino. Se genera en cada clic para que dos
  // notificaciones sobre la misma entidad (o dos clics repetidos sobre la
  // misma notificación) produzcan navegaciones distintas, y el flujo de
  // scroll/expand/historial se re-ejecute siempre.
  const focus = crypto.randomUUID()

  if (notification.workflowStep) {

    const code = notification.workflowStep.processCode.toLowerCase()

    return `/processes?code=${code}&taskId=${notification.taskId}&focus=${focus}`

  }

  return `/tasks?taskId=${notification.taskId}&focus=${focus}`

}