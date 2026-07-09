import {
  UserActions,
} from "@/features/admin/users/components/actions/user-actions"

import {
  UsersPageContent,
} from "@/features/admin/users/components/users-page-content"

export default function UsersPage(){

  return(

    <main className="h-full bg-[#050505] px-8 py-10 text-white select-none">

      <section className="space-y-6">

        <header className="flex flex-wrap items-start justify-between gap-4">

          <div className="min-w-0">

            <h1 className="text-2xl font-bold tracking-widest">

              USUARIOS

            </h1>

            <p className="mt-2 text-sm text-neutral-500">

              Centro de gestión de usuarios

            </p>

          </div>

          <div className="shrink-0">

            <UserActions />

          </div>

        </header>

        <UsersPageContent />

      </section>

    </main>

  )

}