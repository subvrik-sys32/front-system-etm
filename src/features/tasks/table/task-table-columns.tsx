"use client"

import {
  useEffect,
  useMemo,
} from "react"

import type { Task } from "../types/task.types"

import { useFocusedRow } from "@/shared/hooks/use-focused-row"
import { useHistoryHiddenFocus } from "@/shared/hooks/use-history-hidden-focus"

import { useEntityExpand } from "@/shared/ui/entity-table/features/expansion"
import { useRowDragReorder } from "@/shared/dnd/use-row-drag-reorder"

import { EntityTable } from "@/shared/ui/entity-table"
import { EntityTableSkeleton } from "@/shared/ui/entity-table"

import { buildTaskColumns } from "./build-task-columns"
import { TaskExpandedRow } from "../components/expanded-row/task-expanded-row"

import { useTaskSearch } from "../hooks/use-task-search"

import { useFilterStore } from "@/shared/filter/store/filter-store"
import { filterTasks } from "@/shared/filter/selectors/filter-tasks"

import { isWorkflowCompleted } from "@/features/workflow/selectors/is-completed"

import { useSortStore } from "@/shared/sorting/store/sort-store"
import { createTaskView } from "@/shared/sorting/engine/sort-engine"

type Props = {
  tasks: Task[]
  loading: boolean
  focusedTaskId?: string
  focusToken?: string
  search: string
  showHistory: boolean
  reorderTasks: (tasks: Task[]) => Promise<unknown>
  onHistoryRequired?: () => void
}

// Vista TABLA: misma fuente de datos, filtros y orden que la vista
// CARD (task-table.tsx) — la única diferencia real es la fila que
// se renderiza (EntityTable + buildTaskColumns, genérica por
// columnas, en vez de TaskMobileCard). Mismo patrón que ya usa
// ProcessTable.
export function TaskTableColumns({
  tasks,
  loading,
  focusedTaskId,
  focusToken,
  search,
  showHistory,
  reorderTasks,
  onHistoryRequired,
}: Props) {

  const expand = useEntityExpand()

  const taskSortMode = useSortStore(
    s => s.taskSortMode,
  )

  const isManualMode = taskSortMode === "manual"

  useFocusedRow({
    focusedId: focusedTaskId,
    setExpandedRowId: expand.setExpandedRowId,
    focusToken,
  })

  const filteredTasks = useTaskSearch(tasks, search)

  const filters = useFilterStore(
    s => s.filters.tasks,
  )

  const visibleTasks = filterTasks({
    tasks: filteredTasks,
    filters,
  })

  const sortedTasks = useMemo(
    () => createTaskView({
      base: visibleTasks,
      mode: taskSortMode,
    }),
    [visibleTasks, taskSortMode],
  )

  const completed = sortedTasks.filter(
    task => isWorkflowCompleted(task.workflowSteps),
  )

  const active = sortedTasks.filter(
    task => !isWorkflowCompleted(task.workflowSteps),
  )

  const displayedTasks = showHistory
    ? [...completed, ...active]
    : active

  useEffect(() => {

    if (!expand.expandedRowId) {
      return
    }

    const exists = displayedTasks.some(
      task => task.id === expand.expandedRowId,
    )

    if (!exists) {
      expand.setExpandedRowId(null)
    }

  }, [
    displayedTasks,
    expand.expandedRowId,
    expand.setExpandedRowId,
  ])

  useHistoryHiddenFocus({
    focusedId: focusedTaskId,
    focusToken,
    showHistory,
    visibleItems: displayedTasks,
    allItems: sortedTasks,
    getId: task => task.id,
    onHistoryRequired,
  })

  const dragApi = useRowDragReorder({
    items: displayedTasks,
    getId: t => t.id,
    disabled: !isManualMode,
    isRowDisabled: task => expand.expandedRowId === task.id,
    onReorder: next => {
      reorderTasks(next)
    },
    renderDragLabel: task => (
      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="rounded-md bg-white/8 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-white/50">
            {String(task.taskNumber).padStart(3, "0")}
          </span>
          <span className="text-[11px] font-medium tracking-wide text-white/50">
            {task.project.projectCode}
          </span>
        </div>
        <div className="mt-1 truncate text-sm font-semibold text-white">
          {task.reference}
        </div>
      </div>
    ),
  })

  const columns = useMemo(
    () => buildTaskColumns(),
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
        data={displayedTasks}
        columns={columns}
        rowId={task => task.id}
        expandedRowId={expand.expandedRowId}
        onExpandedRowChange={expand.setExpandedRowId}
        renderRow={dragApi.renderRow}
        renderExpandedRow={task => (
          <TaskExpandedRow
            task={task}
          />
        )}
        emptyMessage="Sin tareas"
      />

      {isManualMode && dragApi.overlay}

    </>

  )
}