"use client"

import { useMemo, useState } from "react"

import type { Task } from "@/features/tasks/types/task.types"

import { PipelineScroll } from "@/shared/ui/pipeline-scroll/pipeline-scroll"

import { PIPELINE_PROCESS_ORDER } from "../utils/process-columns"
import { getTaskProcesses } from "../utils/get-task-process"

import { TaskProcessColumn } from "../table/task-process-column"
import { TaskPipelineHeader } from "../table/task-pipeline-header"
import { TaskPipelineSkeleton } from "../components/task-pipeline-skeleton"

import { TaskDialog } from "@/features/tasks/components/dialog/task-dialog"

type Props = {
  tasks: Task[]
  kpiTasks: Task[]
  loading?: boolean
}

export function TaskPipelineBoard({
  tasks,
  kpiTasks,
  loading = false,
}: Props) {

  // Clave compuesta "taskId:processCode": como la misma tarea
  // puede aparecer en varias columnas a la vez, expandir en una
  // no debe expandir sus otras apariciones en el board.
  const [
    expandedKey,
    setExpandedKey,
  ] = useState<string | null>(null)

  const [
    openTaskDialog,
    setOpenTaskDialog,
  ] = useState(false)

  function toggleCard(key: string) {

    setExpandedKey(current =>
      current === key
        ? null
        : key,
    )

  }

  const columns = useMemo(() => {

    const grouped = new Map(
      PIPELINE_PROCESS_ORDER.map(
        code => [code, [] as Task[]],
      ),
    )

    for (const task of tasks) {

      const processes =
        getTaskProcesses(task)

      for (const process of processes) {

        grouped.get(process)?.push(task)

      }

    }

    return grouped

  }, [tasks])

  if (loading) {

    return <TaskPipelineSkeleton />

  }

  return (

    <div className="flex h-full min-h-0 flex-col overflow-hidden">

      <TaskPipelineHeader
        tasks={kpiTasks}
      />

      <div className="mt-4 flex min-h-0 flex-1 overflow-hidden">

        <PipelineScroll>

          {PIPELINE_PROCESS_ORDER.map(code => (

            <TaskProcessColumn
              key={code}
              processCode={code}
              tasks={columns.get(code) ?? []}
              expandedKey={expandedKey}
              onToggleCard={toggleCard}
              onCreateTask={() =>
                setOpenTaskDialog(true)
              }
            />

          ))}

        </PipelineScroll>

      </div>

      {openTaskDialog && (

        <TaskDialog
          open
          promptOpenAfterCreate
          onClose={() =>
            setOpenTaskDialog(false)
          }
        />

      )}

    </div>

  )

}