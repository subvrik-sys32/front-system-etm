"use client"

import { usePageTitle } from "@/shared/responsive/navigation/hooks/use-page-title"
import { NestingPage } from "@/features/nesting/components/nesting-page"

export default function NestingRoute() {
  usePageTitle("Nesting")

  return (
    <main className="flex h-full min-h-0 flex-col bg-background px-3 pt-0 pb-2 text-foreground select-none tablet:px-4 desktop:px-5 desktop:pt-1 desktop:pb-3">
      {/* Título en DesktopTopBar (pill). */}

      <section className="flex min-h-0 w-full flex-1 flex-col">
        <NestingPage />
      </section>
    </main>
  )
}