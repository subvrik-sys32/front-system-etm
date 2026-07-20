"use client"

import { useEffect, useMemo, useState } from "react"
import { Save } from "lucide-react"

import { useRoles } from "../hooks/use-roles"
import { usePermissionCatalog } from "../hooks/use-permission-catalog"
import { useRolePermissions } from "../hooks/use-role-permissions"
import { useUpdateRolePermissions } from "../hooks/use-update-role-permissions"

import {
  getGroupOrder,
  getPermissionActionLabel,
  getPermissionGroupKey,
  getPermissionGroupLabel,
} from "../utils/permission-groups"

import { DynamicBadge } from "@/shared/ui/badge/dynamic-badge"
import { PrimaryAction } from "@/shared/ui/actions/primary-action"
import { useResponsive } from "@/shared/responsive/hooks/use-responsive"
import { cn } from "@/shared/utils/utils"

import type { Role } from "../types/role.types"

export function RolePermissionsPageContent() {

  const { isMobile } = useResponsive()

  const { roles, loading: loadingRoles } = useRoles()
  const { permissions: catalog, loading: loadingCatalog } = usePermissionCatalog()

  const [selectedRole, setSelectedRole] = useState<Role | null>(null)

  const { permissions: rolePermissions, loading: loadingRolePermissions } =
    useRolePermissions(selectedRole?.id ?? null)

  const { updatePermissions, saving } = useUpdateRolePermissions(selectedRole?.id ?? null)

  // Set local de ids marcados — separado de lo que ya está guardado
  // en el servidor. Así el checkbox responde al instante al tocarlo
  // (no hay que esperar un request por cada click), y el guardado
  // real es UNA sola llamada, explícita, con "Guardar cambios".
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set())
  const [dirty, setDirty] = useState(false)

  useEffect(() => {

    setCheckedIds(new Set(rolePermissions.map(p => p.id)))
    setDirty(false)

  }, [rolePermissions])

  const grouped = useMemo(() => {

    const groups = new Map<string, typeof catalog>()

    for (const permission of catalog) {

      const key = getPermissionGroupKey(permission.code)
      const existing = groups.get(key) ?? []

      groups.set(key, [...existing, permission])

    }

    return Array.from(groups.entries())
      .sort(([a], [b]) => getGroupOrder(a) - getGroupOrder(b))

  }, [catalog])

  const handleToggle = (permissionId: string) => {

    setCheckedIds((current) => {

      const next = new Set(current)

      if (next.has(permissionId)) {
        next.delete(permissionId)
      } else {
        next.add(permissionId)
      }

      return next

    })

    setDirty(true)

  }

  const handleSave = async () => {

    await updatePermissions(Array.from(checkedIds))
    setDirty(false)

  }

  return (

    <div
      className={cn(
        "flex min-h-0 flex-1 gap-4",
        isMobile ? "flex-col" : "flex-row",
      )}
    >

      {/* Lista de roles */}
      <div className={cn("flex flex-col gap-2", isMobile ? "" : "w-64 shrink-0")}>

        {loadingRoles && (
          <p className="text-sm text-neutral-500">Cargando roles...</p>
        )}

        {roles.map((role) => {

          const isSelected = selectedRole?.id === role.id

          return (

            <button
              key={role.id}
              type="button"
              onClick={() => setSelectedRole(role)}
              className={cn(
                "flex items-center justify-between rounded-xl p-3 text-left transition-colors",
                isSelected ? "bg-white/12 ring-1 ring-white/20" : "bg-white/3 hover:bg-white/6",
              )}
            >

              <DynamicBadge
                label={role.name}
                color={role.color}
                icon={role.icon}
                width="content"
              />

              {!role.active && (
                <span className="text-xs text-neutral-500">Inactivo</span>
              )}

            </button>

          )

        })}

      </div>

      {/* Matriz de permisos del rol elegido */}
      <div className="flex min-h-0 flex-1 flex-col gap-3">

        {!selectedRole && (

          <div className="flex h-40 items-center justify-center rounded-xl bg-white/2 text-sm text-neutral-500">
            Elegí un rol para ver y editar sus permisos
          </div>

        )}

        {selectedRole && (loadingCatalog || loadingRolePermissions) && (

          <div className="flex h-40 items-center justify-center text-sm text-neutral-500">
            Cargando permisos...
          </div>

        )}

        {selectedRole && !loadingCatalog && !loadingRolePermissions && (

          <>

            <div className="flex items-center justify-between gap-3">

              <h2 className="text-sm font-semibold text-neutral-300">
                Permisos de {selectedRole.name}
              </h2>

              <PrimaryAction
                label={saving ? "Guardando..." : "Guardar cambios"}
                icon={Save}
                onClick={handleSave}
                disabled={!dirty || saving}
              />

            </div>

            <div className="flex flex-col gap-4 overflow-y-auto">

              {grouped.map(([groupKey, groupPermissions]) => (

                <div key={groupKey} className="rounded-xl bg-white/3 p-3">

                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    {getPermissionGroupLabel(groupKey)}
                  </p>

                  <div className="grid grid-cols-2 gap-2 tablet:grid-cols-3">

                    {groupPermissions.map((permission) => (

                      <label
                        key={permission.id}
                        className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-neutral-300 transition-colors hover:bg-white/5"
                      >

                        <input
                          type="checkbox"
                          checked={checkedIds.has(permission.id)}
                          onChange={() => handleToggle(permission.id)}
                          className="size-4 rounded border-white/20 bg-white/6 accent-cyan-500"
                        />

                        {getPermissionActionLabel(permission.code, groupKey)}

                      </label>

                    ))}

                  </div>

                </div>

              ))}

            </div>

          </>

        )}

      </div>

    </div>

  )

}