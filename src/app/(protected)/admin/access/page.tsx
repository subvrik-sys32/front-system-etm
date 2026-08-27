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
 *
 * + crear usuario:
 * - Mobile → FAB (UserActions)
 * - Compact/Desktop → PrimaryAction en toolbar (RolePermissionsPageContent)
 * Nunca ambos a la vez (antes desktop:hidden + isMobile divergían en compact).
 */
export default function AccessPage() {
  usePageTitle("Acceso")
  const { isMobile } = useResponsive()
  usePageActions(null)

  return (
    <PageShell mode={isMobile ? "list" : "fill"}>
      {isMobile ? <UserActions /> : null}

      <section className="flex min-h-0 w-full flex-1 flex-col">
        <RolePermissionsPageContent />
      </section>
    </PageShell>
  )
}
