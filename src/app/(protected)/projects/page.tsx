"use client"

import { useSearchParams } from "next/navigation"
import { ProjectActions } from "@/features/projects/components/actions/project-actions"
import { ProjectPageContent } from "@/features/projects/components/project-page-content"
import { usePageTitle } from "@/shared/responsive/navigation/hooks/use-page-title"
import { usePageActions } from "@/shared/responsive/navigation/hooks/use-page-actions"
import { useResponsive } from "@/shared/responsive/hooks/use-responsive"
import { PageShell } from "@/shared/responsive/layout/page-shell"
import { useDeepLinkCapture } from "@/shared/hooks/use-deep-link-capture"
import { useDeepLinkRoute } from "@/shared/focus/deep-link-route"

export default function ProjectsPage() {
  usePageTitle("Proyectos")
  const { isMobile } = useResponsive()
  usePageActions(isMobile ? null : <ProjectActions />)
  useDeepLinkCapture()
  const projectId = useDeepLinkRoute(s => s.route?.projectId)
  const searchParams = useSearchParams()
  return (
    <PageShell mode="list">
      <section className="flex min-h-0 w-full flex-1 flex-col">
        <ProjectPageContent
          focusedProjectId={projectId}
          initialShowHistory={searchParams.get("history") === "1"}
        />
      </section>
    </PageShell>
  )
}
