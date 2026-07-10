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

    <main className="h-full bg-[#050505] px-8 py-10 text-white select-none">

      <section className="space-y-6">

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