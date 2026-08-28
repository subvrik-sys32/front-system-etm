"use client"

import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation"

import {
  useEffect,
  useMemo,
  useState,
} from "react"

import { useDeepLinkRunner } from "@/shared/hooks/use-deep-link-runner"
import { useExpandRow } from "@/shared/hooks/use-expand-row"
import { clearEntityFocusParams } from "@/shared/hooks/clear-entity-focus-params"
import { useHistoryHiddenFocus } from "@/shared/hooks/use-history-hidden-focus"
import { useResponsive } from "@/shared/responsive/hooks/use-responsive"

import { useEntityExpand } from "@/shared/ui/entity-table/features/expansion"

import { TaskProcessColumn } from "@/features/tasks/pipeline/table/task-process-column"

import { ProcessMobileCard } from "./process-mobile-card"
import {
  ENTITY_PULSE_OPACITIES,
} from "@/shared/ui/entity-table/pulse-rows"

import { processAccess } from "../access/process-access"

import { useFilterStore } from "@/shared/filter/store/filter-store"
import {
  filterProcess,
} from "@/shared/filter/selectors/filter-process"

import { useProcessSearch } from "../hooks/use-process-search"

import { useSortStore } from "@/shared/sorting/store/sort-store"
import {
  createTaskView,
  getWorkflowOperationalRank,
} from "@/shared/sorting/engine/sort-engine"

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
  onResolvingChange?: (
    resolving: boolean,
  ) => void
}

export function ProcessTableCard({
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
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const { isMobile } = useResponsive()

  const expand = useEntityExpand()

  const [
    mobileExpandedKey,
    setMobileExpandedKey,
  ] = useState<string | null>(null)

  const [
    activeOverlayKey,
    setActiveOverlayKey,
  ] = useState<string | null>(null)

  const handleOverlayOpenChange = (
    key: string,
    isOpen: boolean,
  ) => {
    setActiveOverlayKey(
      isOpen ? key : null,
    )
  }

  const taskSortMode = useSortStore(
    s => s.taskSortMode,
  )

  const taskSortDirection = useSortStore(
    s => s.taskSortDirection,
  )

  const setExpandedRowId = useExpandRow({
    focusedId: focusedTaskId,
    setExpandedRowId:
      expand.setExpandedRowId,
  })

  useDeepLinkRunner({
    focusedId: focusedTaskId,
    setExpandedRowId:
      expand.setExpandedRowId,
  })

  const filteredTasks =
    useProcessSearch(
      processTasks,
      search,
    )

  const processFilters =
    useFilterStore(
      state => state.filters.processes,
    )

  const visibleTasks = useMemo(
    () =>
      filterProcess({
        processTasks: filteredTasks,
        filters: processFilters,
      }),
    [
      filteredTasks,
      processFilters,
    ],
  )

  /**
   * Procesos usa el workflowStep del propio row.
   *
   * Esto es fundamental: no usamos el primer step pendiente de
   * Task.workflowSteps porque aquí cada fila representa un proceso
   * concreto.
   *
   * Jerarquía del orden:
   *
   * 1. Disponibilidad del proceso en SU área.
   * 2. Prioridad de la tarea.
   * 3. Asignación del operador.
   * 4. Fecha de entrega.
   * 5. Position.
   *
   * La asignación NO adelanta una tarea de menor prioridad sobre
   * otra de mayor prioridad.
   */
  const orderedTasks = useMemo(
    () =>
      createTaskView({
        base: visibleTasks,
        mode: taskSortMode,
        direction: taskSortDirection,
        getTask:
          processTask =>
            processTask.task,
        getOperationalRank:
          processTask =>
            getWorkflowOperationalRank(
              processTask
                .workflowStep
                ?.status,
            ),
      }),
    [
      visibleTasks,
      taskSortMode,
      taskSortDirection,
    ],
  )

  const completedTasks = useMemo(
    () =>
      orderedTasks.filter(
        task =>
          task.workflowStep
            ?.status === "REVIEWED",
      ),
    [orderedTasks],
  )

  const activeTasks = useMemo(
    () =>
      orderedTasks.filter(
        task =>
          task.workflowStep
            ?.status !== "REVIEWED",
      ),
    [orderedTasks],
  )

  const displayedTasks = useMemo(
    () =>
      showHistory
        ? [
            ...completedTasks,
            ...activeTasks,
          ]
        : activeTasks,
    [
      showHistory,
      completedTasks,
      activeTasks,
    ],
  )

  useEffect(() => {
    if (!expand.expandedRowId) {
      return
    }

    const existsAnywhere =
      orderedTasks.some(
        processTask =>
          processAccess
            .task(processTask)
            .id ===
          expand.expandedRowId,
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
    getId: processTask =>
      processAccess.task(processTask).id,
    onHistoryRequired,
    onResolvingChange,
  })

  useEffect(() => {
    if (
      !isMobile ||
      !focusedTaskId
    ) {
      return
    }

    const exists =
      displayedTasks.some(
        pt =>
          pt.task.id ===
          focusedTaskId,
      )

    if (exists) {
      setMobileExpandedKey(
        `${focusedTaskId}:${processDefinition.code}`,
      )
    }
  }, [
    isMobile,
    focusedTaskId,
    displayedTasks,
    processDefinition.code,
  ])

  if (loading) {
    return (
      <div className="flex flex-col gap-2 pb-2">
        {ENTITY_PULSE_OPACITIES.map(
          (opacity, i) => (
            <ProcessMobileCard
              key={i}
              loading
              opacity={opacity}
            />
          ),
        )}
      </div>
    )
  }

  if (isMobile) {
    const tasks =
      displayedTasks.map(
        processTask =>
          processTask.task,
      )

    return (
      <TaskProcessColumn
        processCode={
          processDefinition.code
        }
        tasks={tasks}
        expandedKey={
          mobileExpandedKey
        }
        onToggleCard={key => {
          const next =
            mobileExpandedKey === key
              ? null
              : key

          const nextTaskId =
            next?.split(":")[0]

          if (
            focusedTaskId &&
            nextTaskId !==
              focusedTaskId
          ) {
            clearEntityFocusParams(
              router,
              pathname,
              searchParams,
            )
          }

          setMobileExpandedKey(
            next,
          )
        }}
        activeOverlayKey={
          activeOverlayKey
        }
        onOverlayOpenChange={
          handleOverlayOpenChange
        }
        contentOnly
      />
    )
  }

  const expandedPt =
    displayedTasks.find(
      processTask =>
        processAccess
          .task(processTask)
          .id ===
        expand.expandedRowId,
    )

  const dimActiveSiblings =
    Boolean(
      expandedPt &&
      expandedPt.workflowStep
        ?.status !== "REVIEWED",
    )

  return (
    <div className="flex flex-col gap-2 pb-2">
      {displayedTasks.map(
        processTask => {
          const id =
            processAccess
              .task(processTask)
              .id

          return (
            <div
              key={id}
              data-expanded-row-id={
                id
              }
            >
              <ProcessMobileCard
                processTask={
                  processTask
                }
                expanded={
                  expand.expandedRowId ===
                  id
                }
                dimOthers={
                  dimActiveSiblings
                }
                onToggle={() =>
                  setExpandedRowId(
                    expand.expandedRowId ===
                      id
                      ? null
                      : id,
                  )
                }
              />
            </div>
          )
        },
      )}

      {displayedTasks.length === 0 && (
        <div className="flex h-24 items-center justify-center rounded-xl bg-foreground/5 text-sm text-muted-foreground">
          Sin tareas en{" "}
          {processDefinition.label}
        </div>
      )}
    </div>
  )
}
