"use client"

import { useMemo, useState } from "react"
import type { EntityBase } from "@/shared/types/entity-base.types"

type Props<T extends EntityBase> = {
  value?: T
  items: T[]
  onChange: (value?: T) => void
}

export function useEntitySelect<T extends EntityBase>({
  value,
  items,
  onChange,
}: Props<T>) {

  const [open, setOpen] = useState(false)

  const [dialogOpen, setDialogOpen] = useState(false)

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState<T | undefined>(undefined)

  const [editing, setEditing] = useState<T | undefined>(undefined)

  const [query, setQuery] = useState("")

  const filteredItems = useMemo(() => {
    const s = query.trim().toLowerCase()

    const source = s
      ? items.filter(i => i.name.toLowerCase().includes(s))
      : items

    if (!value) return source

    return [
      ...source.filter(i => i.id === value.id),
      ...source.filter(i => i.id !== value.id),
    ]
  }, [items, query, value])

  function closePopover() {
    setOpen(false)
    setQuery("")
  }

  function openDialog(item?: T) {
    setEditing(item)
    setDialogOpen(true)
    closePopover()
  }

  function closeDialog() {
    setEditing(undefined)
    setDialogOpen(false)
  }

  // ✅ DELETE FLOW CONTROLADO
  function requestDelete(item: T) {
    setDeleting(item)
    setDeleteOpen(true)
    closePopover()
  }

  function closeDelete() {
    setDeleting(undefined)
    setDeleteOpen(false)
  }

  function handleSelect(item: T) {

    const isDeselecting = value?.id === item.id

    onChange(isDeselecting ? undefined : item)

    closePopover()
  }

  function handleClear() {
    onChange(undefined)
    closePopover()
  }

  function handleCreate() {
    openDialog()
  }

  function handleEdit(item: T) {
    openDialog(item)
  }

  return {
    open,
    setOpen,

    dialogOpen,
    deleteOpen,
    deleting,

    editing,

    query,
    setQuery,

    filteredItems,

    handleSelect,
    handleClear,
    handleCreate,
    handleEdit,

    requestDelete,
    closeDelete,

    closeDialog,
  }
}