import type { Task } from "@/features/tasks/types/task.types"
import type { Project } from "@/features/projects/types/project.types"
import type { TaskSortMode, ProjectSortMode } from "@/shared/sorting/store/sort-store"

const PRIORITY_ORDER = {
  URGENTE: 0,
  ALTA: 1,
  MEDIA: 2,
  BAJA: 3,
} as const

type TaskViewParams = {
  base: Task[]
  mode: TaskSortMode
}

export function createTaskView({
  base,
  mode,
}: TaskViewParams): Task[] {

  if (mode === "manual") return base

  const view = [...base]

  if (mode === "delivery") {
    return view.sort((a, b) => toTime(a.deliveryDate) - toTime(b.deliveryDate))
  }

  if (mode === "sequence") {
    return view.sort((a, b) => a.project.sequence - b.project.sequence)
  }

  // priority
  return view.sort((a, b) => {
    const aPriority = PRIORITY_ORDER[a.priority.code as keyof typeof PRIORITY_ORDER] ?? 99
    const bPriority = PRIORITY_ORDER[b.priority.code as keyof typeof PRIORITY_ORDER] ?? 99

    const diff = aPriority - bPriority
    if (diff !== 0) return diff

    return toTime(a.deliveryDate) - toTime(b.deliveryDate)
  })

}

type ProjectViewParams = {
  base: Project[]
  mode: ProjectSortMode
}

export function createProjectView({
  base,
  mode,
}: ProjectViewParams): Project[] {

  if (mode === "manual") return base

  const view = [...base]

  if (mode === "delivery") {
    return view.sort((a, b) => toTime(a.deliveryDate) - toTime(b.deliveryDate))
  }

  // sequence
  return view.sort((a, b) => a.sequence - b.sequence)

}

function toTime(date?: string | null) {
  return date ? new Date(date).getTime() : Number.MAX_SAFE_INTEGER
}