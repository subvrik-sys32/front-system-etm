"use client"

import { ArrowRight } from "lucide-react"

import { ENTITY_ICONS } from "@/shared/constants/entity-icons"
import { PROCESS_DEFINITIONS } from "@/features/processes/constants/process-definitions"
import type { ProcessCode, Task } from "@/features/tasks/types/task.types"
import { getBadgeColors } from "@/shared/utils/badge-colors"
import { TaskPipelineCard } from "../components/task-pipeline-card"
import { TaskColumnOperator } from "../components/task-column-operator"
import { useColumnScroll } from "../hooks/use-column-scroll"
import { getTaskProcesses } from "../utils/get-task-process"
import { getNextIncludedProcess } from "../utils/get-next-process"
import { useResponsive } from "@/shared/responsive/hooks/use-responsive"
import { cn } from "@/lib/utils"

type SharedProps = {
  processCode: ProcessCode
  tasks: Task[]
  // Orden maestro de TODAS las tareas del board (sin filtrar por
  // proceso). Cuando se pasa, el contenido de la columna deja de
  // armarse solo con "tasks" (que ya viene filtrado a las tareas
  // que SÍ pasan por este proceso) y en cambio recorre este orden
  // completo, insertando un placeholder mudo donde una tarea no
  // pasa por acá — así la fila N es la misma tarea en todas las
  // columnas del pipeline (desktop) o mantiene la misma numeración
  // entre procesos (mobile), en vez de desalinearse cada vez que
  // una tarea se salta un proceso (ver TaskPipelineBoard).
  allTasks?: Task[]
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
  allTasks,
  expandedKey,
  onToggleCard,
  activeOverlayKey,
  onOverlayOpenChange,
}: ContentProps) {

  const { isMobile } = useResponsive()

  const columnScrollRef = useColumnScroll()

  // allTasks: recorremos el orden completo del board (no solo las
  // tareas filtradas a este proceso) y marcamos cuáles pasan por
  // acá, para insertar un placeholder mudo en el resto y mantener
  // las filas alineadas — tanto en desktop (columnas lado a lado)
  // como en mobile (una columna a la vez, pero con la misma
  // numeración de fila que tendría en desktop). Sin allTasks, cae
  // al comportamiento anterior: todas las tareas de "tasks" se
  // consideran incluidas.
  const rows = allTasks
    ? allTasks.map(task => ({
        task,
        included: getTaskProcesses(task).includes(processCode),
      }))
    : tasks.map(task => ({ task, included: true }))

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

          {rows.map(({ task, included }) => {

            const key = `${task.id}:${processCode}`

            if (!included) {

              const nextProcess =
                getNextIncludedProcess(task, processCode)

              const nextDefinition =
                nextProcess
                  ? PROCESS_DEFINITIONS[nextProcess]
                  : null

              const NextIcon =
                nextDefinition
                  ? ENTITY_ICONS[nextDefinition.icon]
                  : null

              const nextBadge =
                nextDefinition
                  ? getBadgeColors(nextDefinition.color, "subtle")
                  : null

              const noApplyBadge =
                getBadgeColors("#64748B", "subtle")

              return (

                <div
                  key={key}
                  className="flex h-12 shrink-0 items-center gap-2 rounded-xl bg-white/2 px-3"
                >

                  <span className="shrink-0 text-sm font-semibold text-neutral-600">
                    #{String(task.taskNumber).padStart(3, "0")}
                  </span>

                  <span
                    className="size-1.5 shrink-0 rounded-full opacity-40"
                    style={{ backgroundColor: task.priority.color }}
                  />

                  <span
                    title={task.reference}
                    className="min-w-0 flex-1 truncate text-sm font-medium text-neutral-600"
                  >
                    {task.reference}
                  </span>

                  <div className="ml-auto flex shrink-0 items-center gap-1.5">

                    {/*
                      Slot de ancho fijo para la flecha — SIEMPRE
                      ocupa este espacio, tenga o no ícono adentro.
                      Sin esto, el chip/badge que sigue arranca en una
                      posición distinta según haya o no próximo
                      proceso (con flecha se corre a la izquierda, sin
                      ella queda solo, "desplazado" respecto a las
                      demás filas). Reservando el ancho, el badge
                      siempre empieza en el mismo punto.
                    */}
                    <span className="flex w-4 shrink-0 items-center justify-center">

                      {nextDefinition && (

                        <ArrowRight
                          size={13}
                          className="text-neutral-700"
                        />

                      )}

                    </span>

                    {nextDefinition && nextBadge ? (

                      <span
                        className="inline-flex shrink-0 items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm font-semibold"
                        style={{
                          color: nextBadge.text,
                          backgroundColor: nextBadge.background,
                        }}
                      >

                        {NextIcon && <NextIcon size={15} />}

                        <span>{nextProcess}</span>

                      </span>

                    ) : (

                      // Mismo estilo exacto que el badge de estado
                      // "En cola" de TaskPipelineCardCompact (h-5,
                      // rounded-md, texto gris #64748B) — no un
                      // simple guion suelto sin contexto.
                      <span
                        className="flex h-5 shrink-0 items-center whitespace-nowrap rounded-md px-2 text-xs font-semibold leading-none"
                        style={{
                          color: noApplyBadge.text,
                          backgroundColor: noApplyBadge.background,
                        }}
                      >
                        No aplica
                      </span>

                    )}

                  </div>

                </div>

              )

            }

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

          {rows.length === 0 && (

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
  allTasks,
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
        allTasks={allTasks}
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
        allTasks={allTasks}
        expandedKey={expandedKey}
        onToggleCard={onToggleCard}
        activeOverlayKey={activeOverlayKey}
        onOverlayOpenChange={onOverlayOpenChange}
      />

    </section>

  )

}