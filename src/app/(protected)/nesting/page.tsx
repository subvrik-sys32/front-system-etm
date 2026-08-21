"use client"

import { usePageTitle } from "@/shared/responsive/navigation/hooks/use-page-title"
import { useResponsive } from "@/shared/responsive/hooks/use-responsive"
import { PageShell } from "@/shared/responsive/layout/page-shell"
import { NestingPage } from "@/features/nesting/components/nesting-page"

/**
 * Nesting es ruta immersive en móvil (AppShell ya aplica top: TOP_BAR).
 * PageShell fill volvería a sumar paddingTop → hueco doble.
 * Móvil: bleed (solo bottom). Desktop: fill (inset del DesktopTopBar).
 */
export default function NestingRoute() {
  usePageTitle("Nesting")
  const { isMobile } = useResponsive()

  return (
    <PageShell mode={isMobile ? "bleed" : "fill"}>
      <section className="flex min-h-0 w-full flex-1 flex-col">
        <NestingPage />
      </section>
    </PageShell>
  )
}
