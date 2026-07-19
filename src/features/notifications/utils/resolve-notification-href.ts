import type { Notification } from "../types/notification.types"

export function resolveNotificationHref(
  notification: Notification,
  opts?: { history?: boolean },
) {

  const focus = crypto.randomUUID()

  const history =
    opts?.history ??
    notification.route.history

  const historyParam =
    history
      ? "&history=1"
      : ""

  if (notification.route.module === "processes") {

    return `/processes?code=${notification.route.processCode?.toLowerCase()}&taskId=${notification.taskId}&focus=${focus}${historyParam}`

  }

  if (notification.route.module === "projects") {

    return `/projects?projectId=${notification.projectId}&focus=${focus}${historyParam}`

  }

  return `/tasks?taskId=${notification.taskId}&focus=${focus}${historyParam}`

}