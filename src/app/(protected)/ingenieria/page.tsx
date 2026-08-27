"use client"

import { useSearchParams } from "next/navigation"

import { EngineeringPageContent } from "@/features/engineering/components/engineering-page-content"
import { usePageTitle } from "@/shared/responsive/navigation/hooks/use-page-title"
import { PageShell } from "@/shared/responsive/layout/page-shell"

export default function IngenieriaPage() {
  usePageTitle("Ingeniería")
  const searchParams = useSearchParams()
  const taskId = searchParams.get("taskId") ?? undefined
  const focusToken = searchParams.get("focus") ?? undefined

  return (
    <PageShell mode="list">
      <section className="flex min-h-0 w-full flex-1 flex-col">
        <EngineeringPageContent
          focusedTaskId={taskId}
          focusToken={focusToken}
        />
      </section>
    </PageShell>
  )
}
