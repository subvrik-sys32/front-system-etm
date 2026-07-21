"use client"

import { DynamicBadge } from "@/shared/ui/badge/dynamic-badge"
import { cn } from "@/shared/utils/utils"

import type { Role } from "../../types/role.types"

type Props = {
  role: Role
  index: number
  selected: boolean
  onSelect: () => void
}

// Espejo de UserMobileCard, pero sin chevron/expand: acá no hay
// campos extra que mostrar al tocar la card (username, email,
// etc.) -- tocarla selecciona el rol directamente y navega al panel
// de Permisos (ver RolePermissionsPageContent), así que toda la
// card es un solo botón.
export function RoleMobileCard({
  role,
  index,
  selected,
  onSelect,
}: Props) {

  return (

    <article
      className={cn(
        "overflow-hidden rounded-xl transition-colors",
        selected ? "bg-white/8" : "bg-white/2",
      )}
    >

      <button
        type="button"
        onClick={onSelect}
        className="flex w-full flex-col gap-2 px-3 py-3 text-left"
      >

        <div className="flex items-center justify-between gap-2.5">

          <span className="text-xs font-semibold tracking-[0.12em] text-neutral-500">
            ROL {String(index + 1).padStart(3, "0")}
          </span>

          {!role.active && (
            <span className="text-xs font-medium text-neutral-500">Inactivo</span>
          )}

        </div>

        <DynamicBadge
          label={role.name}
          icon={role.icon}
          color={role.color}
          width="field"
        />

      </button>

    </article>

  )

}