"use client"

import {
  useState,
} from "react"

import {
  EntityToolbar,
} from "@/shared/ui/entity-toolbar/entity-toolbar"

import {
  EntityToolbarSearch,
} from "@/shared/ui/entity-toolbar/entity-toolbar-search"

import {
  FilterBar,
} from "@/shared/filter/components/filter-bar"

import {
  EntityExpandProvider,
} from "@/shared/ui/entity-table/features/expansion"

import {
  useTasks,
} from "@/features/tasks/hooks/use-tasks"

import {
  useProcesses,
} from "../hooks/use-processes"

import {
  ProcessTable,
} from "../table/process-table"

import {
  BackToTaskButton,
} from "@/features/tasks/components/actions/back-to-task-button"

import {
  TaskSortButton,
} from "@/shared/sorting/components/task-sort-button"

import {
  HistoryToggleButton,
} from "@/shared/history/components/history-toggle-button"

type Props={
  processCode:string
  focusedTaskId?:string
}

export function ProcessPageContent({
  processCode,
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
  }=useTasks()

  const{
    processDefinition,
    processTasks,
  }=useProcesses({
    processCode,
    tasks,
  })

  const completedCount =
    processTasks.filter(
      task => task.workflowStep?.status === "REVIEWED",
    ).length

  return(

    <div className="mx-auto w-full max-w-400">

      <EntityToolbar
        left={
          <div className="flex flex-wrap items-center gap-2 py-1">

            <BackToTaskButton/>

            <EntityToolbarSearch
              value={search}
              onChange={setSearch}
            />

            <FilterBar
              module="processes"
            />

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

        <ProcessTable
          processDefinition={processDefinition}
          processTasks={processTasks}
          search={search}
          loading={loading}
          focusedTaskId={focusedTaskId}
          showHistory={showHistory}
        />

      </EntityExpandProvider>

    </div>

  )

}