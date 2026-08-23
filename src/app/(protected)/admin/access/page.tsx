"use client"

import { UserActions } from "@/features/admin/users/components/actions/user-actions"
import { RolePermissionsPageContent } from "@/features/roles/components/role-permissions-page-content"
import { usePageTitle } from "@/shared/responsive/navigation/hooks/use-page-title"
import { usePageActions } from "@/shared/responsive/navigation/hooks/use-page-actions"
import { useResponsive } from "@/shared/responsive/hooks/use-responsive"
import { PageShell } from "@/shared/responsive/layout/page-shell"

/**
 * Hub único de administración de personas y permisos.
 * Reemplaza /admin/users y /admin/roles (mismas capacidades, una sola UI).
 */
export default function AccessPage() {
  usePageTitle("Acceso")
  const { isMobile } = useResponsive()
  usePageActions(isMobile ? null : <UserActions />)

  return (
    <PageShell mode={isMobile ? "list" : "fill"}>
      {/* FAB crear usuario (mobile) — mismo UserActions */}
      <div className="desktop:hidden">
        <UserActions />
      </div>

      <section className="flex min-h-0 w-full flex-1 flex-col">
        <RolePermissionsPageContent />
      </section>
    </PageShell>
  )
}
