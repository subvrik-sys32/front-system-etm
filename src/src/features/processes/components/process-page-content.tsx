"use client"

import { useState } from "react"

import { useResponsive } from "@/shared/responsive/hooks/use-responsive"
import { cn } from "@/shared/utils/utils"

import { AdaptiveActionBar } from "@/shared/responsive/adaptative/adaptive-action-bar"

import { EntityToolbar } from "@/shared/ui/entity-toolbar/entity-toolbar"
import { EntityToolbarSearch } from "@/shared/ui/entity-toolbar/entity-toolbar-search"
import { FilterBar } from "@/shared/filter/components/filter-bar"
import { EntityExpandProvider } from "@/shared/ui/entity-table/features/expansion"
import { ExportMenu } from "@/shared/export/components/export-menu"
import { PRODUCTION_EXPORT_SCOPES } from "@/shared/export/constants/export-config"

import type {
  ExportFormat,
  ExportScope,
} from "@/shared/export/types/export.types"

import { useTasks } from "@/features/tasks/hooks/use-tasks"
import type { ProcessCode } from "@/features/tasks/types/task.types"

import { BackToTaskButton } from "@/features/tasks/components/actions/back-to-task-button"
import { HistoryToggleButton } from "@/shared/history/components/history-toggle-button"

import { useProductionSheet } from "@/features/reports/hooks/use-production-sheet"
import { useProcesses } from "../hooks/use-processes"
import { ProcessTable } from "../table/process-table"

type Props = {
  processCode: ProcessCode
  focusedTaskId?: string
  focusToken?: string
  initialShowHistory?: boolean
}

export function ProcessPageContent({
  processCode,
  focusedTaskId,
  focusToken,
  initialShowHistory = false,
}: Props) {

  const { isMobile } = useResponsive()

  const [search, setSearch] = useState("")
  const [showHistory, setShowHistory] =
    useState(initialShowHistory)

  const [resolvingFocus, setResolvingFocus] =
    useState(false)

  const {
    tasks,
    loading,
  } = useTasks()

  const {
    processDefinition,
    processTasks,
  } = useProcesses({
    processCode,
    tasks,
  })

  const {
    exportPdf,
    exportExcel,
  } = useProductionSheet(
    processTasks,
    processCode,
  )

  const completedCount =
    processTasks.filter(
      task =>
        task.workflowStep?.status === "REVIEWED",
    ).length

  const showResolvingOverlay =
    Boolean(focusedTaskId) &&
    resolvingFocus

  async function handleExport(
    format: ExportFormat,
    scope: ExportScope,
  ) {

    if (
      scope !== "active" &&
      scope !== "history"
    ) {
      return
    }

    if (format === "pdf") {
      await exportPdf(scope)
      return
    }

    await exportExcel(scope)

  }

  return (

    // Mismo patrón que Tareas/Proyectos: en desktop, contenedor fijo
    // con scroll interno acotado. En mobile, sin esas restricciones
    // — la página entera scrollea de forma natural.
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
                  <BackToTaskButton />

                  <EntityToolbarSearch
                    value={search}
                    onChange={setSearch}
                  />
                </>
              }
              actions={[
                <FilterBar key="filter" module="processes" />,
                <HistoryToggleButton
                  key="history"
                  count={completedCount}
                  active={showHistory}
                  onClick={() =>
                    setShowHistory(v => !v)
                  }
                />,
                <ExportMenu
                  key="export"
                  scopes={PRODUCTION_EXPORT_SCOPES}
                  onExport={handleExport}
                />,
              ]}
            />

          }
        />

      </div>

      <div className={cn(
        isMobile ? "" : "min-h-0 flex-1 overflow-hidden",
      )}>

        <EntityExpandProvider>

          <ProcessTable
            processDefinition={processDefinition}
            processTasks={processTasks}
            search={search}
            loading={loading}
            focusedTaskId={focusedTaskId}
            focusToken={focusToken}
            showHistory={showHistory}
            onHistoryRequired={() =>
              setShowHistory(true)
            }
            onResolvingChange={
              setResolvingFocus
            }
          />

        </EntityExpandProvider>

      </div>

      {showResolvingOverlay && (

        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
        />

      )}

    </div>

  )

}