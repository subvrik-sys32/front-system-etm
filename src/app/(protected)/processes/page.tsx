"use client"

import { useSearchParams } from "next/navigation"

import { ProcessPageContent } from "@/features/processes/components/process-page-content"
import { getProcessDefinition } from "@/features/processes/selectors/get-process-definition"
import type { ProcessCode } from "@/features/tasks/types/task.types"
import { usePageTitle } from "@/shared/responsive/navigation/hooks/use-page-title"

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
    <main className="flex h-full min-h-0 flex-col bg-background px-3 pt-0 pb-2 text-foreground select-none tablet:px-4 desktop:px-5 desktop:pt-1 desktop:pb-3">
      {/* Título en DesktopTopBar (pill). */}

      <section className="flex min-h-0 w-full flex-1 flex-col">
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