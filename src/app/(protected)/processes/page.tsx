"use client"

import { useSearchParams } from "next/navigation"

import { ProcessPageContent } from "@/features/processes/components/process-page-content"
import { getProcessDefinition } from "@/features/processes/selectors/get-process-definition"
import type { ProcessCode } from "@/features/tasks/types/task.types"
import { usePageTitle } from "@/shared/responsive/navigation/hooks/use-page-title"
import { PageShell } from "@/shared/responsive/layout/page-shell"

export default function ProcessPage() {
  const searchParams = useSearchParams()

  const taskId = searchParams.get("taskId") ?? undefined
  const focusToken = searchParams.get("focus") ?? undefined
  const initialShowHistory = searchParams.get("history") === "1"
  const codeParam = searchParams.get("code") ?? "ct"
  const processCode = codeParam.toUpperCase() as ProcessCode
  const process = getProcessDefinition(processCode)

  usePageTitle(process?.label ?? "Proceso")

  return (
    <PageShell mode="list">
      <section className="flex min-h-0 w-full flex-1 flex-col">
        <ProcessPageContent
          processCode={processCode}
          focusedTaskId={taskId}
          focusToken={focusToken}
          initialShowHistory={initialShowHistory}
        />
      </section>
    </PageShell>
  )
}