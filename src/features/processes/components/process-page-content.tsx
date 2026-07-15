"use client"

import { useState } from "react"

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

    // Mismo fix que Proyectos/Tareas: cadena flex-col + min-h-0 +
    // overflow-hidden en la raíz, para que EntityTable (ahora con
    // h-full) reciba la altura real disponible en vez de escaparse
    // hacia el documento.
    <div className="relative mx-auto flex h-full min-h-0 w-full max-w-400 flex-col overflow-hidden">

      <div className="shrink-0">

        <EntityToolbar
          left={
            <div className="flex flex-wrap items-center gap-2 py-1 select-none">

              <BackToTaskButton />

              <EntityToolbarSearch
                value={search}
                onChange={setSearch}
              />

              <FilterBar module="processes" />

              <HistoryToggleButton
                count={completedCount}
                active={showHistory}
                onClick={() =>
                  setShowHistory(v => !v)
                }
              />

              <ExportMenu
                scopes={PRODUCTION_EXPORT_SCOPES}
                onExport={handleExport}
              />

            </div>
          }
        />

      </div>

      <div className="min-h-0 flex-1 overflow-hidden">

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