"use client"

import { useMemo, useState } from "react"

import type { Task } from "@/features/tasks/types/task.types"

import { HorizontalScroll } from "@/shared/ui/horizontal-scroll/horizontal-scroll"

import { PIPELINE_PROCESS_ORDER } from "../utils/process-columns"
import { getTaskProcesses } from "../utils/get-task-process"

import { TaskProcessColumn } from "../table/task-process-column"
import { TaskPipelineHeader } from "../table/task-pipeline-header"

type Props = {
  tasks: Task[]
  loading?: boolean
}

export function TaskPipelineBoard({
  tasks,
  loading = false,
}: Props) {

  const [
    expandedTaskId,
    setExpandedTaskId,
  ] = useState<string | null>(null)

  function toggleTask(taskId: string) {

    setExpandedTaskId(
      current =>
        current === taskId
          ? null
          : taskId,
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

    return (

      <div className="flex w-full items-center justify-center py-20 text-sm text-neutral-500">
        Cargando pipeline...
      </div>

    )

  }

  return (

    <div className="w-full">

      <TaskPipelineHeader
        tasks={tasks}
      />

      <HorizontalScroll fade={false}>

        {PIPELINE_PROCESS_ORDER.map(
          code => (

            <TaskProcessColumn
              key={code}
              processCode={code}
              tasks={columns.get(code) ?? []}
              expandedTaskId={expandedTaskId}
              onToggleTask={toggleTask}
            />

          ),
        )}

      </HorizontalScroll>

    </div>

  )

}