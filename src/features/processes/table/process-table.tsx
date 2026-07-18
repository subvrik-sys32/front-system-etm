"use client"

import {
  useEffect,
  useMemo,
  useState,
} from "react"

import { useResponsive } from "@/shared/responsive/hooks/use-responsive"

import { useHydrated } from "@/shared/hooks/use-hydrated"
import { useFocusedRow } from "@/shared/hooks/use-focused-row"
import { useHistoryHiddenFocus } from "@/shared/hooks/use-history-hidden-focus"

import { useEntityExpand } from "@/shared/ui/entity-table/features/expansion"

import { EntityTable } from "@/shared/ui/entity-table"
import { EntityTableSkeleton } from "@/shared/ui/entity-table"
import { ProcessTableSkeleton } from "./process-table-skeleton"

import { TaskProcessColumn } from "@/features/tasks/pipeline/table/task-process-column"

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
  focusToken?: string
  showHistory: boolean
  onHistoryRequired?: () => void
  onResolvingChange?: (resolving: boolean) => void
}

export function ProcessTable({
  processDefinition,
  processTasks,
  search,
  loading,
  focusedTaskId,
  focusToken,
  showHistory,
  onHistoryRequired,
  onResolvingChange,
}: Props) {

  const { isMobile } = useResponsive()

  const hydrated = useHydrated()
  const expand = useEntityExpand()

  const taskSortMode = useSortStore(
    s => s.taskSortMode,
  )

  useFocusedRow({
    focusedId: focusedTaskId,
    setExpandedRowId: expand.setExpandedRowId,
    retryKey: `${focusToken ?? ""}:${showHistory}`,
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

    const existsAnywhere = orderedTasks.some(
      processTask =>
        processAccess.task(processTask).id === expand.expandedRowId,
    )

    if (!existsAnywhere) {
      expand.setExpandedRowId(null)
    }

  }, [
    orderedTasks,
    expand.expandedRowId,
    expand.setExpandedRowId,
  ])

  useHistoryHiddenFocus({
    focusedId: focusedTaskId,
    focusToken,
    showHistory,
    visibleItems: displayedTasks,
    allItems: orderedTasks,
    getId: processTask => processAccess.task(processTask).id,
    onHistoryRequired,
    onResolvingChange,
  })

  const columns = useMemo(
    () => buildProcessColumns(),
    [],
  )

  // Estado del pipeline mobile — esta página es standalone (no
  // vive dentro de TaskPipelineBoard), así que necesita su propio
  // lock de overlay Y su propia clave de expansión, con el formato
  // "taskId:processCode" que espera TaskProcessColumn — NO se puede
  // reusar expand.expandedRowId acá porque ese es solo el taskId
  // (formato de EntityTable, pensado para desktop), nunca matchea.
  const [mobileExpandedKey, setMobileExpandedKey] =
    useState<string | null>(null)

  const [activeOverlayKey, setActiveOverlayKey] =
    useState<string | null>(null)

  const handleOverlayOpenChange = (key: string, isOpen: boolean) => {
    setActiveOverlayKey(isOpen ? key : null)
  }

  // Si llega un foco a una tarea específica (ej. desde una
  // notificación) mientras estamos en mobile, expandirla
  // automáticamente con la clave en el formato correcto.
  useEffect(() => {

    if (!isMobile || !focusedTaskId) {
      return
    }

    const exists = displayedTasks.some(
      pt => pt.task.id === focusedTaskId,
    )

    if (exists) {
      setMobileExpandedKey(`${focusedTaskId}:${processDefinition.code}`)
    }

  }, [isMobile, focusedTaskId, displayedTasks, processDefinition.code])

  if (!hydrated || loading) {

    if (isMobile) {
      return <ProcessTableSkeleton />
    }

    return (
      <EntityTableSkeleton
        columns={columns}
      />
    )

  }

  if (isMobile) {

    const tasks = displayedTasks.map(
      processTask => processTask.task,
    )

    return (

      <TaskProcessColumn
        processCode={processDefinition.code}
        tasks={tasks}
        expandedKey={mobileExpandedKey}
        onToggleCard={(key) =>
          setMobileExpandedKey(current =>
            current === key ? null : key,
          )
        }
        activeOverlayKey={activeOverlayKey}
        onOverlayOpenChange={handleOverlayOpenChange}
        contentOnly
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