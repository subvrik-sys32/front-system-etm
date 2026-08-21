"use client"

import { useSearchParams } from "next/navigation"

import { ProjectActions } from "@/features/projects/components/actions/project-actions"
import { ProjectPageContent } from "@/features/projects/components/project-page-content"
import { usePageTitle } from "@/shared/responsive/navigation/hooks/use-page-title"
import { usePageActions } from "@/shared/responsive/navigation/hooks/use-page-actions"
import { useResponsive } from "@/shared/responsive/hooks/use-responsive"
import { PageShell } from "@/shared/responsive/layout/page-shell"

export default function ProjectsPage() {
  usePageTitle("Proyectos")
  const { isMobile } = useResponsive()
  usePageActions(isMobile ? null : <ProjectActions />)

  const searchParams = useSearchParams()
  const projectId = searchParams.get("projectId") ?? undefined
  const focusToken = searchParams.get("focus") ?? undefined
  const initialShowHistory = searchParams.get("history") === "1"

  return (
    <PageShell mode="list">
      <section className="flex min-h-0 w-full flex-1 flex-col">
        <ProjectPageContent
          focusedProjectId={projectId}
          focusToken={focusToken}
          initialShowHistory={initialShowHistory}
        />
      </section>
    </PageShell>
  )
}