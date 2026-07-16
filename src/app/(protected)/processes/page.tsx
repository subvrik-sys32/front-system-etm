"use client"

import { useSearchParams } from "next/navigation"

import {
  ProcessPageContent,
} from "@/features/processes/components/process-page-content"

import {
  getProcessDefinition,
} from "@/features/processes/selectors/get-process-definition"

import type {
  ProcessCode,
} from "@/features/tasks/types/task.types"

export default function ProcessPage() {

  const searchParams =
    useSearchParams()

  const taskId =
    searchParams.get("taskId") ?? undefined

  const focusToken =
    searchParams.get("focus") ?? undefined

  const initialShowHistory =
    searchParams.get("history") === "1"

  const codeParam =
    searchParams.get("code") ?? "ct"

  const processCode =
    codeParam.toUpperCase() as ProcessCode

  const process =
    getProcessDefinition(
      processCode,
    )

  return (

    // Mismo patrón que TasksPage/ProjectsPage: padding responsive
    // y sin overflow-hidden forzado — la contención real vive en
    // ProcessPageContent (isMobile deja que la página scrollee
    // normal, como el resto del ERP en mobile).
    <main className="flex h-full flex-col bg-[#050505] px-4 py-5 text-white select-none tablet:px-8 tablet:py-10">

      <header className="flex flex-wrap items-start justify-between gap-4">

        <div className="min-w-0">

          <h1 className="text-2xl font-bold tracking-widest">

            {process?.label.toUpperCase()}

          </h1>

          <p className="mt-2 text-sm text-neutral-500">

            Centro de gestión del proceso

          </p>

        </div>

        <div className="shrink-0" />

      </header>

      <section className="mt-4 flex-1 min-h-0 tablet:mt-6">

        <ProcessPageContent
          processCode={processCode}
          focusedTaskId={taskId}
          focusToken={focusToken}
          initialShowHistory={initialShowHistory}
        />

      </section>

    </main>

  )

}