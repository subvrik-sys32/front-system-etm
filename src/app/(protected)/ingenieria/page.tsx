"use client"

import { EngineeringPageContent } from "@/features/engineering/components/engineering-page-content"
import { usePageTitle } from "@/shared/responsive/navigation/hooks/use-page-title"
import { PageShell } from "@/shared/responsive/layout/page-shell"

export default function IngenieriaPage() {
  usePageTitle("Ingeniería")

  return (
    <PageShell mode="list">
      <section className="flex min-h-0 w-full flex-1 flex-col">
        <EngineeringPageContent />
      </section>
    </PageShell>
  )
}
