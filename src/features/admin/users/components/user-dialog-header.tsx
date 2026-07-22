"use client"

import {
  RoleSelect,
} from "@/features/roles/components/roles-select"

import {
  DynamicBadge,
} from "@/shared/ui/badge/dynamic-badge"

import type {
  Role,
} from "@/features/roles/types/role.types"

import type {
  EntityIcon,
} from "@/shared/constants/entity-icons"

type Props = {
  name: string
  username: string
  email: string
  color: string
  icon: EntityIcon
  roles: Role[]
  selectedRole?: Role
  level: "GENERAL" | "OPERARIO" | "SUPERVISOR" | null
  error?: string
  onRoleChange: (
    roleId: string,
  ) => void
  onLevelChange: (
    level: "GENERAL" | "OPERARIO" | "SUPERVISOR" | null,
  ) => void
}

export function UserDialogHeader({
  name,
  username,
  email,
  color,
  icon,
  roles,
  selectedRole,
  level,
  error,
  onRoleChange,
  onLevelChange,
}: Props) {
  const isProduccion =
    selectedRole?.code === "PRODUCCION"

  const LEVEL_OPTIONS = [
    { value: "OPERARIO" as const, label: "Operario" },
    { value: "SUPERVISOR" as const, label: "Supervisor" },
  ]

  return (
    <div className="rounded-2xl bg-white/2 p-4 tablet:p-5">
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 tablet:grid-cols-[1fr_320px] tablet:items-center tablet:gap-8">
          <DynamicBadge
            label={name || "Usuario"}
            icon={icon}
            color={color}
            width="content"
          />

          <div className="w-full">
            <RoleSelect
              value={selectedRole}
              items={roles}
              placeholder="Seleccionar rol"
              onChange={role =>
                onRoleChange(
                  role?.id ?? "",
                )
              }
            />

            {error && (
              <p className="mt-2 text-xs text-red-400">
                {error}
              </p>
            )}
          </div>
        </div>

        {isProduccion && (
          <div className="rounded-xl bg-white/2 p-3">
            <div className="mb-2 text-xs font-medium text-neutral-500">
              Sub-nivel en Producción
            </div>

            <div className="flex gap-2">
              {LEVEL_OPTIONS.map(option => {
                const selected =
                  level === option.value

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() =>
                      onLevelChange(
                        selected ? null : option.value,
                      )
                    }
                    className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                      selected
                        ? "bg-violet-500/20 text-violet-300"
                        : "bg-white/3 text-neutral-400 hover:bg-white/5"
                    }`}
                  >
                    {option.label}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="font-semibold text-white">
            {name || "Nuevo usuario"}
          </span>

          <span className="text-neutral-700">
            •
          </span>

          <span className="text-neutral-500">
            {username
              ? `@${username}`
              : "@usuario"}
          </span>

          <span className="text-neutral-700">
            •
          </span>

          <span className="min-w-0 truncate text-neutral-500">
            {email || "usuario@etmperu.com"}
          </span>
        </div>
      </div>
    </div>
  )
}