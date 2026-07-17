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

    <main className="flex flex-col bg-[#050505] px-4 py-5 text-white select-none tablet:px-8 tablet:py-10 laptop:h-full">

      <header className="flex flex-wrap items-start justify-between gap-4">

        <div className="flex min-w-0 flex-1 items-center gap-2">

          <h1 className="shrink-0 text-xl font-bold tracking-widest tablet:text-2xl">

            {process?.label.toUpperCase()}

          </h1>

          <span className="hidden h-1 w-1 shrink-0 rounded-full bg-neutral-700 tablet:block" />

          <p className="min-w-0 truncate text-sm text-neutral-500">

            Centro de gestión del proceso

          </p>

        </div>

        {/* Reserva exactamente el espacio del botón sin renderizarlo */}
        <div
          aria-hidden
          className="h-10 w-10 shrink-0"
        />

      </header>

      <section className="mt-3 min-h-0 flex-1">

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