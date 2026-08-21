"use client"

import { UserActions } from "@/features/admin/users/components/actions/user-actions"
import { RolePermissionsPageContent } from "@/features/roles/components/role-permissions-page-content"
import { usePageTitle } from "@/shared/responsive/navigation/hooks/use-page-title"
import { usePageActions } from "@/shared/responsive/navigation/hooks/use-page-actions"
import { useResponsive } from "@/shared/responsive/hooks/use-responsive"

/**
 * Hub único de administración de personas y permisos.
 * Reemplaza /admin/users y /admin/roles (mismas capacidades, una sola UI).
 */
export default function AccessPage() {
  usePageTitle("Acceso")
  const { isMobile } = useResponsive()
  usePageActions(isMobile ? null : <UserActions />)

  return (
    <main className="flex h-full min-h-0 flex-col bg-background px-3 pt-0 pb-2 text-foreground select-none tablet:px-4 desktop:px-5 desktop:pt-1 desktop:pb-3">

      {/* FAB crear usuario (mobile) — mismo UserActions */}
      <div className="desktop:hidden">
        <UserActions />
      </div>

      <section className="flex min-h-0 w-full flex-1 flex-col">
        <RolePermissionsPageContent />
      </section>
    </main>
  )
}
