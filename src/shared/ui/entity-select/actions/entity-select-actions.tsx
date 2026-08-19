"use client"

import { useState } from "react"
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type Props = {
  onEdit?: () => void
  onDelete?: () => void
  color?: string
}

export function EntitySelectActionMenu({
  onEdit,
  onDelete,
  color,
}: Props) {
  const [open, setOpen] = useState(false)
  const hasActions = !!(onEdit || onDelete)

  if (!hasActions) {
    return null
  }

  const handleEdit = () => {
    setOpen(false)
    requestAnimationFrame(() => {
      onEdit?.()
    })
  }

  const handleDelete = () => {
    setOpen(false)
    requestAnimationFrame(() => {
      onDelete?.()
    })
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
          }}
          className="flex h-7 w-7 items-center justify-center rounded-lg transition-colors hover:bg-foreground/10 focus-visible:outline-none"
          style={{
            color: color ?? "rgba(255,255,255,0.5)",
          }}
          aria-label="Opciones"
        >
          <MoreHorizontal size={15} strokeWidth={2} />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        side="bottom"
        align="end"
        sideOffset={4}
        onClick={(e) => e.stopPropagation()}
        onPointerDownOutside={(e) => {
          e.preventDefault()
          setOpen(false)
        }}
        onCloseAutoFocus={(e) => {
          e.preventDefault()
        }}
        className="z-50 min-w-32 rounded-xl border-0 bg-popover p-1 text-popover-foreground shadow-xl"
      >
        {onEdit && (
          <DropdownMenuItem
            onSelect={handleEdit}
            className="flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-foreground/10 hover:text-foreground focus:bg-foreground/10 focus:text-foreground"
          >
            <Pencil size={13} className="shrink-0 text-muted-foreground" />
            <span>Editar</span>
          </DropdownMenuItem>
        )}

        {onEdit && onDelete && (
          <DropdownMenuSeparator className="my-1 h-px bg-foreground/10" />
        )}

        {onDelete && (
          <DropdownMenuItem
            onSelect={handleDelete}
            className="flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-red-600 hover:bg-red-500/10 hover:text-red-600 focus:bg-red-500/10 focus:text-red-600 dark:text-red-400 dark:hover:bg-red-500/20 dark:hover:text-red-400 dark:focus:bg-red-500/20 dark:focus:text-red-400"
          >
            <Trash2 size={13} className="shrink-0" />
            <span>Eliminar</span>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}