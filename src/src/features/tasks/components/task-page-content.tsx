"use client"

import { useState } from "react"

import { useResponsive } from "@/shared/responsive/hooks/use-responsive"
import { cn } from "@/shared/utils/utils"

import { AdaptiveActionBar } from "@/shared/responsive/adaptative/adaptive-action-bar"

import { EntityExpandProvider } from "@/shared/ui/entity-table/features/expansion"

import { EntityToolbar } from "@/shared/ui/entity-toolbar/entity-toolbar"
import { EntityToolbarSearch } from "@/shared/ui/entity-toolbar/entity-toolbar-search"

import {
  ExportMenu,
  type ExportScope,
} from "@/shared/export"

import { BackToProjectButton } from "@/features/projects/components/actions/back-to-project-button"

import { TaskTable } from "@/features/tasks/table"

import {
  TaskPipelineBoard,
  TaskViewToggle,
  useTaskView,
  usePipelineTasks,
} from "@/features/tasks/pipeline"

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

  const { isMobile } = useResponsive()

  const[
    search,
    setSearch,
  ]=useState("")

  const[
    showHistory,
    setShowHistory,
  ]=useState(initialShowHistory)

  const{
    view,
    setView,
  }=useTaskView()

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

  const {
    boardTasks: pipelineTasks,
    kpiTasks: pipelineKpiTasks,
  } = usePipelineTasks({
    tasks,
    search,
    showHistory,
  })

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

    // Desktop: h-full/min-h-0/overflow-hidden — una sola pantalla,
    // solo la tabla/pipeline internos scrollean (patrón app fija).
    // Mobile: SIN esas restricciones — el contenido fluye con su
    // alto real y el <main overflow-y-auto> del AppShell lo scrollea
    // como una página normal. Forzar overflow-hidden acá bloqueaba
    // ese scroll del padre, cortando el contenido sin dar forma
    // de alcanzarlo (el bug que viste en la captura).
    <div className={cn(
      "relative mx-auto flex w-full max-w-400 flex-col",
      isMobile ? "" : "h-full min-h-0 overflow-hidden",
    )}>

      <div className="shrink-0">

        <EntityToolbar
          left={

            <AdaptiveActionBar
              pinned={
                <>
                  <BackToProjectButton/>

                  <EntityToolbarSearch
                    value={search}
                    onChange={setSearch}
                  />
                </>
              }
              actions={[
                <FilterBar key="filter" module="tasks" />,
                <TaskSortButton key="sort" />,
                <HistoryToggleButton
                  key="history"
                  count={completedCount}
                  active={showHistory}
                  onClick={()=>
                    setShowHistory(
                      value=>!value,
                    )
                  }
                />,
                <ExportMenu
                  key="export"
                  scopes={REPORT_EXPORT_SCOPES}
                  onExport={handleExport}
                />,
              ]}
              right={

                !isMobile && (

                  <TaskViewToggle
                    value={view}
                    onChange={setView}
                  />

                )

              }
            />

          }
        />

      </div>

      {view==="table"?(

        <div className={cn(
          isMobile ? "" : "min-h-0 flex-1 overflow-hidden",
        )}>

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

      ):(

        <div className={cn(
          isMobile ? "" : "min-h-0 flex-1 overflow-hidden",
        )}>

          <TaskPipelineBoard
            tasks={pipelineTasks}
            kpiTasks={pipelineKpiTasks}
            loading={loading}
          />

        </div>

      )}

    </div>

  )

}