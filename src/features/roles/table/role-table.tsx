"use client"

import { useMemo } from "react"

import { useResponsive } from "@/shared/responsive/hooks/use-responsive"
import { EntityTable, EntityTableSkeleton } from "@/shared/ui/entity-table"

import { useRoles } from "../hooks/use-roles"
import { RoleMobileCard } from "../components/cards/role-mobile-card"
import { RoleMobileSkeleton } from "../components/cards/role-card-skeleton"
import { buildRoleColumns } from "./build-role-columns"

import type { Role } from "../types/role.types"

type Props = {
  search: string
  selectedRoleId: string | null
  onSelect: (role: Role) => void
}

// Espejo estructural de UserTable: misma forma (branch mobile/
// desktop, mismo manejo de loading/empty), pero a diferencia de
// Usuarios -- que abre un diálogo de edición desde la propia fila --
// acá seleccionar un rol es "maestro-detalle": se lo levanta al
// padre (RolePermissionsPageContent) para que muestre sus permisos
// en el panel de al lado. Por eso selectedRoleId/onSelect vienen
// como props en vez de manejarse acá adentro.
export function RoleTable({
  search,
  selectedRoleId,
  onSelect,
}: Props) {

  const { isMobile } = useResponsive()
  const { roles, loading } = useRoles()

  const columns = useMemo(
    () => buildRoleColumns({ selectedRoleId, onSelect }),
    [selectedRoleId, onSelect],
  )

  const data = useMemo(() => {

    const query = search.trim().toLowerCase()

    if (!query) return roles

    return roles.filter((role) => role.name.toLowerCase().includes(query))

  }, [roles, search])

  const emptyMessage = search
    ? "Ningún rol coincide con la búsqueda."
    : "No hay roles todavía."

  if (loading) {

    if (isMobile) {
      return <RoleMobileSkeleton />
    }

    return (
      <EntityTableSkeleton
        columns={columns}
        rows={5}
      />
    )

  }

  if (isMobile) {

    return (

      <div className="space-y-2">

        {data.length ? (

          data.map((role, index) => (

            <RoleMobileCard
              key={role.id}
              role={role}
              index={index}
              selected={selectedRoleId === role.id}
              onSelect={() => onSelect(role)}
            />

          ))

        ) : (

          <div className="rounded-2xl bg-[#101012] px-4 py-8 text-center text-sm text-neutral-500">
            {emptyMessage}
          </div>

        )}

      </div>

    )

  }

  return (

    <EntityTable
      data={data}
      columns={columns}
      rowId={(role) => role.id}
      emptyMessage={emptyMessage}
    />

  )

}