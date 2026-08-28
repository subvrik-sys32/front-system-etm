"use client"

import { useMemo } from "react"
import { User, UserX } from "lucide-react"
import { ENTITY_ICONS } from "@/shared/constants/entity-icons"
import { PROCESS_DEFINITIONS } from "@/features/processes/constants/process-definitions"
import { TaskProcessColumn } from "@/features/tasks/pipeline/table/task-process-column"
import { SummonOperatorButton } from "./summon-operator-button"
import { TaskAssignmentBadge } from "./task-assignment-badge"
import { cn } from "@/shared/utils/utils"
import { useBadgeColors } from "@/shared/utils/use-badge-colors"
import type { ProcessCode, Task } from "@/features/tasks/types/task.types"
import type { WorkflowStep } from "@/features/workflow/types/workflow.types"
import type { TaskAreaPanelReturn } from "../../hooks/use-task-area-panel"

type AreaTaskSectionProps = {
  code: ProcessCode
  panel: TaskAreaPanelReturn
  /** Columna fija en layout horizontal (sidebar / board). */
  column?: boolean
}

type TaskGroup = {
  id: string
  name: string
  tasks: Task[]
}

type TaskSegment = {
  id: "assigned" | "available"
  label: string
  groups: TaskGroup[]
}

export function AreaTaskSection({
  code,
  panel,
  column = false,
}: AreaTaskSectionProps) {
  const { state, actions } = panel
  const definition = PROCESS_DEFINITIONS[code]
  const Icon = ENTITY_ICONS[definition.icon]
  const badge = useBadgeColors(definition.color, "subtle")
  const isSummoningThis = state.summonTarget?.processCode === code
  const allTasksForCode: Task[] = state.columns.get(code) ?? []

  /**
   * Segmentamos primero por asignación externa.
   *
   * assignedById !== null significa que la tarea fue puesta sobre un
   * operador mediante "Convocar / ASSIGN". El propio operario, cuando
   * se autoasigna al iniciar, no entra en este segmento.
   *
   * Dentro de cada segmento conservamos la agrupación por operador.
   * Así la asignación es una sección visual superior, no un nuevo
   * criterio de prioridad que altere el orden interno.
   */
  const segments = useMemo<TaskSegment[]>(() => {
    const buildGroups = (tasks: Task[]): TaskGroup[] => {
      const groupsMap = new Map<string, TaskGroup>()

      tasks.forEach(task => {
        const step = task.workflowSteps?.find(
          (s: WorkflowStep) => s.processCode === code,
        )

        const id =
          step?.operator?.id ??
          step?.operatorId ??
          "unassigned"

        const name =
          step?.operator?.name ??
          "Sin convocar"

        if (!groupsMap.has(id)) {
          groupsMap.set(id, {
            id,
            name,
            tasks: [],
          })
        }

        groupsMap.get(id)!.tasks.push(task)
      })

      const groups = Array.from(groupsMap.values())

      groups.sort((a, b) => {
        const aUn = a.id === "unassigned" ? 1 : 0
        const bUn = b.id === "unassigned" ? 1 : 0

        if (aUn !== bUn) {
          return aUn - bUn
        }

        return a.name.localeCompare(b.name, "es")
      })

      return groups
    }

    const assigned: Task[] = []
    const available: Task[] = []

    allTasksForCode.forEach(task => {
      const step = task.workflowSteps?.find(
        (s: WorkflowStep) => s.processCode === code,
      )

      if (Boolean(step?.assignedById)) {
        assigned.push(task)
      } else {
        available.push(task)
      }
    })

    const result: TaskSegment[] = []

    if (assigned.length > 0) {
      result.push({
        id: "assigned",
        label: "Asignadas",
        groups: buildGroups(assigned),
      })
    }

    if (available.length > 0) {
      result.push({
        id: "available",
        label: "Disponibles",
        groups: buildGroups(available),
      })
    }

    return result
  }, [allTasksForCode, code])

  return (
    <div
      className={cn(
        "flex flex-col gap-2",
        column && "h-full min-h-0 w-64 shrink-0",
      )}
    >
      {/* Cabecera del Área (ej. CORTE) */}
      <div className="flex shrink-0 items-center justify-between gap-2 pb-1">
        <div className="flex min-w-0 items-center gap-2">
          <span
            className="flex size-6 shrink-0 items-center justify-center rounded-md text-[10px] font-bold"
            style={{
              color: badge.text,
              backgroundColor: badge.background,
            }}
          >
            {Icon ? <Icon size={12} /> : code}
          </span>

          <span className="truncate text-xs font-bold uppercase tracking-wide text-foreground">
            {definition.label}
          </span>

          <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground">
            {allTasksForCode.length}
          </span>
        </div>

        {state.canChooseAreas &&
          (allTasksForCode.length > 0 || isSummoningThis) && (
            <div className="flex shrink-0 items-center gap-2">
              <SummonOperatorButton
                processCode={code}
                active={isSummoningThis}
                selectedOperatorId={
                  isSummoningThis
                    ? state.summonTarget?.operator.id
                    : undefined
                }
                onSelect={operator =>
                  actions.setSummonTarget(
                    operator
                      ? {
                          processCode: code,
                          operator,
                        }
                      : null,
                  )
                }
              />
            </div>
          )}
      </div>

      <div className={cn(column && "min-h-0 flex-1 overflow-y-auto")}>
        {state.canChooseAreas || isSummoningThis ? (
          <div className="space-y-4">
            {segments.map(segment => (
              <section
                key={segment.id}
                className="space-y-2"
              >
                {/* Segmento superior: la asignación separa visualmente
                    las tareas sin cambiar su orden interno. */}
                <div className="flex items-center gap-2 px-1">
                  <span
                    className={cn(
                      "text-[11px] font-bold uppercase tracking-wide",
                      segment.id === "assigned"
                        ? "text-emerald-700 dark:text-emerald-400"
                        : "text-muted-foreground",
                    )}
                  >
                    {segment.label}
                  </span>

                  <span className="rounded-full bg-foreground/10 px-2 py-0.5 text-[10px] font-medium tabular-nums text-muted-foreground">
                    {segment.groups.reduce(
                      (count, group) =>
                        count + group.tasks.length,
                      0,
                    )}
                  </span>
                </div>

                {segment.groups.map(group => {
                  const isUnassigned =
                    group.id === "unassigned"

                  const headerStep =
                    !isUnassigned
                      ? group.tasks
                          .map(task =>
                            task.workflowSteps?.find(
                              step =>
                                step.processCode === code,
                            ),
                          )
                          .find(Boolean)
                      : undefined

                  return (
                    <div
                      key={`${segment.id}:${group.id}`}
                      className="space-y-2"
                    >
                      {/* Agrupación por operador dentro del segmento. */}
                      <div className="flex items-center justify-between gap-2 px-1 text-xs font-semibold">
                        <div className="flex min-w-0 items-center gap-1.5 text-muted-foreground">
                          {isUnassigned ? (
                            <UserX className="size-3.5 shrink-0 text-muted-foreground/70" />
                          ) : (
                            <User className="size-3.5 shrink-0 text-emerald-400" />
                          )}

                          <span
                            className={cn(
                              "truncate",
                              !isUnassigned &&
                                "font-bold text-foreground",
                            )}
                          >
                            {group.name}
                          </span>

                          {!isUnassigned &&
                            headerStep &&
                            state.canChooseAreas &&
                            actions.handleUnsummon && (
                              <TaskAssignmentBadge
                                step={headerStep}
                                onUnsummon={
                                  actions.handleUnsummon
                                }
                                unsummoning={
                                  state.unsummoning
                                }
                                iconOnly
                              />
                            )}
                        </div>

                        <span className="shrink-0 rounded-full bg-foreground/10 px-2 py-0.5 text-[10px] font-medium tabular-nums text-muted-foreground">
                          {group.tasks.length}
                        </span>
                      </div>

                      <TaskProcessColumn
                        processCode={code}
                        tasks={group.tasks}
                        expandedKey={state.expandedKey}
                        onToggleCard={
                          actions.setExpandedKey
                        }
                        activeOverlayKey={
                          state.activeOverlayKey
                        }
                        onOverlayOpenChange={
                          actions.setActiveOverlayKey
                        }
                        fullWidth
                        contentOnly
                        selectionMode={
                          isSummoningThis
                        }
                        selectedStepIds={
                          state.selectedStepIds
                        }
                        onToggleStepSelection={
                          actions.handleToggleStepSelection
                        }
                        unsummoning={
                          state.unsummoning
                        }
                      />
                    </div>
                  )
                })}
              </section>
            ))}

            {segments.length === 0 && (
              <div className="flex h-12 items-center justify-center rounded-xl bg-foreground/5 px-3 text-sm font-medium text-muted-foreground">
                Sin tareas
              </div>
            )}
          </div>
        ) : (
          <OperatorTaskLists
            code={code}
            tasks={allTasksForCode}
            panel={panel}
          />
        )}
      </div>
    </div>
  )
}

type OperatorTaskListsProps = {
  code: ProcessCode
  tasks: Task[]
  panel: TaskAreaPanelReturn
}

function OperatorTaskLists({
  code,
  tasks,
  panel,
}: OperatorTaskListsProps) {
  const { state, actions } = panel

  const { assigned, available } = useMemo(() => {
    const assignedList = tasks.filter(task =>
      task.workflowSteps?.some(
        (s: WorkflowStep) =>
          s.processCode === code &&
          Boolean(s.assignedById),
      ),
    )

    const availableList = tasks.filter(
      task =>
        !task.workflowSteps?.some(
          (s: WorkflowStep) =>
            s.processCode === code &&
            Boolean(s.assignedById),
        ),
    )

    return {
      assigned: assignedList,
      available: availableList,
    }
  }, [tasks, code])

  return (
    <>
      {assigned.length > 0 && (
        <>
          <p className="mb-1.5 px-1 text-[11px] font-bold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
            Asignadas
          </p>

          <TaskProcessColumn
            processCode={code}
            tasks={assigned}
            expandedKey={state.expandedKey}
            onToggleCard={actions.setExpandedKey}
            activeOverlayKey={state.activeOverlayKey}
            onOverlayOpenChange={
              actions.setActiveOverlayKey
            }
            fullWidth
            contentOnly
          />
        </>
      )}

      {available.length > 0 && (
        <>
          <p
            className={cn(
              "mb-1.5 px-1 text-[11px] font-bold uppercase tracking-wide text-muted-foreground",
              assigned.length > 0 && "mt-3",
            )}
          >
            Disponibles
          </p>

          <TaskProcessColumn
            processCode={code}
            tasks={available}
            expandedKey={state.expandedKey}
            onToggleCard={actions.setExpandedKey}
            activeOverlayKey={
              state.activeOverlayKey
            }
            onOverlayOpenChange={
              actions.setActiveOverlayKey
            }
            fullWidth
            contentOnly
          />
        </>
      )}

      {assigned.length === 0 &&
        available.length === 0 && (
          <div className="flex h-12 items-center justify-center rounded-xl bg-foreground/5 px-3 text-sm font-medium text-muted-foreground">
            Sin tareas
          </div>
        )}
    </>
  )
}
