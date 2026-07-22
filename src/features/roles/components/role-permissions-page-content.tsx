"use client"

import { useMemo, useState } from "react"
import { ArrowLeft, Save } from "lucide-react"

import { usePermissionCatalog } from "../hooks/use-permission-catalog"
import { useRolePermissions } from "../hooks/use-role-permissions"
import { useUpdateRolePermissions } from "../hooks/use-update-role-permissions"

import {
  getGroupOrder,
  getPermissionActionLabel,
  getPermissionGroupKey,
  getPermissionGroupLabel,
} from "../utils/permission-groups"

import { RolePermissionsSkeleton } from "./role-permissions-skeleton"
import { PermissionGroup } from "./permissions/permission-group"
import {
  RoleDesktopRow,
  RoleDesktopRowSkeleton,
  RoleMobileCard,
  RoleMobileSkeleton,
} from "../table"
import { useRoles } from "../hooks/use-roles"

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

  const [loadedForRoleId, setLoadedForRoleId] = useState<string | null>(null)

  if (selectedRole && !loadingRolePermissions && loadedForRoleId !== selectedRole.id) {
    setLoadedForRoleId(selectedRole.id)
    setCheckedIds(new Set(rolePermissions.map((p) => p.id)))
    setDirty(false)
  }

  if (!selectedRole && loadedForRoleId !== null) {
    setLoadedForRoleId(null)
  }

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

  const handleToggleAll = (permissionIds: string[], nextChecked: boolean) => {
    setCheckedIds((current) => {
      const next = new Set(current)
      for (const id of permissionIds) {
        if (nextChecked) next.add(id)
        else next.delete(id)
      }
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
          isMobile ? "flex-col" : "overflow-hidden"
        )}
      >
        {/* PANEL ROLES */}
        {showRolesPanel && isMobile && (

          <div className="space-y-3">
            {loadingRoles && <RoleMobileSkeleton />}

            {!loadingRoles && filteredRoles.length === 0 && (
              <div className="rounded-2xl bg-[#101012] px-4 py-8 text-center text-sm text-neutral-500">
                {search ? "Ningún rol coincide con la búsqueda." : "No hay roles todavía."}
              </div>
            )}

            {!loadingRoles &&
              filteredRoles.map((role, index) => (
                <RoleMobileCard
                  key={role.id}
                  role={role}
                  index={index}
                  onSelect={() => setSelectedRole(role)}
                />
              ))}
          </div>
        )}

        {showRolesPanel && !isMobile && (
          <aside className="flex h-full w-72 shrink-0 flex-col overflow-hidden rounded-2xl border border-white/6 bg-[#101012]">
            <div className="shrink-0 px-4 py-3">
              <p className="truncate text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
                Roles
              </p>
            </div>

            <div
              className="erp-scrollbar flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto p-2"
              style={{ scrollbarGutter: "stable" }}
            >
              {loadingRoles && <RoleDesktopRowSkeleton />}

              {!loadingRoles && filteredRoles.length === 0 && (
                <p className="px-3 py-6 text-center text-sm text-neutral-500">
                  {search ? "Ningún rol coincide con la búsqueda." : "No hay roles todavía."}
                </p>
              )}

              {!loadingRoles &&
                filteredRoles.map((role) => (
                  <RoleDesktopRow
                    key={role.id}
                    role={role}
                    selected={selectedRole?.id === role.id}
                    onSelect={() => setSelectedRole(role)}
                  />
                ))}
            </div>
          </aside>
        )}

        {/* PANEL PERMISOS */}
        {showPermissionsPanel && isMobile && (

          <div className="flex min-h-0 flex-1 flex-col gap-4">
            <header className="flex shrink-0 items-start justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3">
                {selectedRole && (
                  <button
                    type="button"
                    onClick={() => setSelectedRole(null)}
                    className="flex size-8 shrink-0 items-center justify-center rounded-xl text-neutral-400 transition-colors hover:bg-white/8 hover:text-white"
                  >
                    <ArrowLeft size={16} />
                  </button>
                )}

                {selectedRole && (
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
                      Permisos
                    </p>
                    <div className="mt-1 flex items-center gap-2.5">
                      <div className="flex items-center gap-2">
                        <span
                          className="size-2.5 shrink-0 rounded-full"
                          style={{ backgroundColor: selectedRole.color || "#71717a" }}
                        />
                        <span className="truncate text-sm font-medium text-white">
                          {selectedRole.name}
                        </span>
                      </div>
                      {dirty && (
                        <span className="shrink-0 text-xs font-medium text-amber-400">
                          Cambios sin guardar
                        </span>
                      )}
                    </div>
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

            <div className="erp-scrollbar min-h-0 flex-1 overflow-y-auto">
              {selectedRole && permissionsLoading && <RolePermissionsSkeleton />}

              {selectedRole && !permissionsLoading && (
                <div className="flex flex-col gap-4">
                  {grouped.map(([groupKey, groupPermissions]) => (
                    <PermissionGroup
                      key={groupKey}
                      title={getPermissionGroupLabel(groupKey)}
                      permissions={groupPermissions}
                      checkedIds={checkedIds}
                      onToggle={handleToggle}
                      onToggleAll={handleToggleAll}
                      getLabel={(permission) =>
                        getPermissionActionLabel(permission.code, groupKey)
                      }
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {showPermissionsPanel && !isMobile && (
          <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-white/6 bg-[#101012]">
            <header className="flex shrink-0 items-start justify-between gap-4 px-5 py-4">
              <div className="flex min-w-0 items-center gap-3">
                {!selectedRole && (
                  <div className="min-w-0">
                    <h2 className="truncate text-sm font-semibold text-neutral-300">Permisos</h2>
                    <p className="mt-1 truncate text-sm text-neutral-500">
                      Seleccioná un rol para visualizar y editar sus permisos.
                    </p>
                  </div>
                )}

                {selectedRole && (
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
                      Permisos
                    </p>
                    <div className="mt-1 flex items-center gap-2.5">
                      <div className="flex items-center gap-2">
                        <span
                          className="size-2.5 shrink-0 rounded-full"
                          style={{ backgroundColor: selectedRole.color || "#71717a" }}
                        />
                        <span className="truncate text-sm font-medium text-white">
                          {selectedRole.name}
                        </span>
                      </div>
                      {dirty && (
                        <span className="shrink-0 text-xs font-medium text-amber-400">
                          Cambios sin guardar
                        </span>
                      )}
                    </div>
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
                <div className="flex flex-col gap-4">
                  {grouped.map(([groupKey, groupPermissions]) => (
                    <PermissionGroup
                      key={groupKey}
                      title={getPermissionGroupLabel(groupKey)}
                      permissions={groupPermissions}
                      checkedIds={checkedIds}
                      onToggle={handleToggle}
                      onToggleAll={handleToggleAll}
                      getLabel={(permission) =>
                        getPermissionActionLabel(permission.code, groupKey)
                      }
                    />
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
