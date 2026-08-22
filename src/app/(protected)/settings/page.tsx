"use client"

import { SettingsPageContent } from "@/features/settings/components/settings-page-content"
import { usePageTitle } from "@/shared/responsive/navigation/hooks/use-page-title"
import { PageShell } from "@/shared/responsive/layout/page-shell"
import { AppListScroll } from "@/shared/ui/vertical-scroll/app-list-scroll"
import { useResponsive } from "@/shared/responsive/hooks/use-responsive"

export default function SettingsPage() {
  usePageTitle("Ajustes")
  const { isMobile } = useResponsive()

  return (
    <PageShell mode={isMobile ? "fill" : "list"}>
      <section className="flex min-h-0 w-full flex-1 flex-col overflow-hidden">
        {isMobile ? (
          <AppListScroll>
            <SettingsPageContent />
          </AppListScroll>
        ) : (
          <div className="min-h-0 flex-1 overflow-y-auto">
            <SettingsPageContent />
          </div>
        )}
      </section>
    </PageShell>
  )
}
