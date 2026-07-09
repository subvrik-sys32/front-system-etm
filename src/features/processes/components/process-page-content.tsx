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

import { History, Loader2 } from "lucide-react" // Loader2 nuevo

type Props={

  processCode:ProcessCode

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

  const isResolvingNotification = Boolean(focusedTaskId) && loading // nuevo

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
          showHistory={showHistory}
          onHistoryRequired={()=>setHistoryDialogOpen(true)}
        />

      </EntityExpandProvider>

      {isResolvingNotification && ( // nuevo
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl border border-white/10 bg-[#101012] px-4 py-3 text-sm text-white shadow-2xl">
          <Loader2 size={16} className="animate-spin text-neutral-400" />
          Buscando el proceso de la notificación...
        </div>
      )}

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