"use client"

import { useSearchParams } from "next/navigation"

import { TaskActions } from "@/features/tasks/components/actions/task-actions"
import { TaskPageContent } from "@/features/tasks/components/task-page-content"
import { usePageTitle } from "@/shared/responsive/navigation/hooks/use-page-title"
import { PageShell } from "@/shared/responsive/layout/page-shell"
import { usePageActions } from "@/shared/responsive/navigation/hooks/use-page-actions"

export default function TasksPage() {
  usePageTitle("Tareas")
  usePageActions(<TaskActions />)

  const searchParams = useSearchParams()
  const taskId = searchParams.get("taskId") ?? undefined
  const focusToken = searchParams.get("focus") ?? undefined
  const initialShowHistory = searchParams.get("history") === "1"

  return (
    <PageShell mode="list">

      <section className="flex min-h-0 w-full flex-1 flex-col">
        <TaskPageContent
          focusedTaskId={taskId}
          focusToken={focusToken}
          initialShowHistory={initialShowHistory}
        />
      </section>
    </PageShell>
  )
}