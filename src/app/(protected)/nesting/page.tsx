"use client"

import { usePageTitle } from "@/shared/responsive/navigation/hooks/use-page-title"
import { useResponsive } from "@/shared/responsive/hooks/use-responsive"
import { DESKTOP_TOP_BAR_HEIGHT_PX } from "@/shared/responsive/layout/chrome-constants"
import { NestingPage } from "@/features/nesting/components/nesting-page"

export default function NestingRoute() {
  usePageTitle("Nesting")
  const { isMobile } = useResponsive()

  return (
    <main
      className="flex h-full min-h-0 flex-col bg-background px-3 pt-0 pb-2 text-foreground select-none tablet:px-4 desktop:px-5 desktop:pb-3"
      style={{
        paddingTop: isMobile ? undefined : DESKTOP_TOP_BAR_HEIGHT_PX,
      }}
    >
      <section className="flex min-h-0 w-full flex-1 flex-col">
        <NestingPage />
      </section>
    </main>
  )
}