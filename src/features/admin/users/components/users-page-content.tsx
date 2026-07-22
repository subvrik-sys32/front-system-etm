"use client"

import { useEffect, useMemo, useState } from "react"
import { Plus, Trash2 } from "lucide-react"

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
  const { roles } = useRoles()
  const { createUser, updateUser, deleteUser } = useUserMutations()
  const { has } = usePermissions()

  const canCreate = has(PermissionCode.USER_CREATE)
  const canUpdate = has(PermissionCode.USER_UPDATE)
  const canDelete = has(PermissionCode.USER_DELETE)

  const [search, setSearch] = useState("")
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [mobileCreateOpen, setMobileCreateOpen] = useState(false)

  // Estado del formulario Maestro-Detalle (Desktop)
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

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase()
    return users.filter(
      u =>
        !q ||
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.username ?? "").toLowerCase().includes(q),
    )
  }, [users, search])

  const selectedUser = useMemo(
    () => users.find(u => u.id === selectedUserId),
    [users, selectedUserId],
  )

  // Sincronización al seleccionar o cargar usuarios
  useEffect(() => {
    if (isCreating) return

    if (!selectedUserId && filteredUsers.length > 0) {
      setSelectedUserId(filteredUsers[0].id)
    } else if (selectedUser) {
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
    }
  }, [filteredUsers, selectedUserId, selectedUser, isCreating])

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

  const handleStartCreate = () => {
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
      roleId: roles[0]?.id ?? "",
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

  const selectedRole = roles.find(r => r.id === formData.roleId)

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
          /* Vista Móvil */
          <div className="space-y-3">
            {loading ? (
              <UserMobileSkeleton />
            ) : (
              filteredUsers.map((u, i) => (
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
        )}

        {!isMobile && (
        /* Vista Desktop - Panel Maestro Detalle (mismo aspecto visual que Roles) */
        <div className="flex min-h-0 flex-1 gap-4 overflow-hidden">
          {/* Panel Izquierdo: Selector / Lista de Usuarios */}
          <aside className="flex h-full w-72 shrink-0 flex-col overflow-hidden rounded-2xl border border-white/6 bg-[#101012]">
            <div className="shrink-0 px-4 py-3">
              <p className="truncate text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
                Usuarios
              </p>
            </div>

            <div
              className="erp-scrollbar flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto p-2"
              style={{ scrollbarGutter: "stable" }}
            >
              {loading ? (
                <UserDesktopRowSkeleton />
              ) : filteredUsers.length === 0 ? (
                <p className="px-3 py-6 text-center text-sm text-neutral-500">
                  {search
                    ? "Ningún usuario coincide con la búsqueda."
                    : "No hay usuarios todavía."}
                </p>
              ) : (
                filteredUsers.map(u => (
                  <UserDesktopRow
                    key={u.id}
                    user={u}
                    selected={!isCreating && selectedUserId === u.id}
                    onSelect={() => {
                      setIsCreating(false)
                      setSelectedUserId(u.id)
                    }}
                  />
                ))
              )}
            </div>
          </aside>

          {/* Panel Derecho: Detalle y Formulario de Usuario */}
          <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-white/6 bg-[#101012]">
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
              selectedRole={selectedRole}
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