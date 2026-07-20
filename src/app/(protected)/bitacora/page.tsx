"use client"

import { usePageTitle } from "@/shared/responsive/navigation/hooks/use-page-title"
import { ActivityLogPageContent } from "@/features/activity-log/components/activity-log-page-content"
import { ActivityLogActions } from "@/features/activity-log/components/activity-log-actions"

export default function BitacoraPage() {

  usePageTitle("Bitácora")

  return (

    <main className="flex flex-col bg-[#050505] px-4 pt-3 pb-5 text-white select-none tablet:px-8 tablet:py-10 tablet:h-full">

      <header className="flex flex-wrap items-start justify-between gap-4">

        <div className="hidden min-w-0 flex-1 items-center gap-2 tablet:flex">

          <h1 className="shrink-0 text-xl font-bold tracking-widest tablet:text-2xl">
            BITÁCORA
          </h1>

          <span className="hidden h-1 w-1 shrink-0 rounded-full bg-neutral-700 tablet:block" />

          <p className="min-w-0 truncate text-sm text-neutral-500">
            Qué hiciste hoy, por franja horaria
          </p>

        </div>

        {/* Siempre montado: mismo motivo que en Projects/Tasks/Users
            /ActivityTypes — el FAB de mobile no se pintaría si
            quedara adentro de un padre con display:none. */}
        <div className="shrink-0">

          <ActivityLogActions />

        </div>

      </header>

      <section className="mt-2 min-h-0 flex-1 tablet:mt-3 overflow-y-auto">

        <ActivityLogPageContent />

      </section>

    </main>

  )

}