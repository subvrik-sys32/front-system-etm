"use client"

import {
  useEffect,
  useMemo,
} from "react"

import type { Project } from "../types/project.types"
import type { Task } from "@/features/tasks/types/task.types"

import { useFocusedRow } from "@/shared/hooks/use-focused-row"

import { useEntityExpand } from "@/shared/ui/entity-table/features/expansion"
import { useRowDragReorder } from "@/shared/dnd/use-row-drag-reorder"

import { EntityTable } from "@/shared/ui/entity-table"
import { EntityTableSkeleton } from "@/shared/ui/entity-table"

import { buildProjectColumns } from "./build-project-columns"
import { ProjectExpandedRow } from "../components/expanded-row/project-expanded-row"

import { useProjectSearch } from "../hooks/use-project-search"

import { useFilterStore } from "@/shared/filter/store/filter-store"
import { filterProjects } from "@/shared/filter/selectors/filter-projects"

import { isProjectCompleted } from "../selectors/is-project-completed"

import { useSortStore } from "@/shared/sorting/store/sort-store"
import { createProjectView } from "@/shared/sorting/engine/sort-engine"

type Props = {
  projects: Project[]
  tasks: Task[]
  loading: boolean
  focusedProjectId?: string
  focusToken?: string
  search: string
  showHistory: boolean
  reorderProjects: (projects: Project[]) => Promise<unknown>
}

// Vista TABLA: misma fuente de datos, filtros y orden que la vista
// CARD (project-table.tsx) — la única diferencia real es la fila
// que se renderiza (EntityTable + buildProjectColumns, genérica por
// columnas, en vez de ProjectMobileCard). Mismo patrón que ya usa
// ProcessTable / TaskTableTabla.
export function ProjectTableTabla({
  projects,
  tasks,
  loading,
  focusedProjectId,
  focusToken,
  search,
  showHistory,
  reorderProjects,
}: Props) {

  const expand = useEntityExpand()

  const projectSortMode = useSortStore(
    s => s.projectSortMode,
  )

  const isManualMode = projectSortMode === "manual"

  useFocusedRow({
    focusedId: focusedProjectId,
    setExpandedRowId: expand.setExpandedRowId,
    focusToken,
  })

  const filteredProjects = useProjectSearch(projects, search)

  const filters = useFilterStore(
    s => s.filters.projects,
  )

  const visibleProjects = filterProjects({
    projects: filteredProjects,
    filters,
  })

  const sortedProjects = useMemo(
    () => createProjectView({
      base: visibleProjects,
      mode: projectSortMode,
    }),
    [visibleProjects, projectSortMode],
  )

  const completed = sortedProjects.filter(
    p => isProjectCompleted(p),
  )

  const active = sortedProjects.filter(
    p => !isProjectCompleted(p),
  )

  const displayedProjects = showHistory
    ? [...completed, ...active]
    : active

  useEffect(() => {

    if (!expand.expandedRowId) {
      return
    }

    const exists = displayedProjects.some(
      project => project.id === expand.expandedRowId,
    )

    if (!exists) {
      expand.setExpandedRowId(null)
    }

  }, [
    displayedProjects,
    expand.expandedRowId,
    expand.setExpandedRowId,
  ])

  const dragApi = useRowDragReorder({
    items: displayedProjects,
    getId: p => p.id,
    disabled: !isManualMode,
    isRowDisabled: project => expand.expandedRowId === project.id,
    onReorder: next => {
      reorderProjects(next)
    },
    renderDragLabel: project => (
      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="rounded-md bg-white/8 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-white/50">
            {String(project.sequence).padStart(3, "0")}
          </span>
          <span className="text-[11px] font-medium tracking-wide text-white/50">
            {project.projectCode}
          </span>
        </div>
        <div className="mt-1 truncate text-sm font-semibold text-white">
          {project.name}
        </div>
      </div>
    ),
  })

  const columns = useMemo(
    () => buildProjectColumns(),
    [],
  )

  if (loading) {
    return (
      <EntityTableSkeleton
        columns={columns}
      />
    )
  }

  return (

    <>

      <EntityTable
        data={displayedProjects}
        columns={columns}
        rowId={project => project.id}
        expandedRowId={expand.expandedRowId}
        onExpandedRowChange={expand.setExpandedRowId}
        renderRow={dragApi.renderRow}
        renderExpandedRow={project => (
          <ProjectExpandedRow
            project={project}
            tasks={tasks}
          />
        )}
        emptyMessage="Sin proyectos"
      />

      {isManualMode && dragApi.overlay}

    </>

  )
}