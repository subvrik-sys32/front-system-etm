"use client"

import { useSearchParams } from "next/navigation"

import { ProjectActions } from "@/features/projects/components/actions/project-actions"
import { ProjectPageContent } from "@/features/projects/components/project-page-content"
import { usePageTitle } from "@/shared/responsive/navigation/hooks/use-page-title"
import { usePageActions } from "@/shared/responsive/navigation/hooks/use-page-actions"

export default function ProjectsPage() {
  usePageTitle("Proyectos")
  usePageActions(<ProjectActions />)

  const searchParams = useSearchParams()
  const projectId = searchParams.get("projectId") ?? undefined
  const focusToken = searchParams.get("focus") ?? undefined
  const initialShowHistory = searchParams.get("history") === "1"

  return (
    <main className="flex h-full min-h-0 flex-col bg-background px-3 pt-0 pb-2 text-foreground select-none tablet:px-4 desktop:px-5 desktop:pt-1 desktop:pb-3">

      <section className="flex min-h-0 w-full flex-1 flex-col">
        <ProjectPageContent
          focusedProjectId={projectId}
          focusToken={focusToken}
          initialShowHistory={initialShowHistory}
        />
      </section>
    </main>
  )
}