"use client"

import{
  useState,
}from"react"

import{
  EntityToolbar,
}from"@/shared/ui/entity-toolbar/entity-toolbar"

import{
  EntityToolbarSearch,
}from"@/shared/ui/entity-toolbar/entity-toolbar-search"

import{
  FilterBar,
}from"@/shared/filter/components/filter-bar"

import{
  EntityExpandProvider,
}from"@/shared/ui/entity-table/features/expansion"

import{
  ExportMenu,
}from"@/shared/export/components/export-menu"

import{
  PRODUCTION_EXPORT_SCOPES,
}from"@/shared/export/constants/export-config"

import type{
  ExportFormat,
  ExportScope,
}from"@/shared/export/types/export.types"

import{
  useTasks,
}from"@/features/tasks/hooks/use-tasks"

import type{
  ProcessCode,
}from"@/features/tasks/types/task.types"

import{
  BackToTaskButton,
}from"@/features/tasks/components/actions/back-to-task-button"

import{
  HistoryToggleButton,
}from"@/shared/history/components/history-toggle-button"

import{
  useProductionSheet,
}from"@/features/reports/hooks/use-production-sheet"

import{
  useProcesses,
}from"../hooks/use-processes"

import{
  ProcessTable,
}from"../table/process-table"

import { ActionDialog } from "@/shared/ui/dialogs/action-dialog/action-dialog"

import { History } from "lucide-react"

type Props={

  processCode:ProcessCode

  focusedTaskId?:string

  focusToken?:string

}

export function ProcessPageContent({

  processCode,

  focusedTaskId,

  focusToken,

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
  }=useTasks()

  const{
    processDefinition,
    processTasks,
  }=useProcesses({

    processCode,

    tasks,

  })

  const{

    exportPdf,

    exportExcel,

  }=useProductionSheet(

    processTasks,

    processCode,

  )

  const completedCount=
    processTasks.filter(
      task=>
        task.workflowStep?.status==="REVIEWED",
    ).length

  const isResolvingNotification = Boolean(focusedTaskId) && loading

  async function handleExport(

    format:ExportFormat,

    scope:ExportScope,

  ){

    if(
      scope!=="active"&&
      scope!=="history"
    ){

      return

    }

    if(format==="pdf"){

      await exportPdf(scope)

      return

    }

    await exportExcel(scope)

  }

  return(

    <div className="mx-auto w-full max-w-400">

      <EntityToolbar
        left={

          <div className="flex flex-wrap items-center gap-2 py-1 select-none">

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

            <ExportMenu
              scopes={
                PRODUCTION_EXPORT_SCOPES
              }
              onExport={
                handleExport
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
          focusToken={focusToken}
          showHistory={showHistory}
          onHistoryRequired={()=>setHistoryDialogOpen(true)}
        />

      </EntityExpandProvider>

      <ActionDialog
        open={historyDialogOpen}
        icon={History}
        title="Este proceso pertenece al historial"
        description="Para verlo debes mostrar los elementos históricos."
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