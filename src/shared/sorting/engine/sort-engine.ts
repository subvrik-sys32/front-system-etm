import type { Task } from "@/features/tasks/types/task.types"
import type { Project } from "@/features/projects/types/project.types"
import type { WorkflowStatus } from "@/features/workflow/types/workflow.types"
import type {
  TaskSortMode,
  ProjectSortMode,
  SortDirection,
} from "@/shared/sorting/store/sort-store"

const PRIORITY_ORDER = {
  URGENTE: 0,
  ALTA: 1,
  MEDIA: 2,
  BAJA: 3,
} as const

type OperationalRank = 0 | 1 | 2 | 3

/**
 * Disponibilidad operativa:
 *
 * 0 READY   -> PENDING: el proceso ya está disponible en el área.
 * 1 ACTIVE  -> PROGRESS/PAUSED: el proceso ya está siendo trabajado.
 * 2 WAITING -> QUEUE: todavía espera entrar al área.
 * 3 DONE    -> REVIEWED/terminado.
 *
 * Esta condición siempre tiene prioridad sobre prioridad/asignación.
 */
export function getWorkflowOperationalRank(
  status: WorkflowStatus | null | undefined,
): OperationalRank {
  if (status === "PENDING") return 0
  if (status === "PROGRESS" || status === "PAUSED") return 1
  if (status === "QUEUE") return 2
  return 3
}

export function getTaskOperationalRank(task: Task): OperationalRank {
  if (!task.workflowSteps?.length) return 3

  const currentStep = [...task.workflowSteps]
    .sort((a, b) => a.order - b.order)
    .find(
      step =>
        step.status !== "COMPLETED" &&
        step.status !== "REVIEWED",
    )

  return getWorkflowOperationalRank(currentStep?.status)
}

function getTaskAssignmentRank(
  task: Task,
  operationalRank: OperationalRank,
): 0 | 1 {
  if (operationalRank >= 3) return 1

  const currentStep = [...(task.workflowSteps ?? [])]
    .sort((a, b) => a.order - b.order)
    .find(
      step =>
        step.status !== "COMPLETED" &&
        step.status !== "REVIEWED",
    )

  return currentStep?.operatorId ? 0 : 1
}

function compareTaskPriority(
  taskA: Task,
  taskB: Task,
  operationalRankA: OperationalRank,
  operationalRankB: OperationalRank,
): number {
  const operationalDiff = operationalRankA - operationalRankB

  if (operationalDiff !== 0) {
    return operationalDiff
  }

  /**
   * IMPORTANTE:
   * Asignación NO va antes de prioridad.
   *
   * Así una tarea URGENTE sin asignar sigue por delante de una tarea
   * BAJA asignada. Los asignados solo se agrupan por delante dentro
   * de la misma prioridad y disponibilidad operativa.
   */
  const priorityA =
    PRIORITY_ORDER[
      taskA.priority.code as keyof typeof PRIORITY_ORDER
    ] ?? 99

  const priorityB =
    PRIORITY_ORDER[
      taskB.priority.code as keyof typeof PRIORITY_ORDER
    ] ?? 99

  const priorityDiff = priorityA - priorityB

  if (priorityDiff !== 0) {
    return priorityDiff
  }

  const assignmentA = getTaskAssignmentRank(
    taskA,
    operationalRankA,
  )

  const assignmentB = getTaskAssignmentRank(
    taskB,
    operationalRankB,
  )

  const assignmentDiff = assignmentA - assignmentB

  if (assignmentDiff !== 0) {
    return assignmentDiff
  }

  const deliveryDiff =
    toTime(taskA.deliveryDate) -
    toTime(taskB.deliveryDate)

  if (deliveryDiff !== 0) {
    return deliveryDiff
  }

  return taskA.position - taskB.position
}

type TaskViewParams<T> = {
  base: T[]
  mode: TaskSortMode
  direction?: SortDirection
  getTask?: (item: T) => Task
  /**
   * Vista contextual, por ejemplo Procesos:
   * permite usar el workflowStep que pertenece al row actual.
   */
  getOperationalRank?: (
    item: T,
    task: Task,
  ) => OperationalRank
}

export function createTaskView<T extends Task>(params: {
  base: T[]
  mode: TaskSortMode
  direction?: SortDirection
}): T[]

export function createTaskView<T>(params: {
  base: T[]
  mode: TaskSortMode
  direction?: SortDirection
  getTask: (item: T) => Task
  getOperationalRank?: (
    item: T,
    task: Task,
  ) => OperationalRank
}): T[]

export function createTaskView<T>({
  base,
  mode,
  direction = "asc",
  getTask,
  getOperationalRank: getContextualRank,
}: TaskViewParams<T>): T[] {
  if (mode === "manual") return base

  const extract =
    getTask ??
    ((item: T) => item as unknown as Task)

  const dir = direction === "desc" ? -1 : 1
  const view = [...base]

  if (mode === "delivery") {
    return view.sort(
      (a, b) =>
        dir *
        (
          toTime(extract(a).deliveryDate) -
          toTime(extract(b).deliveryDate)
        ),
    )
  }

  if (mode === "sequence") {
    return view.sort(
      (a, b) =>
        dir *
        (
          extract(a).taskNumber -
          extract(b).taskNumber
        ),
    )
  }

  if (mode === "code") {
    return view.sort(
      (a, b) =>
        dir *
        compareProjectCode(
          extract(a).project.projectCode,
          extract(b).project.projectCode,
        ),
    )
  }

  return view.sort((a, b) => {
    const taskA = extract(a)
    const taskB = extract(b)

    const operationalA =
      getContextualRank?.(a, taskA) ??
      getTaskOperationalRank(taskA)

    const operationalB =
      getContextualRank?.(b, taskB) ??
      getTaskOperationalRank(taskB)

    const priorityDiff = compareTaskPriority(
      taskA,
      taskB,
      operationalA,
      operationalB,
    )

    return dir * priorityDiff
  })
}

type ProjectViewParams = {
  base: Project[]
  mode: ProjectSortMode
  direction?: SortDirection
}

export function createProjectView({
  base,
  mode,
  direction = "asc",
}: ProjectViewParams): Project[] {
  if (mode === "manual") return base

  const dir = direction === "desc" ? -1 : 1
  const view = [...base]

  if (mode === "delivery") {
    return view.sort(
      (a, b) =>
        dir *
        (
          toTime(a.deliveryDate) -
          toTime(b.deliveryDate)
        ),
    )
  }

  if (mode === "code") {
    return view.sort(
      (a, b) =>
        dir *
        compareProjectCode(
          a.projectCode,
          b.projectCode,
        ),
    )
  }

  return view.sort(
    (a, b) =>
      dir *
      (a.sequence - b.sequence),
  )
}

function parseProjectCode(code: string) {
  const match =
    code.match(/^(\d{2})-(\d{3})-(?:M|E|EM)$/)

  if (!match) {
    return {
      year: 0,
      num: 0,
    }
  }

  return {
    year: parseInt(match[1], 10),
    num: parseInt(match[2], 10),
  }
}

function compareProjectCode(
  a: string,
  b: string,
) {
  const pa = parseProjectCode(a)
  const pb = parseProjectCode(b)

  if (pa.year !== pb.year) {
    return pa.year - pb.year
  }

  return pa.num - pb.num
}

function toTime(
  date?: string | null,
) {
  return date
    ? new Date(date).getTime()
    : Number.MAX_SAFE_INTEGER
}
