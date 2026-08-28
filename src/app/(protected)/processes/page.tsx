"use client"

import { useSearchParams } from "next/navigation"
import { ProcessPageContent } from "@/features/processes/components/process-page-content"
import { getProcessDefinition } from "@/features/processes/selectors/get-process-definition"
import type { ProcessCode } from "@/features/tasks/types/task.types"
import { usePageTitle } from "@/shared/responsive/navigation/hooks/use-page-title"
import { PageShell } from "@/shared/responsive/layout/page-shell"
import { useDeepLinkCapture } from "@/shared/hooks/use-deep-link-capture"
import { useDeepLinkRoute } from "@/shared/focus/deep-link-route"

export default function ProcessPage() {
  const searchParams = useSearchParams()
  useDeepLinkCapture()
  const taskId = useDeepLinkRoute(s => s.route?.taskId)
  const codeParam = searchParams.get("code") ?? "ct"
  const processCode = codeParam.toUpperCase() as ProcessCode
  const process = getProcessDefinition(processCode)
  usePageTitle(process?.label ?? "Proceso")
  return (
    <PageShell mode="list">
      <section className="flex min-h-0 w-full flex-1 flex-col">
        <ProcessPageContent
          key={processCode}
          processCode={processCode}
          focusedTaskId={taskId}
          initialShowHistory={searchParams.get("history") === "1"}
        />
      </section>
    </PageShell>
  )
}
