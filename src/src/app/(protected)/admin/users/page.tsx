"use client"

import {
  UserActions,
} from "@/features/admin/users/components/actions/user-actions"

import {
  UsersPageContent,
} from "@/features/admin/users/components/users-page-content"

import { usePageTitle } from "@/shared/responsive/navigation/hooks/use-page-title"

export default function UsersPage() {

  usePageTitle("Usuarios")

  return (

    <main className="flex flex-col bg-[#050505] px-4 pt-3 pb-5 text-white select-none tablet:px-8 tablet:py-10 tablet:h-full">

      <header className="flex flex-wrap items-start justify-between gap-4">

        <div className="hidden min-w-0 flex-1 items-center gap-2 tablet:flex">

          <h1 className="shrink-0 text-xl font-bold tracking-widest tablet:text-2xl">
            USUARIOS
          </h1>

          <span className="hidden h-1 w-1 shrink-0 rounded-full bg-neutral-700 tablet:block" />

          <p className="min-w-0 truncate text-sm text-neutral-500">
            Gestión de usuarios
          </p>

        </div>

        {/* Siempre montado: UserActions decide su propio render
            según breakpoint (botón normal en desktop, FAB fixed en
            mobile) — adentro de un padre hidden, el FAB no se
            pintaría en mobile. */}
        <div className="shrink-0">

          <UserActions />

        </div>

      </header>

      <section className="mt-2 min-h-0 flex-1 tablet:mt-3">

        <UsersPageContent />

      </section>

    </main>

  )

}