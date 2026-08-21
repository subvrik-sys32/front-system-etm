"use client"

import { usePageTitle } from "@/shared/responsive/navigation/hooks/use-page-title"
import { useResponsive } from "@/shared/responsive/hooks/use-responsive"
import { TaskAreaSidebar } from "@/features/tasks/pipeline/components/panel/task-area-sidebar"

/** Asignación — bottom nav móvil apunta aquí (/production). */
export default function AssignmentPage() {
  usePageTitle("Asignación")
  const { isMobile } = useResponsive()

  return (
    <main className="relative flex h-full min-h-0 flex-col bg-background px-2 pt-0 pb-1 text-foreground select-none tablet:px-4 desktop:px-5 desktop:pt-1 desktop:pb-3">
      {/* Título en DesktopTopBar (pill). */}

      {/*
        TaskAreaSidebar monta AppListScroll internamente:
        - móvil: scroller de página (padding chrome + PTR)
        - desktop: panel con scroll propio
      */}
      <TaskAreaSidebar className="min-h-0 flex-1" />
    </main>
  )
}
