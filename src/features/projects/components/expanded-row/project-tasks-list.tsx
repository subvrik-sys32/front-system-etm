"use client"

import { useMemo,useState } from "react"

import type { Task } from "@/features/tasks/types/task.types"

import { HorizontalScroll } from "@/shared/ui/horizontal-scroll/horizontal-scroll"

import { isWorkflowCompleted } from "@/features/workflow/selectors/is-completed"

import { ProjectTaskRow } from "./project-task-row"
import { ProjectTaskPlaceholder } from "./project-task-placeholder"
import { ProjectCompletedTasksCard } from "./project-completed-tasks-card"

import { TaskDialog } from "@/features/tasks/components/dialog/task-dialog"

type Props={
  projectId:string
  tasks:Task[]
}

const PRIORITY_ORDER={
  "priority-critical":0,
  "priority-high":1,
  "priority-medium":2,
  "priority-low":3,
} as const

export function ProjectTasksList({
  projectId,
  tasks,
}:Props){

  const[
    openTaskDialog,
    setOpenTaskDialog,
  ]=useState(false)

  const[
    showCompleted,
    setShowCompleted,
  ]=useState(false)

  const projectTasks=useMemo(
    ()=>tasks.filter(
      task=>task.project.id===projectId,
    ),
    [
      tasks,
      projectId,
    ],
  )

  const sortedTasks=useMemo(
    ()=>[...projectTasks].sort((a,b)=>{

      const priorityDiff=

        PRIORITY_ORDER[
          a.priority.id as keyof typeof PRIORITY_ORDER
        ]-

        PRIORITY_ORDER[
          b.priority.id as keyof typeof PRIORITY_ORDER
        ]

      if(priorityDiff!==0){

        return priorityDiff

      }

      const aDate=
        a.deliveryDate
          ?new Date(a.deliveryDate).getTime()
          :Number.MAX_SAFE_INTEGER

      const bDate=
        b.deliveryDate
          ?new Date(b.deliveryDate).getTime()
          :Number.MAX_SAFE_INTEGER

      return aDate-bDate

    }),
    [
      projectTasks,
    ],
  )

  const activeTasks=
    sortedTasks.filter(
      task=>
        !isWorkflowCompleted(
          task.workflowSteps,
        ),
    )

  const completedTasks=
    sortedTasks.filter(
      task=>
        isWorkflowCompleted(
          task.workflowSteps,
        ),
    )

  const visibleTasks=

    showCompleted

      ?[
          ...completedTasks,
          ...activeTasks,
        ]

      :activeTasks

  return(

    <div>

      <HorizontalScroll>

        <div className="w-72 shrink-0">

          <ProjectTaskPlaceholder
            onClick={()=>
              setOpenTaskDialog(true)
            }
          />

        </div>

        {completedTasks.length>0&&(

          <div className="w-72 shrink-0">

            <ProjectCompletedTasksCard
              completedCount={completedTasks.length}
              expanded={showCompleted}
              onClick={()=>
                setShowCompleted(v=>!v)
              }
            />

          </div>

        )}

        {visibleTasks.map(task=>(

          <div
            key={task.id}
            className={
              isWorkflowCompleted(task.workflowSteps)
                ?"w-72 shrink-0 opacity-75"
                :"w-72 shrink-0"
            }
          >

            <ProjectTaskRow
              task={task}
            />

          </div>

        ))}

      </HorizontalScroll>

      {openTaskDialog&&(

        <TaskDialog
          open
          projectId={projectId}
          promptOpenAfterCreate
          onClose={()=>
            setOpenTaskDialog(false)
          }
        />

      )}

    </div>

  )

}