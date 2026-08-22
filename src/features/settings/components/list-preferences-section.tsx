"use client"

import { cn } from "@/shared/utils/utils"
import {
  useSortStore,
  type ProjectSortMode,
  type SortDirection,
  type TaskSortMode,
} from "@/shared/sorting/store/sort-store"

const TASK_MODES: { id: TaskSortMode; label: string; hint: string }[] = [
  { id: "priority", label: "Prioridad", hint: "Urgente → baja" },
  { id: "delivery", label: "Entrega", hint: "Fecha de entrega" },
  { id: "code", label: "Código", hint: "Código de proyecto" },
  { id: "sequence", label: "Secuencia", hint: "Orden de proceso" },
  { id: "manual", label: "Manual", hint: "Como lo arrastras" },
]

const PROJECT_MODES: { id: ProjectSortMode; label: string; hint: string }[] = [
  { id: "code", label: "Código", hint: "Código del proyecto" },
  { id: "delivery", label: "Entrega", hint: "Fecha de entrega" },
  { id: "sequence", label: "Secuencia", hint: "Orden de proceso" },
  { id: "manual", label: "Manual", hint: "Como lo arrastras" },
]

function ModeGrid<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T
  options: { id: T; label: string; hint: string }[]
  onChange: (v: T) => void
}) {
  return (
    <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
      {options.map(o => {
        const active = value === o.id
        return (
          <button
            key={o.id}
            type="button"
            onClick={() => onChange(o.id)}
            className={cn(
              "flex flex-col items-start gap-0.5 rounded-xl border px-3 py-2.5 text-left transition",
              active
                ? "border-primary/35 bg-primary/10 text-foreground"
                : "border-transparent bg-foreground/5 text-muted-foreground hover:bg-foreground/8 hover:text-foreground",
            )}
          >
            <span className="text-sm font-semibold leading-none">{o.label}</span>
            <span className="text-[10px] leading-tight opacity-80">{o.hint}</span>
          </button>
        )
      })}
    </div>
  )
}

function DirectionToggle({
  value,
  onChange,
  disabled,
}: {
  value: SortDirection
  onChange: (v: SortDirection) => void
  disabled?: boolean
}) {
  if (disabled) {
    return (
      <p className="text-[11px] text-muted-foreground">
        En modo manual el orden es el del arrastre.
      </p>
    )
  }
  return (
    <div className="inline-flex rounded-lg bg-muted/60 p-0.5">
      {(
        [
          { id: "asc" as const, label: "Ascendente" },
          { id: "desc" as const, label: "Descendente" },
        ] as const
      ).map(d => (
        <button
          key={d.id}
          type="button"
          onClick={() => onChange(d.id)}
          className={cn(
            "rounded-md px-3 py-1.5 text-xs font-semibold transition",
            value === d.id
              ? "bg-background text-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {d.label}
        </button>
      ))}
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
    <div className="flex w-full max-w-lg flex-col gap-6">
      <section className="flex flex-col gap-2.5">
        <div className="flex flex-col gap-0.5">
          <h3 className="text-sm font-semibold text-foreground">Tareas</h3>
          <p className="text-[11px] text-muted-foreground">
            Criterio al abrir la lista de tareas
          </p>
        </div>
        <ModeGrid
          value={taskSortMode}
          options={TASK_MODES}
          onChange={setTaskSortMode}
        />
        <DirectionToggle
          value={taskSortDirection}
          onChange={setTaskSortDirection}
          disabled={taskSortMode === "manual"}
        />
      </section>

      <section className="flex flex-col gap-2.5">
        <div className="flex flex-col gap-0.5">
          <h3 className="text-sm font-semibold text-foreground">Proyectos</h3>
          <p className="text-[11px] text-muted-foreground">
            Criterio al abrir la lista de proyectos
          </p>
        </div>
        <ModeGrid
          value={projectSortMode}
          options={PROJECT_MODES}
          onChange={setProjectSortMode}
        />
        <DirectionToggle
          value={projectSortDirection}
          onChange={setProjectSortDirection}
          disabled={projectSortMode === "manual"}
        />
      </section>
    </div>
  )
}
