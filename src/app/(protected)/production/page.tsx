"use client"

import { usePageTitle } from "@/shared/responsive/navigation/hooks/use-page-title"
import { PageShell } from "@/shared/responsive/layout/page-shell"
import { TaskAreaSidebar } from "@/features/tasks/pipeline/components/panel/task-area-sidebar"

/** Asignación — bottom nav móvil apunta aquí (/production). */
export default function AssignmentPage() {
  usePageTitle("Asignación")

  return (
    <PageShell mode="list" className="px-2 pb-1">
      {/* Título en DesktopTopBar (pill). */}

      {/*
        TaskAreaSidebar monta AppListScroll internamente:
        - móvil: scroller de página (padding chrome + PTR)
        - desktop: panel con scroll propio
      */}
      <TaskAreaSidebar className="min-h-0 flex-1" />
    </PageShell>
  )
}
