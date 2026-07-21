export type DayShift =
  | "MORNING_1"
  | "MORNING_2"
  | "LUNCH"
  | "AFTERNOON_1"
  | "AFTERNOON_2"
  | "NIGHT"

export interface ActivityType {
  id: string
  code: string
  label: string
  icon: string
  color: string
  order: number
  active: boolean
}

export interface ActivityLogProjectRef {
  id: string
  name: string
  projectCode: string
}

export interface ActivityLogTaskRef {
  id: string
  taskNumber: number
  reference: string
}

export interface ActivityLogUserRef {
  id: string
  name: string
  color: string
  icon: string
}

export interface ActivityLog {
  id: string
  userId: string
  activityTypeId: string
  projectId: string | null
  taskId: string | null
  note: string | null
  shift: DayShift
  loggedAt: string
  activityType: ActivityType
  project: ActivityLogProjectRef | null
  task: ActivityLogTaskRef | null
  // Solo viene poblado en la vista de supervisión del equipo
  // (getAll) — los demás endpoints ya están scoped al usuario actual.
  user?: ActivityLogUserRef
}

export interface CreateActivityLogDto {
  activityTypeId: string
  projectId?: string
  taskId?: string
  note?: string
}

export interface CreateActivityTypeDto {
  label: string
  icon: string
  color: string
  order?: number
}

export interface UpdateActivityTypeDto {
  label?: string
  icon?: string
  color?: string
  order?: number
  active?: boolean
}