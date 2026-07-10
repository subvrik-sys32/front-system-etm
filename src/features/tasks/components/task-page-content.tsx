"use client"

import { useState } from "react"

import { EntityExpandProvider } from "@/shared/ui/entity-table/features/expansion"

import { EntityToolbar } from "@/shared/ui/entity-toolbar/entity-toolbar"
import { EntityToolbarSearch } from "@/shared/ui/entity-toolbar/entity-toolbar-search"

import {
  ExportMenu,
  type ExportScope,
} from "@/shared/export"

import { BackToProjectButton } from "@/features/projects/components/actions/back-to-project-button"

import { TaskTable } from "@/features/tasks/table"

import { FilterBar } from "@/shared/filter/components/filter-bar"

import { TaskSortButton } from "@/shared/sorting/components/task-sort-button"

import { HistoryToggleButton } from "@/shared/history/components/history-toggle-button"

import { isWorkflowCompleted } from "@/features/workflow/selectors/is-completed"

import { useTasks } from "@/features/tasks/hooks/use-tasks"

import { useTaskExport } from "@/features/reports/hooks/use-task-export"

import{ REPORT_EXPORT_SCOPES }from"@/shared/export/constants/export-config"

type Props={
  focusedTaskId?:string
  focusToken?:string
  initialShowHistory?:boolean
}

export function TaskPageContent({
  focusedTaskId,
  focusToken,
  initialShowHistory=false,
}:Props){

  const[
    search,
    setSearch,
  ]=useState("")

  const[
    showHistory,
    setShowHistory,
  ]=useState(initialShowHistory)

  const{
    tasks,
    loading,
    reorderTasks,
  }=useTasks()

  const{
    exporting,
    exportPdf,
    exportExcel,
  }=useTaskExport(
    tasks,
  )

  const completedCount=
    tasks.filter(
      task=>
        isWorkflowCompleted(
          task.workflowSteps,
        ),
    ).length

  async function handleExport(
    format:"pdf"|"excel",
    scope:ExportScope,
  ){

    if(
      exporting||
      tasks.length===0
    ){

      return

    }

    if(
      format==="pdf"
    ){

      await exportPdf(
        scope,
      )

      return

    }

    await exportExcel(
      scope,
    )

  }

  return(

    <div className="relative mx-auto w-full max-w-400">

      <EntityToolbar
        left={
          <div className="flex flex-wrap items-center gap-2 py-1 select-none">

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

            <ExportMenu
              scopes={REPORT_EXPORT_SCOPES}
              onExport={handleExport}
            />

          </div>
        }
      />

      <EntityExpandProvider>

        <TaskTable
          tasks={tasks}
          loading={loading}
          focusedTaskId={focusedTaskId}
          focusToken={focusToken}
          search={search}
          showHistory={showHistory}
          reorderTasks={reorderTasks}
          onHistoryRequired={()=>setShowHistory(true)}
        />

      </EntityExpandProvider>

    </div>

  )

}