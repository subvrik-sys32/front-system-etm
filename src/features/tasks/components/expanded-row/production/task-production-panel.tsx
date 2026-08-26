"use client"

import type {
  Task,
} from "@/features/tasks/types/task.types"

import type {
  EntityBase,
} from "@/shared/types/entity-base.types"

import {
  useRouter,
} from "next/navigation"

import {
  useState,
  useMemo,
} from "react"

import {
  Activity,
  Check,
  MoreHorizontal,
} from "lucide-react"

import {
  CollapsibleSummaryPanel,
  CollapseIndicatorsButton,
} from "@/shared/ui/collapsible-summary-panel/collapsible-summary-panel"

import {
  createWorkflowView,
} from "@/features/workflow/view/create-workflow-view"

import {
  getCurrentStep,
} from "@/features/workflow/selectors/get-current-step"

import {
  WORKFLOW_STATUS_DEFINITIONS,
} from "@/features/workflow/constants/workflow-status-definitions"

import {
  PROCESS_DEFINITIONS,
} from "@/features/processes/constants/process-definitions"

import {
  ENTITY_ICONS,
} from "@/shared/constants/entity-icons"

import {
  getBadgeColors} from "@/shared/utils/badge-colors"
import { useThemeStore } from "@/shared/theme"
import { useResponsive } from "@/shared/responsive/hooks/use-responsive"

import {
  cn,
} from "@/shared/utils/utils"

import {
  resolveWorkflowStepVisual,
  workflowStepperStyles,
} from "@/features/workflow/styles/workflow-stepper"


type Props = {
  task: Task
  indicatorsExpanded?: boolean
  onIndicatorsExpandedChange?: (expanded: boolean) => void
  /** Móvil: el botón vive al lado del EntityExpandedToggle. */
  showCollapseButton?: boolean
}

export function TaskProductionPanel({
  task,
  indicatorsExpanded: indicatorsExpandedProp,
  onIndicatorsExpandedChange,
  showCollapseButton = true,
}: Props) {
  // theme solo para getBadgeColors en el map del stepper (hooks no en loop)
  const theme = useThemeStore(s => s.resolved)
  const { isCompact } = useResponsive()

  const router = useRouter()

  const isControlled = indicatorsExpandedProp !== undefined

  const [
    expandedInternal,
    setExpandedInternal,
  ] = useState(true)

  const expanded = isControlled ? indicatorsExpandedProp! : expandedInternal

  const setExpanded = (next: boolean) => {
    if (!isControlled) setExpandedInternal(next)
    onIndicatorsExpandedChange?.(next)
  }

  const workflowView =
    createWorkflowView(
      task.workflowSteps,
    )

  const currentStep =
    getCurrentStep(
      task.workflowSteps,
    )

  const status =
    useMemo<EntityBase | undefined>(() => {

      if (
        workflowView.completed
      ) {

        return {
          id: "finalized",
          name: "Finalizado",
          icon: "check",
          color: "#22C55E",
        }

      }

      if (
        !currentStep
      ) {
        return undefined
      }

      const definition =
        WORKFLOW_STATUS_DEFINITIONS[
          currentStep.status
        ]

      return {
        id: currentStep.status,
        name: definition.label,
        icon: definition.icon,
        color: definition.color,
      }

    }, [
      workflowView.completed,
      currentStep,
    ])

  const StatusIcon =
    status?.icon
      ? ENTITY_ICONS[status.icon]
      : undefined

  // Glass: texto e iconos = tinta neutra on-glass (legible en cualquier tint).
  // El color de dominio queda en el fondo glass + barra, no en el glyph.

  const progressContent = (

    <div className="flex w-full min-w-0 flex-col gap-1.5">

      <div className="flex min-w-0 items-center justify-between gap-2">

        <div className="flex min-w-0 items-center gap-1.5">

          {StatusIcon && status && (
            <StatusIcon
              size={13}
              className="shrink-0 text-on-glass-foreground"
            />
          )}

          <span className="truncate text-xs font-bold uppercase tracking-wide text-on-glass-foreground">
            {status?.name ?? "Sin estado"}
          </span>

        </div>

        <span className="shrink-0 whitespace-nowrap text-xs font-semibold text-on-glass-muted">
          {workflowView.completedSteps}/{workflowView.totalSteps} ·{" "}
          <span className="text-on-glass-foreground">{workflowView.progress}%</span>
        </span>

      </div>

      <div
        className="h-2 w-full min-w-0 overflow-hidden rounded-full"
        style={workflowStepperStyles.progressTrack}
      >
        <div
          className="h-full rounded-full transition-all"
          style={{
            ...workflowStepperStyles.progressFill,
            width: `${workflowView.progress}%`,
          }}
        />
      </div>

    </div>

  )

  const stepper = (
    <div className="w-full overflow-x-auto overflow-y-visible overscroll-x-contain [-ms-overflow-style:none] scrollbar-none [&::-webkit-scrollbar]:hidden">
      <div className="flex min-w-max items-center justify-center px-3 pb-1 pt-3">
        {task.route.map((code, index) => {
          const definition = PROCESS_DEFINITIONS[code]
          const ProcessIcon = ENTITY_ICONS[definition.icon]

          const step = task.workflowSteps.find(
            s => s.processCode === code,
          )

          const isActive = currentStep?.processCode === code
          const isDone =
            step?.status === "COMPLETED" ||
            step?.status === "REVIEWED"
          const visual = resolveWorkflowStepVisual({
            isDone,
            isCurrent: isActive,
          })
          const isLast = index === task.route.length - 1
          const colors = getBadgeColors(definition.color, "subtle", theme)

          const commentCount = step?.commentCount ?? 0
          const hasComments = commentCount > 0
          const operator = step?.operator ?? null
          const hasInvite = !operator && Boolean(step?.invitedOperatorId)

          return (
            <div
              key={code}
              data-active={isActive}
              className="flex shrink-0 items-center"
            >
              <button
                type="button"
                onClick={() => {
                  sessionStorage.removeItem("process-origin-code")
                  sessionStorage.removeItem("process-origin-focus-task-id")
                  sessionStorage.setItem(
                    "process-origin-task-id",
                    task.id,
                  )
                  router.push(
                    `/processes?code=${code}&taskId=${task.id}`,
                  )
                }}
                className="flex flex-col items-center gap-1.5 active:scale-95"
              >
                <div className="relative size-10 shrink-0 overflow-visible">
                  <div
                    className="flex size-10 items-center justify-center rounded-full"
                    style={workflowStepperStyles.node[visual]}
                  >
                    {isDone ? (
                      <Check
                        size={16}
                        style={workflowStepperStyles.icon.completed}
                      />
                    ) : (
                      <ProcessIcon
                        size={16}
                        style={workflowStepperStyles.icon[visual]}
                      />
                    )}
                  </div>

                  {/* Contador de mensajes: integrado, sin ring */}
                  {hasComments && (
                    <span
                      title={
                        commentCount === 1
                          ? "1 mensaje"
                          : `${commentCount} mensajes`
                      }
                      className={cn(
                        "pointer-events-none absolute -bottom-0.5 -right-0.5 z-10",
                        "flex h-3.5 min-w-3.5 items-center justify-center",
                        "rounded-full bg-foreground/25 px-1 text-[8px] font-bold leading-none text-background",
                      )}
                    >
                      {commentCount > 99 ? "99+" : commentCount}
                    </span>
                  )}

                  {/* Operador compact: inicial sobre el círculo */}
                  {isCompact && operator && (
                    <span
                      title={operator.name}
                      className={cn(
                        "pointer-events-none absolute z-10",
                        "flex h-4 min-w-4 items-center justify-center overflow-hidden",
                        "rounded-full text-[9px] font-bold leading-none text-white",
                        hasComments
                          ? "-bottom-1 -left-1.5"
                          : "-right-1.5 -top-1.5",
                      )}
                      style={{
                        backgroundColor: "var(--workflow-operator-bg)",
                        color: "var(--workflow-operator-text)",
                      }}
                    >
                      {operator.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={operator.avatarUrl}
                          alt={operator.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        operator.name.charAt(0).toUpperCase()
                      )}
                    </span>
                  )}

                  {hasInvite && (
                    <span
                      title="Convocatoria pendiente"
                      className={cn(
                        "pointer-events-none absolute -right-1.5 -top-1.5 z-10",
                        "flex h-4 min-w-4 items-center justify-center",
                        "rounded-full bg-amber-500/90 text-[9px] font-bold text-white",
                      )}
                    >
                      ?
                    </span>
                  )}
                </div>

                <span
                  className={cn(
                    "normal-case",
                    isCompact
                      ? "text-[10px] font-bold uppercase"
                      : "text-[11px] font-medium",
                  )}
                  style={workflowStepperStyles.label[visual]}
                >
                  {isCompact ? definition.code : definition.label}
                </span>

                {/* Slot fijo h-5: alinea Despacho aunque no tenga operador */}
                {!isCompact && (
                  <div className="mt-0.5 flex h-5 min-h-5 max-w-[5.5rem] items-center justify-center">
                    {operator ? (
                      <span
                        title={operator.name}
                        className="max-w-full truncate rounded-md px-1.5 py-0.5 text-[10px] font-medium normal-case"
                        style={workflowStepperStyles.operator}
                      >
                        {operator.name.trim().split(/\s+/)[0]}
                      </span>
                    ) : hasInvite ? (
                      <span className="rounded-md bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-medium normal-case text-amber-800/90 dark:text-amber-200/80">
                        Convocado
                      </span>
                    ) : null}
                  </div>
                )}
              </button>

              {!isLast && (
                <div
                  className={cn(
                    "mt-5 h-0.5 shrink-0 self-start overflow-hidden rounded-full bg-foreground/10",
                    isCompact ? "mx-2 w-6" : "mx-3 w-10",
                  )}
                >
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: isDone ? "100%" : "0%",
                      ...(isDone
                        ? workflowStepperStyles.connector.completed
                        : workflowStepperStyles.connector.pending),
                    }}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )


  return (

    <>

      {/* Carousel de ruta + progreso — desktop y compact (ya no hay chips de ruta en el toggle). */}

      <div className="flex w-full flex-col">

        <CollapsibleSummaryPanel
          expanded={expanded}
          onCollapse={() => setExpanded(false)}
          showCollapseButton={false}
          collapsed={
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="flex w-full items-center gap-3 rounded-2xl p-3 text-left transition hover:brightness-110 tablet:gap-4 tablet:p-4"
              style={workflowStepperStyles.surface}
            >

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-foreground/5">

                {StatusIcon ? (
                  <StatusIcon size={20} className="text-on-glass-foreground" />
                ) : (
                  <Activity size={20} className="text-on-glass-foreground" />
                )}

              </div>

              <span className="hidden min-w-0 shrink truncate text-xs font-bold uppercase tracking-[0.18em] text-on-glass-foreground sm:block">
                {status?.name ?? "Producción"}
              </span>

              <div className="flex min-w-0 flex-1 items-center justify-end gap-4 tablet:gap-8">

                <div className="min-w-0 text-right">
                  <p className="truncate text-[10px] font-bold uppercase tracking-[0.14em] text-on-glass-muted sm:text-xs">
                    Listas
                  </p>
                  <p className="text-lg font-bold leading-tight text-on-glass-foreground">
                    {workflowView.completedSteps}/{workflowView.totalSteps}
                  </p>
                </div>

                <div className="min-w-0 text-right">
                  <p className="truncate text-[10px] font-bold uppercase tracking-[0.14em] text-on-glass-muted sm:text-xs">
                    Avance
                  </p>
                  <p className="text-lg font-bold leading-tight text-on-glass-foreground">
                    {workflowView.progress}%
                  </p>
                </div>

              </div>

              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-foreground/5 text-on-glass-muted">
                <MoreHorizontal size={18} />
              </div>

            </button>
          }
        >

          <div
            className="relative flex w-full flex-col gap-6 rounded-2xl p-4 tablet:p-5"
            style={workflowStepperStyles.surface}
          >
            {showCollapseButton && (
              <div className="absolute right-2 top-2 z-10">
                <CollapseIndicatorsButton onClick={() => setExpanded(false)} />
              </div>
            )}

            {stepper}

            {progressContent}

          </div>

        </CollapsibleSummaryPanel>

      </div>

    </>

  )

}
