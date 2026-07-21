"use client"

import type { EntityColumn } from "@/shared/ui/entity-table"
import { DynamicBadge } from "@/shared/ui/badge/dynamic-badge"
import { cn } from "@/shared/utils/utils"
import { TABLE_WIDTHS } from "@/shared/constants/table-widths"

import type { Role } from "../types/role.types"

type Params = {
  selectedRoleId: string | null
  onSelect: (role: Role) => void
}

// A diferencia de Proyectos/Tareas, acá no hay drag ni expand-row:
// es una lista de selección simple (maestro-detalle con el panel de
// Permisos de al lado), así que la única columna es el propio rol,
// clickeable para seleccionarlo. Reusa EntityTable solo por el
// look & feel (mismo panel redondeado, mismo scroll, mismo
// skeleton), no por su mecánica de expandir filas.
export function buildRoleColumns({
  selectedRoleId,
  onSelect,
}: Params): EntityColumn<Role>[] {

  return [

    {
      id: "role",
      align: "left",
      title: "",
      width: TABLE_WIDTHS.large,
      cardOrder: 0,
      skeletonShape: "badge",
      render: (role) => {

        const isSelected = selectedRoleId === role.id

        return (

          <button
            type="button"
            onClick={() => onSelect(role)}
            className={cn(
              "flex w-full min-w-0 items-center justify-between gap-2 rounded-xl px-1 py-1 text-left transition-all",
              isSelected ? "bg-white/8" : "hover:bg-white/5",
            )}
          >

            <div className="min-w-0 flex-1">
              <DynamicBadge
                label={role.name}
                color={role.color}
                icon={role.icon}
                width="field"
              />
            </div>

            {!role.active && (
              <span className="shrink-0 text-xs text-neutral-500">Inactivo</span>
            )}

          </button>

        )

      },
    },

  ]

}