"use client"

import { useState } from "react"
import { Plus } from "lucide-react"

import { PermissionCode } from "@/shared/core/enums/permission-code.enum"
import { usePermissions } from "@/features/permissions/hooks/use-permissions"
import { PrimaryAction } from "@/shared/ui/actions/primary-action"
import { FabTrigger, FAB_BRAND } from "@/shared/ui/speed-dial-fab/fab-trigger"
import { useResponsive } from "@/shared/responsive/hooks/use-responsive"
import { cn } from "@/shared/utils/utils"
import { UserDialog } from "../dialog/user-dialog"

function useCreateUserDialog() {
  const [open, setOpen] = useState(false)
  const { has } = usePermissions()
  const canCreate = has(PermissionCode.USER_CREATE)

  function handleOpen() {
    if (!canCreate) return
    setOpen(true)
  }

  const dialog = open ? (
    <UserDialog open={open} onClose={() => setOpen(false)} />
  ) : null

  return { canCreate, handleOpen, dialog }
}

/** Desktop: + en topbar (PrimaryAction). Mobile: FAB fijo. */
export function UserActions() {
  const { isMobile } = useResponsive()
  const { canCreate, handleOpen, dialog } = useCreateUserDialog()

  return (
    <>
      {isMobile ? (
        <button
          type="button"
          disabled={!canCreate}
          onClick={handleOpen}
          aria-label="Nuevo usuario"
          className={cn(
            "fixed bottom-22 right-4 z-30 flex size-12 items-center justify-center rounded-full transition duration-200",
            canCreate
              ? FAB_BRAND
              : "cursor-not-allowed bg-foreground/10 text-foreground/35 shadow-none",
          )}
        >
          <Plus size={20} strokeWidth={2.5} />
        </button>
      ) : (
        <PrimaryAction
          label="Nuevo usuario"
          icon={Plus}
          disabled={!canCreate}
          onClick={handleOpen}
          iconOnly
        />
      )}
      {dialog}
    </>
  )
}

export function UserCreateDialAction() {
  const { canCreate, handleOpen, dialog } = useCreateUserDialog()

  return (
    <>
      <FabTrigger
        icon={Plus}
        label="NUEVO USUARIO"
        disabled={!canCreate}
        onClick={handleOpen}
        accentClassName={FAB_BRAND}
        className={!canCreate ? "cursor-not-allowed opacity-40" : undefined}
      />
      {dialog}
    </>
  )
}
