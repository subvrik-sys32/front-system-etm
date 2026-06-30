import type {
  EntityIcon,
} from "@/shared/constants/entity-icons"

export type FilterModule =
  | "tasks"
  | "processes"
  | "projects"

export type FilterField =
  | "status"
  | "stage"
  | "priority"
  | "client"
  | "operator"
  | "pm"

export type FilterChip = {

  field: FilterField

  value: string

  label: string

  color: string

  icon?: EntityIcon

}

export type QuickFilter =
  | "pending"
  | "progress"
  | "completed"
  | "critical"
  | "today"
  | "week"
  | "overdue"
  | "unassigned"
  | "reviewed"
  | "no-pm"
  | "no-client"
  | "no-delivery"

export type FilterState = {

  filters: Record<
    FilterModule,
    FilterChip[]
  >

}

export type FilterOption = {

  value: string

  label: string

  color: string

  icon?: EntityIcon

}