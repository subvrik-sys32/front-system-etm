"use client"

import { useState } from "react"
import { Pencil, Trash2 } from "lucide-react"

import { PermissionCode } from "@/shared/core/enums/permission-code.enum"
import { usePermissions } from "@/features/permissions/hooks/use-permissions"
import { IconAction } from "@/shared/ui/actions/icon-action"
import { ActionDialog } from "@/shared/ui/dialogs/action-dialog/action-dialog"
import { UserDialog } from "@/features/admin/users/components/dialog/user-dialog"
import { useUsers } from "@/features/users/hooks/use-users"
import { useUserMutations } from "@/features/users/hooks/use-user-mutations"

type UserRowActionsProps = {
  userId: string
}

export function UserRowActions({ userId }: UserRowActionsProps) {
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const { users } = useUsers()
  const { deleteUser } = useUserMutations()
  const { has } = usePermissions()

  const canUpdate = has(PermissionCode.USER_UPDATE)
  const canDelete = has(PermissionCode.USER_DELETE)

  const user = users.find((item) => item.id === userId)

  if (!user) {
    return null
  }

  const { id, name } = user

  const handleDelete = async () => {
    if (!canDelete) return

    try {
      await deleteUser.mutateAsync(id)
      setDeleteOpen(false)
    } catch (error) {
      console.error("USER DELETE ERROR", error)
    }
  }

  return (
    <>
      <div className="ml-3 flex items-center gap-6">
        <IconAction
          icon={Pencil}
          disabled={!canUpdate}
          onClick={() => {
            if (!canUpdate) return
            setEditOpen(true)
          }}
        />

        <IconAction
          icon={Trash2}
          variant="danger"
          disabled={!canDelete}
          onClick={() => {
            if (!canDelete) return
            setDeleteOpen(true)
          }}
        />
      </div>

      <UserDialog
        open={canUpdate && editOpen}
        user={user}
        onClose={() => setEditOpen(false)}
      />

      <ActionDialog
        open={canDelete && deleteOpen}
        title="Eliminar usuario"
        description={`Se eliminará "${name}". Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        submittingLabel="Eliminando..."
        variant="danger"
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
      />
    </>
  )
}