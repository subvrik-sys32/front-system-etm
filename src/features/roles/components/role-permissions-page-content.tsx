"use client"

import { useMemo, useState } from "react"
import { ArrowLeft, Check, Save } from "lucide-react"

import { usePermissionCatalog } from "../hooks/use-permission-catalog"
import { useRolePermissions } from "../hooks/use-role-permissions"
import { useUpdateRolePermissions } from "../hooks/use-update-role-permissions"

import {
  getGroupOrder,
  getPermissionActionLabel,
  getPermissionGroupKey,
  getPermissionGroupLabel,
} from "../utils/permission-groups"

import { RolePermissionsSkeleton, RolesListSkeleton, RolesMobileSkeleton } from "./role-permissions-skeleton"
import { useRoles } from "../hooks/use-roles"

import { DynamicBadge } from "@/shared/ui/badge/dynamic-badge"
import { PrimaryAction } from "@/shared/ui/actions/primary-action"
import { EntityToolbar } from "@/shared/ui/entity-toolbar/entity-toolbar"
import { EntityToolbarSearch } from "@/shared/ui/entity-toolbar/entity-toolbar-search"
import { useResponsive } from "@/shared/responsive/hooks/use-responsive"
import { cn } from "@/shared/utils/utils"

import type { Permission, Role } from "../types/role.types"

type PermissionToggleProps = {
  label: string
  checked: boolean
  onToggle: () => void
}

function PermissionToggle({ label, checked, onToggle }: PermissionToggleProps) {
  return (
    <div
      role="checkbox"
      aria-checked={checked}
      tabIndex={0}
      onClick={onToggle}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault()
          onToggle()
        }
      }}
      className={cn(
        "flex min-w-0 cursor-pointer select-none items-center gap-2.5 rounded-xl px-3 py-2.5 transition-colors",
        checked ? "bg-gray-500/10" : "hover:bg-white/4",
      )}
    >
      <span
        className={cn(
          "flex size-4.5 shrink-0 items-center justify-center rounded-md transition-colors",
          checked
            ? "bg-green-500"
            : "bg-white/4",
        )}
      >
        {checked && <Check size={11} strokeWidth={3} className="text-black" />}
      </span>

      <span
        className={cn(
          "min-w-0 truncate text-sm transition-colors",
          checked ? "text-neutral-100" : "text-neutral-400",
        )}
      >
        {label}
      </span>
    </div>
  )
}

type PermissionGroupProps = {
  title: string
  permissions: Permission[]
  checkedIds: Set<string>
  onToggle: (permissionId: string) => void
  onToggleAll: (permissionIds: string[], nextChecked: boolean) => void
  getLabel: (permission: Permission) => string
}

function PermissionGroup({
  title,
  permissions,
  checkedIds,
  onToggle,
  onToggleAll,
  getLabel,
}: PermissionGroupProps) {
  const ids = useMemo(() => permissions.map((p) => p.id), [permissions])
  const allChecked = ids.every((id) => checkedIds.has(id))
  const someChecked = !allChecked && ids.some((id) => checkedIds.has(id))

  return (
    <section className="min-w-0 rounded-2xl bg-white/2 p-4">
      <header className="mb-3 flex items-center justify-between gap-3">
        <h3 className="truncate text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
          {title}
        </h3>

        <button
          type="button"
          onClick={() => onToggleAll(ids, !allChecked)}
          className={cn(
            "shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide transition-colors",
            allChecked
              ? "bg-green-500/15 text-green-400 hover:bg-green  -500/20"
              : "bg-white/5 text-neutral-500 hover:bg-white/8 hover:text-neutral-300",
          )}
        >
          {allChecked ? "Todos" : someChecked ? "Completar" : "Seleccionar todos"}
        </button>
      </header>

      <div className="grid grid-cols-1 gap-1 tablet:grid-cols-2 desktop:grid-cols-3">
        {permissions.map((permission) => (
          <PermissionToggle
            key={permission.id}
            label={getLabel(permission)}
            checked={checkedIds.has(permission.id)}
            onToggle={() => onToggle(permission.id)}
          />
        ))}
      </div>
    </section>
  )
}

// -----------------------------------------------------------------
// Fila de rol en DESKTOP -- lista plana dentro del aside, sin card
// propia (el aside ya es el panel completo).
// -----------------------------------------------------------------
type RoleRowProps = {
  role: Role
  selected: boolean
  onSelect: () => void
}

function RoleDesktopRow({ role, selected, onSelect }: RoleRowProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
        selected
          ? "bg-white/10 text-white"
          : "hover:bg-white/4 text-neutral-300"
      )}
    >
      <div className="flex min-w-0 items-center gap-2.5">
        <span
          className="size-2.5 shrink-0 rounded-full"
          style={{ backgroundColor: role.color || "#71717a" }}
        />
        <span className="truncate text-sm font-medium">
          {role.name}
        </span>
      </div>

      {!role.active && (
        <span className="shrink-0 text-xs text-neutral-500">Inactivo</span>
      )}
    </button>
  )
}

// -----------------------------------------------------------------
// Card de rol en MOBILE -- copia exacta de la estructura de
// UserMobileCard: header con label chico ("ROL 001") + estado a la
// derecha, después una fila con el badge de color a ancho completo.
// Sin chevron: en Usuarios el chevron abre detalles inline (mismo
// card se expande), acá tocar la card ya navega directo al panel de
// Permisos -- no hay nada que expandir en el lugar.
// -----------------------------------------------------------------
type RoleMobileRowProps = {
  role: Role
  index: number
  onSelect: () => void
}

function RoleMobileRow({ role, index, onSelect }: RoleMobileRowProps) {

  return (

    <article className="overflow-hidden rounded-xl bg-white/2">

      <button
        type="button"
        onClick={onSelect}
        className="w-full text-left"
      >

        <header className="flex items-center justify-between gap-2.5 px-3 py-3">

          <span className="text-xs font-semibold tracking-[0.12em] text-neutral-500">
            ROL {String(index + 1).padStart(3, "0")}
          </span>

          {!role.active && (
            <span className="text-xs font-medium text-neutral-500">
              Inactivo
            </span>
          )}

        </header>

        <div className="flex items-center gap-2.5 px-3 pb-3">

          <div className="min-w-0 flex-1">

            <DynamicBadge
              label={role.name}
              icon={role.icon}
              color={role.color}
              width="field"
            />

          </div>

        </div>

      </button>

    </article>

  )

}

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
          isMobile ? "mt-3 flex-col" : "overflow-hidden"
        )}
      >
        {/* PANEL ROLES */}
        {showRolesPanel && isMobile && (
          // Mobile: igual que UserTable -- sin aside, sin borde, sin
          // fondo, sin título "Roles" -- las cards sueltas directo
          // sobre el negro de la página. El panel envolvente
          // (rounded-2xl border bg) es cosa de desktop únicamente.
          <div className="space-y-3">
            {loadingRoles && <RolesMobileSkeleton />}

            {!loadingRoles && filteredRoles.length === 0 && (
              <div className="rounded-2xl bg-[#101012] px-4 py-8 text-center text-sm text-neutral-500">
                {search ? "Ningún rol coincide con la búsqueda." : "No hay roles todavía."}
              </div>
            )}

            {!loadingRoles &&
              filteredRoles.map((role, index) => (
                <RoleMobileRow
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
              {loadingRoles && <RolesListSkeleton />}

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
          // Mobile: sin <section> envolvente con borde/fondo -- mismo
          // criterio que el panel de Roles de al lado. El header va
          // suelto arriba, y cada PermissionGroup ya es su propia
          // card (rounded-2xl bg-white/2) flotando directo sobre el
          // negro de la página, como las secciones de la Bitácora.
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