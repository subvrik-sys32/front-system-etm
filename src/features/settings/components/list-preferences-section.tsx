"use client"

import { cn } from "@/shared/utils/utils"
import {
  useSortStore,
  type ProjectSortMode,
  type SortDirection,
  type TaskSortMode,
} from "@/shared/sorting/store/sort-store"

const TASK_MODES: { id: TaskSortMode; label: string }[] = [
  { id: "priority", label: "Prioridad" },
  { id: "delivery", label: "Entrega" },
  { id: "code", label: "Código" },
  { id: "sequence", label: "Secuencia" },
  { id: "manual", label: "Manual" },
]

const PROJECT_MODES: { id: ProjectSortMode; label: string }[] = [
  { id: "code", label: "Código" },
  { id: "delivery", label: "Entrega" },
  { id: "sequence", label: "Secuencia" },
  { id: "manual", label: "Manual" },
]

const DIRS: { id: SortDirection; label: string }[] = [
  { id: "asc", label: "Asc" },
  { id: "desc", label: "Desc" },
]

function ChipRow<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T
  options: { id: T; label: string }[]
  onChange: (v: T) => void
}) {
  return (
    <div className="flex flex-wrap gap-1 rounded-xl bg-muted/60 p-1">
      {options.map(o => {
        const active = value === o.id
        return (
          <button
            key={o.id}
            type="button"
            onClick={() => onChange(o.id)}
            className={cn(
              "rounded-lg px-2.5 py-1.5 text-xs font-semibold transition",
              active
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

/** Orden por defecto de listas (mismo store que el toolbar). */
export function ListPreferencesSection() {
  const taskSortMode = useSortStore(s => s.taskSortMode)
  const projectSortMode = useSortStore(s => s.projectSortMode)
  const taskSortDirection = useSortStore(s => s.taskSortDirection)
  const projectSortDirection = useSortStore(s => s.projectSortDirection)
  const setTaskSortMode = useSortStore(s => s.setTaskSortMode)
  const setProjectSortMode = useSortStore(s => s.setProjectSortMode)
  const setTaskSortDirection = useSortStore(s => s.setTaskSortDirection)
  const setProjectSortDirection = useSortStore(s => s.setProjectSortDirection)

  return (
    <div className="flex w-full max-w-lg flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium text-muted-foreground">
          Orden de tareas
        </label>
        <ChipRow
          value={taskSortMode}
          options={TASK_MODES}
          onChange={setTaskSortMode}
        />
        {taskSortMode !== "manual" && (
          <ChipRow
            value={taskSortDirection}
            options={DIRS}
            onChange={setTaskSortDirection}
          />
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium text-muted-foreground">
          Orden de proyectos
        </label>
        <ChipRow
          value={projectSortMode}
          options={PROJECT_MODES}
          onChange={setProjectSortMode}
        />
        {projectSortMode !== "manual" && (
          <ChipRow
            value={projectSortDirection}
            options={DIRS}
            onChange={setProjectSortDirection}
          />
        )}
      </div>
    </div>
  )
}
