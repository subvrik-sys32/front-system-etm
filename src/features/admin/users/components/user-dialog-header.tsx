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
  error?: string
  onRoleChange: (
    roleId: string,
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
  error,
  onRoleChange,
}: Props) {
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
            {email || "usuario@etmsac.com"}
          </span>
        </div>
      </div>
    </div>
  )
}