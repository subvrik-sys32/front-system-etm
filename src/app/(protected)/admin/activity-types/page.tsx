"use client"

import {
  ActivityTypeActions,
} from "@/features/activity-log/components/activity-type-actions"

import {
  ActivityTypesPageContent,
} from "@/features/activity-log/components/activity-types-page-content"

import {
  usePageTitle,
} from "@/shared/responsive/navigation/hooks/use-page-title"

export default function ActivityTypesPage() {

  usePageTitle("Actividades")

  return (

    <main className="flex h-full flex-col bg-[#050505] px-4 pt-3 pb-5 text-white select-none tablet:px-8 tablet:py-10">

      <header className="flex flex-wrap items-start justify-between gap-4">

        <div className="hidden min-w-0 flex-1 items-center gap-2 tablet:flex">

          <h1 className="shrink-0 text-xl font-bold tracking-widest tablet:text-2xl">
            ACTIVIDADES
          </h1>

          <span className="hidden h-1 w-1 shrink-0 rounded-full bg-neutral-700 tablet:block" />

          <p className="min-w-0 truncate text-sm text-neutral-500">
            Lista de actividades para la Bitácora
          </p>

        </div>

        <div className="shrink-0">

          <ActivityTypeActions />

        </div>

      </header>

      <section className="mt-2 min-h-0 flex-1 tablet:mt-3">

        <ActivityTypesPageContent />

      </section>

    </main>

  )

}