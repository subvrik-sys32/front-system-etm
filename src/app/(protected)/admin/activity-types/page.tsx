"use client"

import { ActivityTypeActions } from "@/features/activity-log/components/actions/activity-type-actions"
import { ActivityTypesPageContent } from "@/features/activity-log/components/contents/activity-types-page-content"
import { usePageTitle } from "@/shared/responsive/navigation/hooks/use-page-title"
import { usePageActions } from "@/shared/responsive/navigation/hooks/use-page-actions"

export default function ActivityTypesPage() {
  usePageTitle("Actividades")
  usePageActions(<ActivityTypeActions />)

  return (
    <main className="flex h-full min-h-0 flex-col bg-background px-3 pt-0 pb-2 text-foreground select-none tablet:px-4 desktop:px-5 desktop:pt-1 desktop:pb-3">

      <div className="mb-1 shrink-0 desktop:hidden">
        <ActivityTypeActions />
      </div>

      <section className="flex min-h-0 w-full flex-1 flex-col">
        <ActivityTypesPageContent />
      </section>
    </main>
  )
}