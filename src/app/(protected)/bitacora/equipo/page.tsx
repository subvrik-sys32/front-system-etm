import {
  TeamActivityLogPageContent,
} from "@/features/activity-log/components/team-activity-log-page-content"

export default function TeamBitacoraPage() {

  return (

    <main className="flex flex-col bg-[#050505] px-4 py-5 text-white select-none tablet:px-8 tablet:py-10 tablet:h-full">

      <header className="flex flex-wrap items-start justify-between gap-4">

        <div className="flex min-w-0 flex-1 items-center gap-2">

          <h1 className="shrink-0 text-xl font-bold tracking-widest tablet:text-2xl">
            BITÁCORA DEL EQUIPO
          </h1>

          <span className="hidden h-1 w-1 shrink-0 rounded-full bg-neutral-700 tablet:block" />

          <p className="min-w-0 truncate text-sm text-neutral-500">
            Qué hizo cada persona, por día
          </p>

        </div>

      </header>

      <section className="mt-3 min-h-0 flex-1 overflow-y-auto">

        <TeamActivityLogPageContent />

      </section>

    </main>

  )

}