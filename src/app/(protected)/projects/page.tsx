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

    <main className="h-full bg-[#050505] px-8 py-10 text-white">

      <section className="space-y-6">

        <header className="flex flex-wrap items-start justify-between gap-4">

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

        <ProjectPageContent
          focusedProjectId={projectId}
        />

      </section>

    </main>

  )

}