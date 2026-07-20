"use client"

import { useSearchParams } from "next/navigation"

import {
  ProjectActions,
} from "@/features/projects/components/actions/project-actions"

import {
  ProjectPageContent,
} from "@/features/projects/components/project-page-content"

import { usePageTitle } from "@/shared/responsive/navigation/hooks/use-page-title"

export default function ProjectsPage(){

  usePageTitle("Proyectos")

  const searchParams =
    useSearchParams()

  const projectId =
    searchParams.get("projectId") ?? undefined

  const focusToken =
    searchParams.get("focus") ?? undefined

  const initialShowHistory =
    searchParams.get("history") === "1"

  return(

    <main className="flex flex-col bg-[#050505] px-4 pt-3 pb-5 text-white select-none tablet:px-8 tablet:py-10 tablet:h-full">

      <header className="flex flex-wrap items-start justify-between gap-4">

        <div className="hidden min-w-0 flex-1 items-center gap-2 tablet:flex">

          <h1 className="shrink-0 text-xl font-bold tracking-widest tablet:text-2xl">
            PROYECTOS
          </h1>

          <span className="hidden h-1 w-1 shrink-0 rounded-full bg-neutral-700 tablet:block" />

          <p className="min-w-0 truncate text-sm text-neutral-500">
            Gestión de proyectos
          </p>

        </div>

        {/* Siempre montado (no dentro de un contenedor hidden):
            ProjectActions decide su propio render según breakpoint
            (botón normal en desktop, FAB fixed en mobile) — si
            quedara adentro de un padre con display:none, el FAB
            desaparecería junto con el título, porque un descendiente
            position:fixed no se pinta si un ancestro tiene
            display:none. */}
        <div className="shrink-0">

          <ProjectActions />

        </div>

      </header>

      <section className="mt-2 flex-1 min-h-0 tablet:mt-3">

        <ProjectPageContent
          focusedProjectId={projectId}
          focusToken={focusToken}
          initialShowHistory={initialShowHistory}
        />

      </section>

    </main>

  )

}