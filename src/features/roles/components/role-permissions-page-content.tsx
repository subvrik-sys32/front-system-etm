"use client"

import { useEffect, useMemo, useState } from "react"
import { ArrowLeft, Save } from "lucide-react"

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

import { RolePermissionsSkeleton, RolesListSkeleton } from "./role-permissions-skeleton"

import { DynamicBadge } from "@/shared/ui/badge/dynamic-badge"
import { PrimaryAction } from "@/shared/ui/actions/primary-action"
import { EntityToolbar } from "@/shared/ui/entity-toolbar/entity-toolbar"
import { EntityToolbarSearch } from "@/shared/ui/entity-toolbar/entity-toolbar-search"
import { useResponsive } from "@/shared/responsive/hooks/use-responsive"
import { cn } from "@/shared/utils/utils"

import type { Role } from "../types/role.types"

export function RolePermissionsPageContent() {
  const { isMobile } = useResponsive()
  const [search, setSearch] = useState("")
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set())
  const [dirty, setDirty] = useState(false)

  const { roles, loading: loadingRoles } = useRoles()
  const { permissions: catalog, loading: loadingCatalog } = usePermissionCatalog()
  const { permissions: rolePermissions, loading: loadingRolePermissions } = useRolePermissions(
    selectedRole?.id ?? null
  )
  const { updatePermissions, saving } = useUpdateRolePermissions(selectedRole?.id ?? null)

  useEffect(() => {
    setCheckedIds(new Set(rolePermissions.map((p) => p.id)))
    setDirty(false)
  }, [rolePermissions])

  const filteredRoles = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return roles
    return roles.filter((role) => role.name.toLowerCase().includes(query))
  }, [roles, search])

  const grouped = useMemo(() => {
    const groups = new Map<string, typeof catalog>()
    for (const permission of catalog) {
      const key = getPermissionGroupKey(permission.code)
      groups.set(key, [...(groups.get(key) ?? []), permission])
    }
    return Array.from(groups.entries()).sort(
      ([a], [b]) => getGroupOrder(a) - getGroupOrder(b)
    )
  }, [catalog])

  const handleToggle = (permissionId: string) => {
    setCheckedIds((current) => {
      const next = new Set(current)
      if (next.has(permissionId)) next.delete(permissionId)
      else next.add(permissionId)
      return next
    })
    setDirty(true)
  }

  const handleSave = async () => {
    await updatePermissions(Array.from(checkedIds))
    setDirty(false)
  }

  const permissionsLoading = loadingCatalog || loadingRolePermissions
  const showRolesPanel = !isMobile || !selectedRole
  const showPermissionsPanel = !isMobile || !!selectedRole

  return (
    <div
      className={cn(
        "mx-auto flex w-full max-w-400 flex-col",
        isMobile ? "" : "h-full min-h-0 overflow-hidden"
      )}
    >
      <div className="shrink-0">
        <EntityToolbar
          left={
            <div className="flex flex-wrap items-center gap-2 py-1">
              <EntityToolbarSearch value={search} onChange={setSearch} />
            </div>
          }
        />
      </div>

      <div
        className={cn(
          "flex min-h-0 flex-1 gap-4",
          isMobile ? "mt-3 flex-col" : "overflow-hidden"
        )}
      >
        {/* PANEL ROLES */}
        {showRolesPanel && (
          <aside
            className={cn(
              "flex flex-col overflow-hidden rounded-2xl bg-[#101012] ring-1 ring-white/6",
              isMobile ? "" : "h-full w-72 shrink-0"
            )}
          >
            <div className="shrink-0 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
                Roles
              </p>
            </div>

            <div
              className={cn(
                "flex flex-col gap-2 p-2",
                isMobile ? "" : "erp-scrollbar min-h-0 flex-1 overflow-y-auto"
              )}
            >
              {loadingRoles && <RolesListSkeleton />}

              {!loadingRoles && filteredRoles.length === 0 && (
                <p className="px-3 py-6 text-center text-sm text-neutral-500">
                  {search ? "Ningún rol coincide con la búsqueda." : "No hay roles todavía."}
                </p>
              )}

              {!loadingRoles &&
                filteredRoles.map((role) => {
                  const isSelected = selectedRole?.id === role.id
                  return (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => setSelectedRole(role)}
                      className={cn(
                        "flex items-center justify-between rounded-xl px-3 py-3 text-left transition-all",
                        isSelected ? "bg-white/8" : "hover:bg-white/5"
                      )}
                    >
                      <DynamicBadge
                        label={role.name}
                        color={role.color}
                        icon={role.icon}
                        width="field"
                      />
                      {!role.active && <span className="text-xs text-neutral-500">Inactivo</span>}
                    </button>
                  )
                })}
            </div>
          </aside>
        )}

        {/* PANEL PERMISOS */}
        {showPermissionsPanel && (
          <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl bg-[#101012] ring-1 ring-white/6">
            <header className="flex shrink-0 items-start justify-between gap-4 px-5 py-4">
              <div className="flex items-center gap-3">
                {isMobile && selectedRole && (
                  <button
                    type="button"
                    onClick={() => setSelectedRole(null)}
                    className="flex size-8 shrink-0 items-center justify-center rounded-xl text-neutral-400 transition-colors hover:bg-white/8 hover:text-white"
                  >
                    <ArrowLeft size={16} />
                  </button>
                )}

                {!selectedRole && (
                  <div>
                    <h2 className="text-sm font-semibold text-neutral-300">Permisos</h2>
                    <p className="mt-1 text-sm text-neutral-500">
                      Seleccioná un rol para visualizar y editar sus permisos.
                    </p>
                  </div>
                )}

                {selectedRole && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
                      Permisos
                    </p>
                    <h2 className="mt-1 text-lg font-semibold text-white">{selectedRole.name}</h2>
                  </div>
                )}
              </div>

              <PrimaryAction
                label={saving ? "Guardando..." : "Guardar cambios"}
                icon={Save}
                onClick={handleSave}
                disabled={!selectedRole || !dirty || saving}
              />
            </header>

            <div className="erp-scrollbar min-h-0 flex-1 overflow-y-auto p-5">
              {!selectedRole && (
                <div className="flex h-full min-h-52 items-center justify-center rounded-2xl bg-white/2">
                  <div className="text-center">
                    <p className="text-base font-medium text-neutral-300">Ningún rol seleccionado</p>
                    <p className="mt-2 text-sm text-neutral-500">
                      Elegí un rol desde el panel izquierdo para comenzar.
                    </p>
                  </div>
                </div>
              )}

              {selectedRole && permissionsLoading && <RolePermissionsSkeleton />}

              {selectedRole && !permissionsLoading && (
                <div className="flex flex-col gap-5">
                  {grouped.map(([groupKey, groupPermissions]) => (
                    <section key={groupKey} className="rounded-2xl bg-white/2 p-4">
                      <header className="mb-4">
                        <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
                          {getPermissionGroupLabel(groupKey)}
                        </h3>
                      </header>

                      <div className="grid grid-cols-1 gap-2 tablet:grid-cols-2 desktop:grid-cols-3">
                        {groupPermissions.map((permission) => (
                          <label
                            key={permission.id}
                            className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 transition-colors hover:bg-white/4"
                          >
                            <input
                              type="checkbox"
                              checked={checkedIds.has(permission.id)}
                              onChange={() => handleToggle(permission.id)}
                              className="size-4 rounded bg-white/6 accent-cyan-500"
                            />
                            <span className="text-sm text-neutral-300">
                              {getPermissionActionLabel(permission.code, groupKey)}
                            </span>
                          </label>
                        ))}
                      </div>
                    </section>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}