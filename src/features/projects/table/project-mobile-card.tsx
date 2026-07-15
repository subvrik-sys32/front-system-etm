"use client"

import { ChevronDown } from "lucide-react"

import { cn } from "@/shared/utils/utils"
import { formatDate } from "@/shared/utils/date-format"

import type { Project } from "../types/project.types"
import type { Task } from "@/features/tasks/types/task.types"

import { ProjectClientCell } from "../components/cells/project-client-cell"
import { ProjectStageCell } from "../components/cells/project-stage-cell"
import { ProjectStatusCell } from "../components/cells/project-status-cell"
import { ProjectPmCell } from "../components/cells/project-pm-cell"
import { ProjectRowActions } from "../components/actions/project-row-actions"
import { ProjectExpandedRow } from "../components/expanded-row/project-expanded-row"

type Props = {
  project: Project
  tasks: Task[]
  expanded: boolean
  onToggle: () => void
}

// Equivalente mobile de una fila de EntityTable + su expand-row,
// pero como tarjeta apilada en vez de columnas — mismo patrón que
// TaskPipelineCard para tareas. Reutiliza las mismas celdas
// editables (EntitySelect/UserSelect) y el mismo ProjectExpandedRow
// que ya existen para desktop, sin duplicar lógica de negocio.
export function ProjectMobileCard({
  project,
  tasks,
  expanded,
  onToggle,
}: Props) {

  return (

    <div className="overflow-hidden rounded-xl bg-white/2">

      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-2.5 px-3 py-3 text-left"
      >

        <span className="shrink-0 rounded-md bg-white/8 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-white/50">
          {String(project.sequence).padStart(3, "0")}
        </span>

        <div className="min-w-0 flex-1">

          <p className="truncate text-sm font-semibold text-white">
            {project.name}
          </p>

          <p className="mt-0.5 truncate text-xs text-neutral-500">
            {project.projectCode}
          </p>

        </div>

        <span className="shrink-0 text-xs text-neutral-500">
          {formatDate(project.deliveryDate)}
        </span>

        <ChevronDown
          size={16}
          className={cn(
            "shrink-0 text-neutral-500 transition-transform duration-200",
            expanded && "rotate-180",
          )}
        />

      </button>

      {expanded && (

        <div className="space-y-3 border-t border-white/5 px-3 pb-3 pt-3">

          {/*
            Columna única a propósito: los triggers de EntitySelect/
            UserSelect no están garantizados a encogerse bien en una
            grilla de 2 columnas angosta (mismo tipo de desborde que
            ya vimos con DynamicBadge en otros lugares) — una sola
            columna es la opción segura por ahora.
          */}
          <div className="flex flex-col gap-2">

            <ProjectClientCell project={project} triggerVariant="row" rowLabel="Cliente" />

            <ProjectStageCell project={project} triggerVariant="row" rowLabel="Etapa" />

            <ProjectStatusCell project={project} triggerVariant="row" rowLabel="Estado" />

            <ProjectPmCell project={project} triggerVariant="row" rowLabel="PM" />

          </div>

          <div className="flex justify-end">

            <ProjectRowActions project={project} />

          </div>

          <ProjectExpandedRow project={project} tasks={tasks} />

        </div>

      )}

    </div>

  )

}