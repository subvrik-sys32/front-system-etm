"use client"

import { EngineeringPageContent } from "@/features/engineering/components/engineering-page-content"
import { usePageTitle } from "@/shared/responsive/navigation/hooks/use-page-title"
import { PageShell } from "@/shared/responsive/layout/page-shell"
import { useDeepLinkCapture } from "@/shared/hooks/use-deep-link-capture"
import { useDeepLinkRoute } from "@/shared/focus/deep-link-route"

export default function IngenieriaPage() {
  usePageTitle("Ingeniería")
  useDeepLinkCapture()
  const taskId = useDeepLinkRoute(s => s.route?.taskId)
  return (
    <PageShell mode="list">
      <section className="flex min-h-0 w-full flex-1 flex-col">
        <EngineeringPageContent focusedTaskId={taskId} />
      </section>
    </PageShell>
  )
}
