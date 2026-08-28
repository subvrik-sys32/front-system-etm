"use client"

import { notifyHistoryMode } from "@/shared/history/notify-history-mode"

import { useQueryClient } from "@tanstack/react-query"
import { useState, useEffect } from "react"

import { useResponsive } from "@/shared/responsive/hooks/use-responsive"
import { AppListScroll } from "@/shared/ui/vertical-scroll/app-list-scroll"
import { AdaptiveActionBar } from "@/shared/responsive/adaptative/adaptive-action-bar"
import { EntityExpandProvider } from "@/shared/ui/entity-table/features/expansion"
import { EntityToolbar } from "@/shared/ui/entity-toolbar/entity-toolbar"
import { EntityToolbarSearch } from "@/shared/ui/entity-toolbar/entity-toolbar-search"
import { usePageToolbar } from "@/shared/responsive/navigation/hooks/use-page-toolbar"
import { ExportMenu, type ExportScope } from "@/shared/export"
import { BackToProjectButton } from "@/features/projects/components/actions/back-to-project-button"
import { TaskTable } from "@/features/tasks/table"
import { FilterBar } from "@/shared/filter/components/filter-bar"
import { TaskSortButton } from "@/shared/sorting/components/task-sort-button"
import { HistoryToggleButton } from "@/shared/history/components/history-toggle-button"
import { TaskCreateDialAction } from "@/features/tasks/components/actions/task-actions"
import { isWorkflowCompleted } from "@/features/workflow/selectors/is-completed"
import { useTasks } from "@/features/tasks/hooks/use-tasks"
import { useTaskExport } from "@/features/reports/hooks/use-task-export"
import { REPORT_EXPORT_SCOPES } from "@/shared/export/constants/export-config"

type Props = {
  focusedTaskId?: string
  focusToken?: string
  initialShowHistory?: boolean
}

/** /tasks — solo vista lista/card. El kanban se eliminó. */
export function TaskPageContent({
  focusedTaskId,
  focusToken,
  initialShowHistory = false,
}: Props) {
  const queryClient = useQueryClient()
  const { isMobile } = useResponsive()
  const [search, setSearch] = useState("")
  const [showHistory, setShowHistory] = useState(initialShowHistory)

  useEffect(() => {
    if (initialShowHistory) notifyHistoryMode("tareas")
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const { tasks, loading, reorderTasks } = useTasks()
  const { exporting, exportPdf, exportExcel } = useTaskExport(tasks)

  const completedCount = tasks.filter(task =>
    isWorkflowCompleted(task.workflowSteps),
  ).length

  async function handleExport(format: "pdf" | "excel", scope: ExportScope) {
    if (exporting || tasks.length === 0) return
    if (format === "pdf") await exportPdf(scope)
    else await exportExcel(scope)
  }

  const toolbar = (
    <EntityToolbar
      variant={isMobile ? "page" : "chrome"}
      left={
        <AdaptiveActionBar
          pinned={
            <>
              <BackToProjectButton />
              <EntityToolbarSearch value={search} onChange={setSearch} />
              {isMobile && (
                <FilterBar module="tasks" showAddButton={false} />
              )}
            </>
          }
          actions={[
            <FilterBar
              key="filter"
              module="tasks"
              alwaysExpanded={isMobile}
              showChips={!isMobile}
            />,
            <TaskSortButton key="sort" />,
            <HistoryToggleButton
              key="history"
              count={completedCount}
              active={showHistory}
              onClick={() => {
                setShowHistory(v => {
                  const next = !v
                  if (next) notifyHistoryMode("tareas")
                  return next
                })
              }}
            />,
            <ExportMenu
              key="export"
              scopes={REPORT_EXPORT_SCOPES}
              onExport={handleExport}
            />,
            ...(isMobile ? [<TaskCreateDialAction key="create" />] : []),
          ]}
        />
      }
    />
  )

  usePageToolbar(isMobile ? null : toolbar)

  return (
    <div className="relative flex h-full min-h-0 w-full flex-col">
      <AppListScroll
      >
        {isMobile ? <div className="mb-1 shrink-0">{toolbar}</div> : null}
        <EntityExpandProvider>
          <TaskTable
            tasks={tasks}
            loading={loading}
            focusedTaskId={focusedTaskId}
            focusToken={focusToken}
            search={search}
            showHistory={showHistory}
            reorderTasks={reorderTasks}
            onHistoryRequired={() => {
              setShowHistory(true)
              notifyHistoryMode("tareas")
            }}
          />
        </EntityExpandProvider>
      </AppListScroll>
    </div>
  )
}
