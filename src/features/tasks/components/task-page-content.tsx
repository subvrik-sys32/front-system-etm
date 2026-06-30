"use client"

import { useState } from "react"

import { EntityExpandProvider } from "@/shared/ui/entity-table/features/expansion"

import { EntityToolbar } from "@/shared/ui/entity-toolbar/entity-toolbar"
import { EntityToolbarSearch } from "@/shared/ui/entity-toolbar/entity-toolbar-search"

import { BackToProjectButton } from "@/features/projects/components/actions/back-to-project-button"

import { TaskTable } from "@/features/tasks/table"

import { FilterBar } from "@/shared/filter/components/filter-bar"

import { TaskSortButton } from "@/shared/sorting/components/task-sort-button"

import { HistoryToggleButton } from "@/shared/history/components/history-toggle-button"

import { isWorkflowCompleted } from "@/features/workflow/selectors/is-completed"

import { useTasks } from "@/features/tasks/hooks/use-tasks"

type Props={
  focusedTaskId?:string
}

export function TaskPageContent({
  focusedTaskId,
}:Props){

  const[
    search,
    setSearch,
  ]=useState("")

  const[
    showHistory,
    setShowHistory,
  ]=useState(false)

  const{
    tasks,
    loading,
    reorderTasks,
  }=useTasks()

  const completedCount=
    tasks.filter(
      task=>
        isWorkflowCompleted(
          task.workflowSteps,
        ),
    ).length

  return(

    <div className="mx-auto w-full max-w-400">

      <EntityToolbar
        left={
          <div className="flex flex-wrap items-center gap-2 py-1">

            <BackToProjectButton/>

            <EntityToolbarSearch
              value={search}
              onChange={setSearch}
            />

            <FilterBar
              module="tasks"
            />

            <TaskSortButton/>

            <HistoryToggleButton
              count={completedCount}
              active={showHistory}
              onClick={()=>
                setShowHistory(
                  value=>!value,
                )
              }
            />

          </div>
        }
      />

      <EntityExpandProvider>

        <TaskTable
          tasks={tasks}
          loading={loading}
          focusedTaskId={focusedTaskId}
          search={search}
          showHistory={showHistory}
          reorderTasks={reorderTasks}
        />

      </EntityExpandProvider>

    </div>

  )

}