import type { Notification } from "../types/notification.types"

export function resolveNotificationHref(
  notification: Notification,
  opts?: { history?: boolean },
) {

  const focus = crypto.randomUUID()
  const historyParam = opts?.history ? "&history=1" : ""

  if (notification.workflowStep) {
    const code = notification.workflowStep.processCode.toLowerCase()
    return `/processes?code=${code}&taskId=${notification.taskId}&focus=${focus}${historyParam}`
  }

  return `/tasks?taskId=${notification.taskId}&focus=${focus}${historyParam}`

}