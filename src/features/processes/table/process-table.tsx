"use client"

import {
  useEffect,
  useMemo,
} from "react"

import { useHydrated } from "@/shared/hooks/use-hydrated"
import { useFocusedRow } from "@/shared/hooks/use-focused-row"
import { useHistoryHiddenFocus } from "@/shared/hooks/use-history-hidden-focus" // nuevo

import { useEntityExpand } from "@/shared/ui/entity-table/features/expansion"

import { EntityTable } from "@/shared/ui/entity-table"
import { EntityTableLoading } from "@/shared/ui/entity-table/entity-table-loading"

import { useFilterStore } from "@/shared/filter/store/filter-store"
import { filterProcess } from "@/shared/filter/selectors/filter-process"

import { processAccess } from "../access/process-access"

import { buildProcessColumns } from "./build-process-columns"
import { ProcessExpandedRow } from "../components/expanded-row/process-expanded-row"

import { useProcessSearch } from "../hooks/use-process-search"

import { useSortStore } from "@/shared/sorting/store/sort-store"
import { createTaskView } from "@/shared/sorting/engine/sort-engine"

import type {
  ProcessDefinition,
  ProcessTask,
} from "../types/process.types"

type Props = {
  processDefinition: ProcessDefinition
  processTasks: ProcessTask[]
  search: string
  loading: boolean
  focusedTaskId?: string
  showHistory: boolean
  onHistoryRequired?: () => void // nuevo
}

export function ProcessTable({
  processDefinition,
  processTasks,
  search,
  loading,
  focusedTaskId,
  showHistory,
  onHistoryRequired, // nuevo
}: Props) {

  const hydrated = useHydrated()
  const expand = useEntityExpand()

  const taskSortMode = useSortStore(
    s => s.taskSortMode,
  )

  useFocusedRow({
    focusedId: focusedTaskId,
    setExpandedRowId: expand.setExpandedRowId,
    retryKey: showHistory, // nuevo
  })

  const filteredTasks = useProcessSearch(processTasks, search)

  const processFilters = useFilterStore(
    state => state.filters.processes,
  )

  const visibleTasks = useMemo(
    () => filterProcess({
      processTasks: filteredTasks,
      filters: processFilters,
    }),
    [filteredTasks, processFilters],
  )

  const orderedTasks = useMemo(
    () => createTaskView({
      base: visibleTasks,
      mode: taskSortMode,
      getTask: processTask => processTask.task,
    }),
    [visibleTasks, taskSortMode],
  )

  const completedTasks = useMemo(
    () => orderedTasks.filter(
      task => task.workflowStep?.status === "REVIEWED",
    ),
    [orderedTasks],
  )

  const activeTasks = useMemo(
    () => orderedTasks.filter(
      task => task.workflowStep?.status !== "REVIEWED",
    ),
    [orderedTasks],
  )

  const displayedTasks = useMemo(
    () => showHistory
      ? [...completedTasks, ...activeTasks]
      : activeTasks,
    [showHistory, completedTasks, activeTasks],
  )

  useEffect(() => {

    if (!expand.expandedRowId) {
      return
    }

    const existsAnywhere = orderedTasks.some( // cambiado: era displayedTasks
      processTask =>
        processAccess.task(processTask).id === expand.expandedRowId, // alineado con rowId
    )

    if (!existsAnywhere) {
      expand.setExpandedRowId(null)
    }

  }, [
    orderedTasks, // cambiado: era displayedTasks
    expand.expandedRowId,
    expand.setExpandedRowId,
  ])

  useHistoryHiddenFocus({ // nuevo bloque completo
    focusedId: focusedTaskId,
    showHistory,
    visibleItems: displayedTasks,
    allItems: orderedTasks,
    getId: processTask => processAccess.task(processTask).id,
    onHistoryRequired,
  })

  const columns = useMemo(
    () => buildProcessColumns(),
    [],
  )

  if (!hydrated || loading) {
    return (
      <EntityTableLoading
        label="Cargando procesos..."
      />
    )
  }

  return (
    <EntityTable
      data={displayedTasks}
      columns={columns}
      rowId={item => processAccess.task(item).id}
      expandedRowId={expand.expandedRowId}
      onExpandedRowChange={expand.setExpandedRowId}
      renderExpandedRow={item => (
        <ProcessExpandedRow
          processTask={item}
        />
      )}
      emptyMessage={`Sin tareas en ${processDefinition.label}`}
    />
  )
}