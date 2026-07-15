"use client"

import { useSearchParams } from "next/navigation"

import {
  ProjectActions,
} from "@/features/projects/components/actions/project-actions"

import {
  ProjectPageContent,
} from "@/features/projects/components/project-page-content"

import { useResponsive } from "@/shared/responsive/hooks/use-responsive"
import { cn } from "@/shared/utils/utils"

export default function ProjectsPage(){

  const searchParams =
    useSearchParams()

  const projectId =
    searchParams.get("projectId") ?? undefined

  const { isMobile } = useResponsive()

  return(

    // Mismo esqueleto que TasksPage: padding progresivo (px-4/py-5
    // en mobile, px-8/py-10 desde tablet) y overflow-hidden SOLO en
    // desktop — en mobile el <main overflow-y-auto> del AppShell
    // es el que scrollea, forzar overflow-hidden acá lo bloqueaba.
    <main className={cn(
      "flex h-full flex-col bg-[#050505] px-4 py-5 text-white select-none tablet:px-8 tablet:py-10",
      isMobile ? "" : "overflow-hidden",
    )}>

      <header className="flex shrink-0 flex-wrap items-start justify-between gap-4">

        {/*
          Título y descripción en la misma línea (items-center),
          separados por un punto — mismo tratamiento que TasksPage
          para no perder una línea entera de alto en mobile.
        */}
        <div className="flex min-w-0 flex-1 items-center gap-2">

          <h1 className="shrink-0 text-2xl font-bold tracking-widest">
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

      <section className={cn(
        "mt-3 flex-1 min-h-0",
        isMobile ? "" : "overflow-hidden",
      )}>

        <ProjectPageContent
          focusedProjectId={projectId}
        />

      </section>

    </main>

  )

}