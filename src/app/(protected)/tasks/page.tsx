"use client"

import { useSearchParams } from "next/navigation"

import { TaskActions } from "@/features/tasks/components/actions/task-actions"

import {
  TaskPageContent,
} from "@/features/tasks/components/task-page-content"

export default function TasksPage() {

  const searchParams =
    useSearchParams()

  const taskId =
    searchParams.get("taskId") ?? undefined

  const focusToken =
    searchParams.get("focus") ?? undefined

  const initialShowHistory =
    searchParams.get("history") === "1"

  return (

    <main className="flex h-full flex-col bg-[#050505] px-4 py-5 text-white select-none tablet:px-8 tablet:py-10">

      <header className="flex flex-wrap items-start justify-between gap-4">

        <div className="min-w-0">

          <h1 className="text-2xl font-bold tracking-widest">
            TAREAS
          </h1>

          <p className="mt-2 text-sm text-neutral-500">
            Gestión de tareas y procesos
          </p>

        </div>

        <div className="shrink-0">

          <TaskActions />

        </div>

      </header>

      <section className="mt-4 flex-1 min-h-0 tablet:mt-6">

        <TaskPageContent
          focusedTaskId={taskId}
          focusToken={focusToken}
          initialShowHistory={initialShowHistory}
        />

      </section>

    </main>

  )

}