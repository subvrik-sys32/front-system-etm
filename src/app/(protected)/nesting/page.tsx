"use client"

import { usePageTitle } from "@/shared/responsive/navigation/hooks/use-page-title"
import { PageShell } from "@/shared/responsive/layout/page-shell"
import { useResponsive } from "@/shared/responsive/hooks/use-responsive"
import { DESKTOP_TOP_BAR_HEIGHT_PX } from "@/shared/responsive/layout/chrome-constants"
import { NestingPage } from "@/features/nesting/components/nesting-page"

export default function NestingRoute() {
  usePageTitle("Nesting")
  const { isMobile } = useResponsive()

  return (
    <PageShell mode="fill">
      <section className="flex min-h-0 w-full flex-1 flex-col">
        <NestingPage />
      </section>
    </PageShell>
  )
}