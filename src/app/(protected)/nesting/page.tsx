"use client"

import { usePageTitle } from "@/shared/responsive/navigation/hooks/use-page-title"
import { PageShell } from "@/shared/responsive/layout/page-shell"
import { NestingPage } from "@/features/nesting/components/nesting-page"

export default function NestingRoute() {
  usePageTitle("Nesting")
  return (
    <PageShell mode="fill">
      <section className="flex min-h-0 w-full flex-1 flex-col">
        <NestingPage />
      </section>
    </PageShell>
  )
}