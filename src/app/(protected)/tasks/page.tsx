"use client"

import { useSearchParams } from "next/navigation"
import { TaskActions } from "@/features/tasks/components/actions/task-actions"
import { TaskPageContent } from "@/features/tasks/components/task-page-content"
import { usePageTitle } from "@/shared/responsive/navigation/hooks/use-page-title"
import { PageShell } from "@/shared/responsive/layout/page-shell"
import { usePageActions } from "@/shared/responsive/navigation/hooks/use-page-actions"
import { useDeepLinkCapture } from "@/shared/hooks/use-deep-link-capture"
import { useDeepLinkRoute } from "@/shared/focus/deep-link-route"

export default function TasksPage() {
  usePageTitle("Tareas")
  usePageActions(<TaskActions />)
  useDeepLinkCapture()
  const taskId = useDeepLinkRoute(s => s.route?.taskId)
  const searchParams = useSearchParams()
  return (
    <PageShell mode="list">
      <section className="flex min-h-0 w-full flex-1 flex-col">
        <TaskPageContent
          focusedTaskId={taskId}
          initialShowHistory={searchParams.get("history") === "1"}
        />
      </section>
    </PageShell>
  )
}
