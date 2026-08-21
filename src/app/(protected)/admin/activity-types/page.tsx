"use client"

import { ActivityTypeActions } from "@/features/activity-log/components/actions/activity-type-actions"
import { ActivityTypesPageContent } from "@/features/activity-log/components/contents/activity-types-page-content"
import { usePageTitle } from "@/shared/responsive/navigation/hooks/use-page-title"
import { usePageActions } from "@/shared/responsive/navigation/hooks/use-page-actions"
import { useResponsive } from "@/shared/responsive/hooks/use-responsive"
import { PageShell } from "@/shared/responsive/layout/page-shell"

export default function ActivityTypesPage() {
  usePageTitle("Actividades")
  const { isMobile } = useResponsive()
  usePageActions(isMobile ? null : <ActivityTypeActions />)

  return (
    <PageShell mode="list">
      <div className="mb-1 shrink-0 desktop:hidden">
        <ActivityTypeActions />
      </div>

      <section className="flex min-h-0 w-full flex-1 flex-col">
        <ActivityTypesPageContent />
      </section>
    </PageShell>
  )
}