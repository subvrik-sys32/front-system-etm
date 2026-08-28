"use client"

import { useState } from "react"
import { ChevronDown, Pencil, Trash2 } from "lucide-react"

import { DynamicBadge } from "@/shared/ui/badge/dynamic-badge"
import { cn } from "@/shared/utils/utils"
import { PermissionCode } from "@/shared/core/enums/permission-code.enum"
import { usePermissions } from "@/features/permissions/hooks/use-permissions"
import { useUserMutations } from "@/features/users/hooks/use-user-mutations"
import { IconAction } from "@/shared/ui/actions/icon-action"
import { ActionDialog } from "@/shared/ui/dialogs/action-dialog/action-dialog"
import type { User } from "@/features/users/types/user.types"
import { UserMobileInlineEditor } from "../inline/user-mobile-inline-editor"

type Props =
  | {
      loading: true
      opacity?: number
      user?: undefined
      index?: number
      expanded?: boolean
      onToggle?: () => void
    }
  | {
      loading?: false
      opacity?: number
      user: User
      index: number
      expanded: boolean
      onToggle: () => void
    }

export function UserMobileCard(props: Props) {
  if (props.loading) {
    const opacity = props.opacity ?? 1
    return (
      <article className="rounded-xl bg-foreground/5" style={{ opacity }} aria-hidden>
        <div className="w-full text-left">
          <header className="flex animate-pulse items-center justify-between gap-2.5 px-3 py-3">
            <span className="h-4 w-24 rounded bg-foreground/10" />
            <span className="inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-foreground/10" />
              <span className="h-4 w-16 rounded bg-foreground/10" />
            </span>
          </header>
          <div className="flex animate-pulse items-center gap-2.5 px-3 pb-3">
            <div className="min-w-0 flex-1">
              <span className="block h-8 w-full rounded-full bg-foreground/5" />
            </div>
            <span className="h-4 w-4 shrink-0 rounded-sm bg-foreground/5" />
          </div>
        </div>
      </article>
    )
  }

  const { user, index, expanded, onToggle } = props
  const { has } = usePermissions()
  const { deleteUser } = useUserMutations()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const canDelete = has(PermissionCode.USER_DELETE)

  const handleDelete = async () => {
    if (!canDelete) return
    try {
      await deleteUser.mutateAsync(user.id)
      setDeleteOpen(false)
      if (expanded) onToggle()
    } catch (error) {
      console.error("USER DELETE ERROR", error)
    }
  }

  return (
    <article className="overflow-hidden rounded-xl bg-foreground/5">
      <button type="button" onClick={onToggle} className="w-full text-left">
        <header className="flex items-center justify-between gap-2.5 px-3 py-3">
          <span className="text-xs font-semibold tracking-[0.12em] text-muted-foreground">
            USUARIO {String(index + 1).padStart(3, "0")}
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <span
              aria-hidden
              className={
                user.online
                  ? "h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,.8)]"
                  : "h-1.5 w-1.5 rounded-full bg-muted-foreground"
              }
            />
            {user.online ? "En línea" : "Desconectado"}
          </span>
        </header>

        <div className="flex items-center gap-2.5 px-3 pb-3">
          <div className="min-w-0 flex-1">
            <DynamicBadge
              label={user.name}
              icon={user.icon}
              color={user.color}
              width="field"
            />
          </div>
          <ChevronDown
            size={16}
            className={cn(
              "shrink-0 text-muted-foreground transition-transform duration-200",
              expanded && "rotate-180",
            )}
          />
        </div>
      </button>

      {expanded && (
        <div>
          <div className="space-y-3 px-3 pb-3 pt-3">
            <dl className="space-y-3 text-sm">
              <div className="min-w-0">
                <dt className="mb-1 text-[10px] font-semibold tracking-[0.12em] text-muted-foreground">
                  USERNAME
                </dt>
                <dd className="truncate text-foreground">{user.username ?? "Sin username"}</dd>
              </div>
              <div className="min-w-0">
                <dt className="mb-1 text-[10px] font-semibold tracking-[0.12em] text-muted-foreground">
                  EMAIL
                </dt>
                <dd className="truncate text-muted-foreground">{user.email}</dd>
              </div>
            </dl>
          </div>
          <div className="flex items-center justify-end gap-5 px-3 pb-3 pt-1">
            <IconAction
              icon={Pencil}
              title="Editar"
              aria-label="Editar usuario"
              disabled={!has(PermissionCode.USER_UPDATE)}
              onClick={() => {
                if (!expanded) onToggle()
              }}
            />
            <IconAction
              icon={Trash2}
              variant="danger"
              title="Eliminar"
              aria-label="Eliminar usuario"
              disabled={!canDelete}
              onClick={() => {
                if (!canDelete) return
                setDeleteOpen(true)
              }}
            />
          </div>
          {has(PermissionCode.USER_UPDATE) && (
            <UserMobileInlineEditor user={user} onClose={onToggle} />
          )}
          <ActionDialog
            open={canDelete && deleteOpen}
            title="Eliminar usuario"
            description={`Se eliminará "${user.name}". Esta acción no se puede deshacer.`}
            confirmLabel="Eliminar"
            submittingLabel="Eliminando..."
            variant="danger"
            onClose={() => setDeleteOpen(false)}
            onConfirm={handleDelete}
          />
        </div>
      )}
    </article>
  )
}
