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

    // Antes: h-full sin overflow, y <section> con space-y-6 (no es
    // un contenedor flex, no acota altura). El exceso de altura de
    // la tabla no tenía dónde ser contenido. Ahora: mismo esqueleto
    // que TasksPage — flex-col, header shrink-0, contenido flex-1
    // min-h-0 overflow-hidden.
    <main className="flex h-full flex-col overflow-hidden bg-[#050505] px-8 py-10 text-white select-none">

      <header className="flex shrink-0 flex-wrap items-start justify-between gap-4">

        <div className="min-w-0">

          <h1 className="text-2xl font-bold tracking-widest">

            PROYECTOS

          </h1>

          <p className="mt-2 text-sm text-neutral-500">

            Centro de gestión de proyectos

          </p>

        </div>

        <div className="shrink-0">

          <ProjectActions />

        </div>

      </header>

      <section className="mt-6 min-h-0 flex-1 overflow-hidden">

        <ProjectPageContent
          focusedProjectId={projectId}
        />

      </section>

    </main>

  )

}