"use client"

import { useEffect, useMemo, useState } from "react"
import { ArrowLeft, Plus, Trash2 } from "lucide-react"

import { PermissionCode } from "@/shared/core/enums/permission-code.enum"
import { usePermissions } from "@/features/permissions/hooks/use-permissions"
import { useRoles } from "@/features/roles/hooks/use-roles"
import { useResponsive } from "@/shared/responsive/hooks/use-responsive"
import { PrimaryAction } from "@/shared/ui/actions/primary-action"
import { ActionDialog } from "@/shared/ui/dialogs/action-dialog/action-dialog"
import { EntityToolbar } from "@/shared/ui/entity-toolbar/entity-toolbar"
import { EntityToolbarSearch } from "@/shared/ui/entity-toolbar/entity-toolbar-search"
import { cn } from "@/shared/utils/utils"
import type { EntityIcon } from "@/shared/constants/entity-icons"

import { useUserMutations } from "@/features/users/hooks/use-user-mutations"
import { useUsers } from "@/features/users/hooks/use-users"
import { validateUser } from "../hooks/validate-user"
import { UserMobileCard } from "./cards/user-mobile-card"
import { UserMobileSkeleton } from "./cards/user-mobile-skeleton"
import { UserDesktopRow } from "./user-desktop-row"
import { UserDesktopRowSkeleton } from "./user-desktop-row-skeleton"
import { UserForm } from "./form/user-form"
import { UserDialog } from "./dialog/user-dialog"

// Reutilizamos los mismos componentes de fila/skeleton que usa la pantalla de Roles
import {
  RoleDesktopRow,
  RoleDesktopRowSkeleton,
  RoleMobileCard,
  RoleMobileSkeleton,
} from "@/features/roles/table"
import type { Role } from "@/features/roles/types/role.types"

type UserFormData = {
  name: string
  username: string
  email: string
  password: string
  confirmPassword: string
  isChangingPassword: boolean
  roleId: string
  level: "GENERAL" | "OPERARIO" | "SUPERVISOR" | null
  icon: EntityIcon
  color: string
  active: boolean
}

export function UsersPageContent() {
  const { isMobile } = useResponsive()
  const { users, loading } = useUsers()
  const { roles, loading: loadingRoles } = useRoles()
  const { createUser, updateUser, deleteUser } = useUserMutations()
  const { has } = usePermissions()

  const canCreate = has(PermissionCode.USER_CREATE)
  const canUpdate = has(PermissionCode.USER_UPDATE)
  const canDelete = has(PermissionCode.USER_DELETE)

  const [search, setSearch] = useState("")

  // Navegación en dos niveles dentro del aside: primero Roles, luego Usuarios de ese rol
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [mobileCreateOpen, setMobileCreateOpen] = useState(false)

  const [formData, setFormData] = useState<UserFormData>({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    isChangingPassword: false,
    roleId: "",
    level: null,
    icon: "user",
    color: "#7C3AED",
    active: true,
  })

  const [attempted, setAttempted] = useState(false)

  const selectedRole = useMemo(
    () => roles.find(r => r.id === selectedRoleId) ?? null,
    [roles, selectedRoleId],
  )

  // Nivel 1: lista de roles (cuando todavía no se eligió ninguno)
  const filteredRoles = useMemo(() => {
    const q = search.trim().toLowerCase()
    return roles.filter(r => !q || r.name.toLowerCase().includes(q))
  }, [roles, search])

  // Nivel 2: usuarios pertenecientes al rol elegido
  const usersInSelectedRole = useMemo(() => {
    if (!selectedRoleId) return []
    return users.filter(u => u.role.id === selectedRoleId)
  }, [users, selectedRoleId])

  const filteredUsersInRole = useMemo(() => {
    const q = search.trim().toLowerCase()
    return usersInSelectedRole.filter(
      u =>
        !q ||
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.username ?? "").toLowerCase().includes(q),
    )
  }, [usersInSelectedRole, search])

  const selectedUser = useMemo(
    () => users.find(u => u.id === selectedUserId),
    [users, selectedUserId],
  )

  // Sincronización del formulario SOLO cuando hay un usuario elegido explícitamente
  useEffect(() => {
    if (isCreating || !selectedUser) return

    setFormData({
      name: selectedUser.name,
      username: selectedUser.username ?? "",
      email: selectedUser.email,
      password: "",
      confirmPassword: "",
      isChangingPassword: false,
      roleId: selectedUser.role.id,
      level: selectedUser.level ?? null,
      icon: (selectedUser.icon as EntityIcon) ?? "user",
      color: selectedUser.color ?? "#7C3AED",
      active: selectedUser.active,
    })
    setAttempted(false)
  }, [selectedUser, isCreating])

  const errors = validateUser({
    name: formData.name,
    username: formData.username,
    email: formData.email,
    password: formData.password,
    confirmPassword: formData.confirmPassword,
    roleId: formData.roleId,
    isEditing: !isCreating,
    isChangingPassword: formData.isChangingPassword,
  })

  const isValid = Object.keys(errors).length === 0
  const isSaving = createUser.isPending || updateUser.isPending

  const handleSelectRole = (role: Role) => {
    setSelectedRoleId(role.id)
    setSelectedUserId(null)
    setIsCreating(false)
    setSearch("")
  }

  const handleBackToRoles = () => {
    setSelectedRoleId(null)
    setSelectedUserId(null)
    setIsCreating(false)
    setSearch("")
  }

  const handleSelectUser = (userId: string) => {
    setIsCreating(false)
    setSelectedUserId(userId)
  }

  const handleStartCreate = () => {
    if (!selectedRoleId) return

    if (isMobile) {
      setMobileCreateOpen(true)
      return
    }

    setIsCreating(true)
    setSelectedUserId(null)
    setFormData({
      name: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      isChangingPassword: true,
      roleId: selectedRoleId,
      level: null,
      icon: "user",
      color: "#7C3AED",
      active: true,
    })
    setAttempted(false)
  }

  const handleSave = async () => {
    if (!isValid) {
      setAttempted(true)
      return
    }

    const payload = {
      name: formData.name,
      username: formData.username,
      email: formData.email,
      roleId: formData.roleId,
      level: formData.level,
      icon: formData.icon,
      color: formData.color,
      active: formData.active,
      ...(formData.password.trim() && { password: formData.password }),
    }

    if (isCreating) {
      const res = await createUser.mutateAsync(payload)
      setIsCreating(false)
      if (res?.id) setSelectedUserId(res.id)
    } else if (selectedUserId) {
      await updateUser.mutateAsync({ id: selectedUserId, dto: payload })
    }
  }

  const handleDelete = async () => {
    if (!selectedUserId) return
    await deleteUser.mutateAsync(selectedUserId)
    setDeleteOpen(false)
    setSelectedUserId(null)
  }

  const selectedFormRole = roles.find(r => r.id === formData.roleId)
  const showRightPanel = isCreating || !!selectedUserId

  return (
    <div
      className={cn(
        "mx-auto flex w-full max-w-400 flex-col",
        isMobile ? "" : "h-full min-h-0 overflow-hidden",
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
          isMobile ? "flex-col" : "overflow-hidden",
        )}
      >
        {isMobile && (
          /* Vista Móvil: primero Roles (misma vista que Roles/Permisos), luego Usuarios del rol elegido */
          <div className="flex min-h-0 flex-1 flex-col gap-4">
            {!selectedRole && (
              <div className="space-y-3">
                {loadingRoles ? (
                  <RoleMobileSkeleton />
                ) : filteredRoles.length === 0 ? (
                  <div className="rounded-2xl bg-[#101012] px-4 py-8 text-center text-sm text-neutral-500">
                    {search ? "Ningún rol coincide con la búsqueda." : "No hay roles todavía."}
                  </div>
                ) : (
                  filteredRoles.map((role, index) => (
                    <RoleMobileCard
                      key={role.id}
                      role={role}
                      index={index}
                      onSelect={() => handleSelectRole(role)}
                    />
                  ))
                )}
              </div>
            )}

            {selectedRole && (
              <>
                <header className="flex shrink-0 items-center gap-3">
                  <button
                    type="button"
                    onClick={handleBackToRoles}
                    className="flex size-8 shrink-0 items-center justify-center rounded-xl text-neutral-400 transition-colors hover:bg-white/8 hover:text-white"
                  >
                    <ArrowLeft size={16} />
                  </button>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
                      Usuarios
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <span
                        className="size-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: selectedRole.color || "#71717a" }}
                      />
                      <span className="truncate text-sm font-medium text-white">
                        {selectedRole.name}
                      </span>
                    </div>
                  </div>
                  {canCreate && (
                    <button
                      type="button"
                      onClick={handleStartCreate}
                      className="ml-auto flex size-9 items-center justify-center rounded-xl bg-white/8 text-white transition-colors hover:bg-white/14"
                    >
                      <Plus size={16} />
                    </button>
                  )}
                </header>

                <div className="space-y-3">
                  {loading ? (
                    <UserMobileSkeleton />
                  ) : filteredUsersInRole.length === 0 ? (
                    <p className="px-3 py-6 text-center text-sm text-neutral-500">
                      {search
                        ? "Ningún usuario coincide con la búsqueda."
                        : "Este rol todavía no tiene usuarios."}
                    </p>
                  ) : (
                    filteredUsersInRole.map((u, i) => (
                      <UserMobileCard
                        key={u.id}
                        user={u}
                        index={i}
                        expanded={selectedUserId === u.id}
                        onToggle={() =>
                          setSelectedUserId(curr => (curr === u.id ? null : u.id))
                        }
                      />
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {!isMobile && (
        /* Vista Desktop - Panel Maestro Detalle */
        <div className="flex min-h-0 flex-1 gap-4 overflow-hidden">
          {/* Panel Izquierdo: Roles -> Usuarios del rol */}
          <aside className="flex h-full w-72 shrink-0 flex-col overflow-hidden rounded-2xl border border-white/6 bg-[#101012]">
            {!selectedRole ? (
              <>
                <div className="shrink-0 px-4 py-3">
                  <p className="truncate text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
                    Roles
                  </p>
                </div>

                <div
                  className="erp-scrollbar flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto p-2"
                  style={{ scrollbarGutter: "stable" }}
                >
                  {loadingRoles ? (
                    <RoleDesktopRowSkeleton />
                  ) : filteredRoles.length === 0 ? (
                    <p className="px-3 py-6 text-center text-sm text-neutral-500">
                      {search ? "Ningún rol coincide con la búsqueda." : "No hay roles todavía."}
                    </p>
                  ) : (
                    filteredRoles.map(role => (
                      <RoleDesktopRow
                        key={role.id}
                        role={role}
                        selected={false}
                        onSelect={() => handleSelectRole(role)}
                      />
                    ))
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="flex shrink-0 items-center gap-2 px-3 py-3">
                  <button
                    type="button"
                    onClick={handleBackToRoles}
                    className="flex size-8 shrink-0 items-center justify-center rounded-xl text-neutral-400 transition-colors hover:bg-white/8 hover:text-white"
                  >
                    <ArrowLeft size={16} />
                  </button>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
                      Usuarios
                    </p>
                    <div className="mt-0.5 flex items-center gap-2">
                      <span
                        className="size-2 shrink-0 rounded-full"
                        style={{ backgroundColor: selectedRole.color || "#71717a" }}
                      />
                      <span className="truncate text-xs font-medium text-neutral-300">
                        {selectedRole.name}
                      </span>
                    </div>
                  </div>
                  {canCreate && (
                    <button
                      type="button"
                      onClick={handleStartCreate}
                      className="ml-auto flex size-8 shrink-0 items-center justify-center rounded-xl bg-white/8 text-white transition-colors hover:bg-white/14"
                    >
                      <Plus size={16} />
                    </button>
                  )}
                </div>

                <div
                  className="erp-scrollbar flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto p-2"
                  style={{ scrollbarGutter: "stable" }}
                >
                  {loading ? (
                    <UserDesktopRowSkeleton />
                  ) : filteredUsersInRole.length === 0 ? (
                    <p className="px-3 py-6 text-center text-sm text-neutral-500">
                      {search
                        ? "Ningún usuario coincide con la búsqueda."
                        : "Este rol todavía no tiene usuarios."}
                    </p>
                  ) : (
                    filteredUsersInRole.map(u => (
                      <UserDesktopRow
                        key={u.id}
                        user={u}
                        selected={!isCreating && selectedUserId === u.id}
                        onSelect={() => handleSelectUser(u.id)}
                      />
                    ))
                  )}
                </div>
              </>
            )}
          </aside>

          {/* Panel Derecho: Detalle y Formulario de Usuario */}
          <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-white/6 bg-[#101012]">
            {!showRightPanel ? (
              <div className="m-5 flex h-full min-h-52 items-center justify-center rounded-2xl bg-white/2">
                <div className="text-center">
                  <p className="text-base font-medium text-neutral-300">
                    {selectedRole ? "Ningún usuario seleccionado" : "Ningún rol seleccionado"}
                  </p>
                  <p className="mt-2 text-sm text-neutral-500">
                    {selectedRole
                      ? "Elegí un usuario desde el panel izquierdo para ver o editar sus datos."
                      : "Elegí un rol desde el panel izquierdo para ver sus usuarios."}
                  </p>
                </div>
              </div>
            ) : (
              <>
                <header className="flex shrink-0 items-start justify-between gap-4 px-5 py-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
                        {isCreating ? "Nuevo usuario" : "Usuario"}
                      </p>
                      <div className="mt-1 flex items-center gap-2.5">
                        <div className="flex items-center gap-2">
                          <span
                            className="size-2.5 shrink-0 rounded-full"
                            style={{ backgroundColor: formData.color || "#71717a" }}
                          />
                          <span className="truncate text-sm font-medium text-white">
                            {isCreating
                              ? "Asigná credenciales y permisos"
                              : selectedUser?.name || "Detalle del usuario"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-3">
                    {!isCreating && canDelete && selectedUserId && (
                      <button
                        type="button"
                        onClick={() => setDeleteOpen(true)}
                        className="flex size-9 items-center justify-center rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}

                    <PrimaryAction
                      label={
                        isSaving
                          ? "Guardando..."
                          : isCreating
                            ? "Crear usuario"
                            : "Guardar cambios"
                      }
                      disabled={!canUpdate || isSaving}
                      onClick={handleSave}
                    />
                  </div>
                </header>

                <div className="erp-scrollbar min-h-0 flex-1 overflow-y-auto p-5">
                <UserForm
                  name={formData.name}
                  username={formData.username}
                  email={formData.email}
                  password={formData.password}
                  confirmPassword={formData.confirmPassword}
                  isEditing={!isCreating}
                  isChangingPassword={formData.isChangingPassword}
                  icon={formData.icon}
                  color={formData.color}
                  roles={roles}
                  selectedRole={selectedFormRole}
                  level={formData.level}
                  errors={attempted ? errors : undefined}
                  onRoleChange={roleId => {
                    const nextRole = roles.find(r => r.id === roleId)
                    setFormData(c => ({
                      ...c,
                      roleId,
                      ...(nextRole?.code !== "PRODUCCION" && { level: null }),
                    }))
                  }}
                  onLevelChange={level => setFormData(c => ({ ...c, level }))}
                  onChangingPasswordChange={val =>
                    setFormData(c => ({ ...c, isChangingPassword: val }))
                  }
                  onNameChange={val => setFormData(c => ({ ...c, name: val }))}
                  onUsernameChange={val =>
                    setFormData(c => ({ ...c, username: val }))
                  }
                  onEmailChange={val => setFormData(c => ({ ...c, email: val }))}
                  onPasswordChange={val =>
                    setFormData(c => ({ ...c, password: val }))
                  }
                  onConfirmPasswordChange={val =>
                    setFormData(c => ({ ...c, confirmPassword: val }))
                  }
                  onColorChange={val => setFormData(c => ({ ...c, color: val }))}
                />
                </div>
              </>
            )}
          </section>
        </div>
        )}
      </div>

      {/* Modal de creación para dispositivos móviles */}
      {isMobile && (
        <UserDialog
          open={mobileCreateOpen}
          onClose={() => setMobileCreateOpen(false)}
        />
      )}

      {/* Modal de confirmación de borrado */}
      <ActionDialog
        open={deleteOpen}
        title="Eliminar usuario"
        description={`Se eliminará "${selectedUser?.name}". Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        submittingLabel="Eliminando..."
        variant="danger"
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
      />
    </div>
  )
}