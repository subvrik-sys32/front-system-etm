"use client"

import { ENTITY_ICONS } from "@/shared/constants/entity-icons"
import { PROCESS_DEFINITIONS } from "@/features/processes/constants/process-definitions"
import type { ProcessCode, Task } from "@/features/tasks/types/task.types"
import { getBadgeColors } from "@/shared/utils/badge-colors"
import { TaskPipelineCard } from "../components/task-pipeline-card"
import { TaskColumnOperator } from "../components/task-column-operator"
import { useColumnScroll } from "../hooks/use-column-scroll"
import { useResponsive } from "@/shared/responsive/hooks/use-responsive"
import { cn } from "@/lib/utils"

type SharedProps = {
  processCode: ProcessCode
  tasks: Task[]
}

type ContentProps = SharedProps & {
  expandedKey: string | null
  onToggleCard: (key: string) => void
  activeOverlayKey: string | null
  onOverlayOpenChange: (key: string, isOpen: boolean) => void
}

function ColumnHeader({ processCode, tasks }: SharedProps) {

  const definition = PROCESS_DEFINITIONS[processCode]
  const Icon = ENTITY_ICONS[definition.icon]
  const badge = getBadgeColors(definition.color, "subtle")

  return (

    <div className="w-72 shrink-0">

      <header
        className="flex items-center gap-2 border-b px-3 py-3"
        style={{ borderColor: definition.color }}
      >

        <span
          className="flex size-6 items-center justify-center rounded-md text-xs font-bold"
          style={{ color: badge.text, backgroundColor: badge.background }}
        >
          {processCode}
        </span>

        {Icon && (
          <Icon size={15} style={{ color: definition.color }} />
        )}

        <span className="text-sm font-bold uppercase tracking-wide text-neutral-200">
          {definition.label}
        </span>

        <span className="ml-auto text-xs font-semibold text-neutral-500">
          {tasks.length}
        </span>

      </header>

      <div className="border-b border-white/5 px-2 py-1">

        <TaskColumnOperator
          processCode={processCode}
          tasks={tasks}
        />

      </div>

    </div>

  )

}

function ColumnContent({
  processCode,
  tasks,
  expandedKey,
  onToggleCard,
  activeOverlayKey,
  onOverlayOpenChange,
}: ContentProps) {

  const { isMobile } = useResponsive()

  const columnScrollRef = useColumnScroll()

  return (

    <div className={cn(
      "flex shrink-0 flex-col",
      isMobile ? "w-full" : "h-full w-72 overflow-hidden",
    )}>

      <div
        ref={columnScrollRef}
        style={{ touchAction: "pan-y" }}
        className={cn(
          "hide-scrollbar overflow-x-hidden px-2 py-2",
          isMobile
            ? ""
            : "min-h-0 flex-1 overflow-y-auto overscroll-contain cursor-grab active:cursor-grabbing",
        )}
      >

        <div className="flex flex-col gap-2 pb-2">

          {tasks.map(task => {

            const key = `${task.id}:${processCode}`

            return (

              <TaskPipelineCard
                key={key}
                task={task}
                processCode={processCode}
                expanded={expandedKey === key}
                onToggle={() => onToggleCard(key)}
                overlayLocked={activeOverlayKey !== null && activeOverlayKey !== key}
                onOverlayOpenChange={(isOpen) => onOverlayOpenChange(key, isOpen)}
              />

            )

          })}

          {tasks.length === 0 && (

            <div className="flex h-12 items-center justify-center rounded-xl bg-white/2 px-3 text-sm font-medium text-neutral-500">
              Sin tareas
            </div>

          )}

        </div>

      </div>

    </div>

  )

}

type Props = SharedProps & {
  expandedKey: string | null
  onToggleCard: (key: string) => void
  activeOverlayKey: string | null
  onOverlayOpenChange: (key: string, isOpen: boolean) => void
  onCreateTask?: () => void
  headerOnly?: boolean
  contentOnly?: boolean
}

export function TaskProcessColumn({
  processCode,
  tasks,
  expandedKey,
  onToggleCard,
  activeOverlayKey,
  onOverlayOpenChange,
  headerOnly = false,
  contentOnly = false,
}: Props) {

  if (headerOnly) {
    return <ColumnHeader processCode={processCode} tasks={tasks} />
  }

  if (contentOnly) {
    return (
      <ColumnContent
        processCode={processCode}
        tasks={tasks}
        expandedKey={expandedKey}
        onToggleCard={onToggleCard}
        activeOverlayKey={activeOverlayKey}
        onOverlayOpenChange={onOverlayOpenChange}
      />
    )
  }

  return (

    <section className="flex h-full min-h-0 w-72 shrink-0 flex-col overflow-hidden">

      <ColumnHeader processCode={processCode} tasks={tasks} />

      <ColumnContent
        processCode={processCode}
        tasks={tasks}
        expandedKey={expandedKey}
        onToggleCard={onToggleCard}
        activeOverlayKey={activeOverlayKey}
        onOverlayOpenChange={onOverlayOpenChange}
      />

    </section>

  )

}