    "use client"

    import { RolePermissionsPageContent } from "@/features/roles/components/role-permissions-page-content"
    import { usePageTitle } from "@/shared/responsive/navigation/hooks/use-page-title"

    export default function RolesPage() {
    usePageTitle("Roles y Permisos")

    return (
        <main className="flex flex-col bg-[#050505] px-4 pt-3 pb-5 text-white select-none tablet:px-8 tablet:py-10 tablet:h-full">
        <header className="hidden flex-wrap items-start justify-between gap-4 tablet:flex">
            <div className="flex min-w-0 flex-1 items-center gap-2">
            <h1 className="shrink-0 text-xl font-bold tracking-widest tablet:text-2xl">
                ROLES Y PERMISOS
            </h1>
            <span className="hidden h-1 w-1 shrink-0 rounded-full bg-neutral-700 tablet:block" />
            <p className="min-w-0 truncate text-sm text-neutral-500">
                Qué puede hacer cada rol
            </p>
            </div>

            {/* Reserva exactamente el espacio del botón sin renderizarlo */}
            <div
            aria-hidden
            className="h-10 w-10 shrink-0"
            />
        </header>
        <section className="mt-2 min-h-0 flex-1 tablet:mt-3">
            <RolePermissionsPageContent />
        </section>
        </main>
    )
    }