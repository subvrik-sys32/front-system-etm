"use client"

import { Pencil } from "lucide-react"

import type { User } from "@/features/users/types/user.types"
import { DynamicBadge } from "@/shared/ui/badge/dynamic-badge"
import { PrimaryAction } from "@/shared/ui/actions/primary-action"
import { PROCESS_DEFINITIONS } from "@/features/processes/constants/process-definitions"
import type { ProcessCode } from "@/features/tasks/types/task.types"

const LEVEL_LABEL: Record<string, string> = {
  GENERAL: "General",
  OPERARIO: "Operario",
  SUPERVISOR: "Supervisor",
  TERCERO: "Tercero",
}

const LEVEL_COLOR: Record<string, string> = {
  GENERAL: "#64748B",
  OPERARIO: "#7C3AED",
  SUPERVISOR: "#0284C7",
  TERCERO: "#B45309",
}

function areaVisual(processCode: string | null | undefined) {
  if (processCode && processCode in PROCESS_DEFINITIONS) {
    const d = PROCESS_DEFINITIONS[processCode as ProcessCode]
    return { icon: d.icon, color: d.color }
  }
  return { icon: "shield" as const, color: "#64748B" }
}

type Props = {
  user: User
  onEdit?: () => void
  onOpenExceptions?: () => void
}

/**
 * Vista Perfil en Access (master–detail).
 * Edición completa sigue en UserDialog (mismo form que crear/editar).
 * Excepciones de permisos viven en la pestaña hermana.
 */
export function UserAccessProfileSummary({
  user,
  onEdit,
  onOpenExceptions,
}: Props) {
  const level = user.level ?? "GENERAL"

  return (
    <div className="flex flex-col gap-4 p-3">
      <div className="rounded-2xl bg-foreground/5 px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Identidad
        </p>
        <p className="mt-2 text-sm font-medium text-foreground">{user.name}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          @{user.username}
          {user.email ? ` · ${user.email}` : ""}
        </p>
      </div>

      <div className="rounded-2xl bg-foreground/5 px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Roles
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {(user.roles ?? []).length === 0 ? (
            <span className="text-xs text-muted-foreground">Sin roles</span>
          ) : (
            (user.roles ?? []).map(role => (
              <DynamicBadge
                key={role.id}
                label={role.name}
                color={role.color || "#64748B"}
                icon={role.icon}
                width="content"
              />
            ))
          )}
        </div>
      </div>

      <div className="rounded-2xl bg-foreground/5 px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Sub-nivel
        </p>
        <div className="mt-2">
          <DynamicBadge
            label={LEVEL_LABEL[level] ?? level}
            color={LEVEL_COLOR[level] ?? "#64748B"}
            width="content"
          />
        </div>
      </div>

      {(level === "OPERARIO" || level === "TERCERO") && (
        <div className="rounded-2xl bg-foreground/5 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Áreas
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {(user.areas ?? []).length === 0 ? (
              <span className="text-xs text-muted-foreground">Sin áreas</span>
            ) : (
              (user.areas ?? []).map(area => {
                const v = areaVisual(area.processCode)
                return (
                  <DynamicBadge
                    key={area.id}
                    label={area.label}
                    color={v.color}
                    icon={v.icon}
                    width="content"
                  />
                )
              })
            )}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2 pt-1">
        {onEdit && (
          <PrimaryAction label="Editar perfil" icon={Pencil} onClick={onEdit} />
        )}
        {onOpenExceptions && (
          <button
            type="button"
            onClick={onOpenExceptions}
            className="rounded-xl bg-foreground/5 px-3 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:bg-foreground/10 hover:text-foreground"
          >
            Ver excepciones
          </button>
        )}
      </div>
    </div>
  )
}
