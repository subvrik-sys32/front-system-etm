"use client"

import { useSearchParams } from "next/navigation"

import { TaskActions } from "@/features/tasks/components/actions/task-actions"

import {
  TaskPageContent,
} from "@/features/tasks/components/task-page-content"

import { usePageTitle } from "@/shared/responsive/navigation/hooks/use-page-title"

export default function TasksPage() {

  usePageTitle("Tareas")

  const searchParams =
    useSearchParams()

  const taskId =
    searchParams.get("taskId") ?? undefined

  const focusToken =
    searchParams.get("focus") ?? undefined

  const initialShowHistory =
    searchParams.get("history") === "1"

  return (

    <main className="flex flex-col bg-[#050505] px-4 pt-3 pb-5 text-white select-none tablet:px-8 tablet:py-10 tablet:h-full">

      <header className="flex flex-wrap items-start justify-between gap-4">

        {/*
          Título y descripción en la misma línea (items-baseline),
          separados por un punto — en vez de título arriba +
          descripción en su propia línea debajo. Eso liberaba una
          línea entera de alto que en mobile competía con el
          espacio del pipeline. min-w-0 + truncate en la descripción
          para que en pantallas angostas se corte en vez de forzar
          un wrap que vuelva a sumar altura.
        */}
        <div className="hidden min-w-0 flex-1 items-center gap-2 tablet:flex">

          <h1 className="shrink-0 text-xl font-bold tracking-widest tablet:text-2xl">
            TAREAS
          </h1>

          <span className="hidden h-1 w-1 shrink-0 rounded-full bg-neutral-700 tablet:block" />

          <p className="min-w-0 truncate text-sm text-neutral-500">
            Gestión de tareas y procesos
          </p>

        </div>

        {/* Siempre montado: TaskActions decide su propio render
            según breakpoint (botón normal en desktop, FAB fixed en
            mobile) — adentro de un padre hidden, el FAB no se
            pintaría en mobile. */}
        <div className="shrink-0">

          <TaskActions />

        </div>

      </header>

      <section className="mt-2 flex-1 min-h-0 tablet:mt-3">

        <TaskPageContent
          focusedTaskId={taskId}
          focusToken={focusToken}
          initialShowHistory={initialShowHistory}
        />

      </section>

    </main>

  )

}