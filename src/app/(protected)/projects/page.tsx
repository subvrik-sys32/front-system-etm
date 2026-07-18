"use client"

import { useSearchParams } from "next/navigation"

import {
  ProjectActions,
} from "@/features/projects/components/actions/project-actions"

import {
  ProjectPageContent,
} from "@/features/projects/components/project-page-content"

export default function ProjectsPage(){

  const searchParams =
    useSearchParams()

  const projectId =
    searchParams.get("projectId") ?? undefined

  return(

    <main className="flex flex-col bg-[#050505] px-4 py-5 text-white select-none tablet:px-8 tablet:py-10 tablet:h-full">

      <header className="flex flex-wrap items-start justify-between gap-4">

        {/*
          Título y descripción en la misma línea, separados por un
          punto — mismo tratamiento que TasksPage para no perder una
          línea entera de alto en mobile.
        */}
        <div className="flex min-w-0 flex-1 items-center gap-2">

          <h1 className="shrink-0 text-xl font-bold tracking-widest tablet:text-2xl">
            PROYECTOS
          </h1>

          <span className="hidden h-1 w-1 shrink-0 rounded-full bg-neutral-700 tablet:block" />

          <p className="min-w-0 truncate text-sm text-neutral-500">
            Gestión de proyectos
          </p>

        </div>

        <div className="shrink-0">

          <ProjectActions />

        </div>

      </header>

      <section className="mt-3 flex-1 min-h-0">

        <ProjectPageContent
          focusedProjectId={projectId}
        />

      </section>

    </main>

  )

}