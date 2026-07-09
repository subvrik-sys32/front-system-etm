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

import { ActionDialog } from "@/shared/ui/dialogs/action-dialog/action-dialog"
import { History, Loader2 } from "lucide-react" // Loader2 nuevo

import { isWorkflowCompleted } from "@/features/workflow/selectors/is-completed"

import { useTasks } from "@/features/tasks/hooks/use-tasks"

import { useTaskExport } from "@/features/reports/hooks/use-task-export"

import{ REPORT_EXPORT_SCOPES }from"@/shared/export/constants/export-config"

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

  const[
    historyDialogOpen,
    setHistoryDialogOpen,
  ]=useState(false)

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

  const isResolvingNotification = Boolean(focusedTaskId) && loading // nuevo

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

    <div className="mx-auto w-full max-w-400">

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
          search={search}
          showHistory={showHistory}
          reorderTasks={reorderTasks}
          onHistoryRequired={()=>setHistoryDialogOpen(true)}
        />

      </EntityExpandProvider>

      {isResolvingNotification && ( // nuevo
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl border border-white/10 bg-[#101012] px-4 py-3 text-sm text-white shadow-2xl">
          <Loader2 size={16} className="animate-spin text-neutral-400" />
          Buscando la tarea de la notificación...
        </div>
      )}

      <ActionDialog
        open={historyDialogOpen}
        icon={History}
        title="Esta tarea pertenece al historial"
        description="Para verla debes mostrar los elementos históricos."
        confirmLabel="Mostrar historial"
        cancelLabel="Cancelar"
        onClose={()=>setHistoryDialogOpen(false)}
        onConfirm={()=>{
          setShowHistory(true)
          setHistoryDialogOpen(false)
        }}
      />

    </div>

  )

}