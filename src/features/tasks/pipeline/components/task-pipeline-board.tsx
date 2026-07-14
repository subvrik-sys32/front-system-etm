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

  const [
    expandedTaskId,
    setExpandedTaskId,
  ] = useState<string | null>(null)

  const [
    openTaskDialog,
    setOpenTaskDialog,
  ] = useState(false)

  function toggleTask(taskId: string) {

    setExpandedTaskId(current =>
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
              expandedTaskId={expandedTaskId}
              onToggleTask={toggleTask}
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