"use client"

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
}

export function EntitySelectActionMenu({
  onEdit,
  onDelete,
}: Props) {

  const hasActions = !!(onEdit || onDelete)

  if (!hasActions) {
    return null
  }

  return (
    <DropdownMenu>

      <DropdownMenuTrigger asChild>
        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          className="flex h-8 w-8 items-center justify-center rounded-md text-white/40 transition hover:bg-white/5 hover:text-white"
        >
          <MoreHorizontal size={16} />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-44 rounded-lg border border-white/10 bg-[#141416] p-1 z-9999"
      >

        {onEdit && (
          <DropdownMenuItem
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onEdit()
            }}
            className="flex items-center gap-2 rounded-md px-2 py-2 text-sm text-white/70 hover:bg-white/5 hover:text-white"
          >
            <Pencil size={14} className="text-white/50" />
            Editar
          </DropdownMenuItem>
        )}

        {onEdit && onDelete && (
          <DropdownMenuSeparator className="my-1 bg-white/10" />
        )}

        {onDelete && (
          <DropdownMenuItem
            variant="destructive"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onDelete()
            }}
            className="flex items-center gap-2 rounded-md px-2 py-2 text-sm"
          >
            <Trash2 size={14} />
            Eliminar
          </DropdownMenuItem>
        )}

      </DropdownMenuContent>

    </DropdownMenu>
  )
}