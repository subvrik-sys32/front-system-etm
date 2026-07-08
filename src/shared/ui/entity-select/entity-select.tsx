"use client"

import { Search } from "lucide-react"
import { useRef } from "react"

import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandList,
} from "@/components/ui/command"

import { DynamicBadge } from "@/shared/ui/badge/dynamic-badge"
import { EntityDialog } from "@/shared/ui/entity-dialog/entity-dialog"
import { SelectOption } from "@/shared/ui/select-option/select-option"
import { EntitySelectActions } from "./entity-select-actions"
import { useEntitySelect } from "./hooks/use-entity-select"
import { ActionDialog } from "@/shared/ui/dialogs/action-dialog/action-dialog"

import type { EntityBase } from "@/shared/types/entity-base.types"
import type { EntityForm } from "@/shared/ui/entity-dialog/entity-dialog.types"

import {
  collectionRegistry,
  type CollectionKey,
} from "@/features/master-data/registry/collection-registry"

type Props<T extends EntityBase> = {
  collection: CollectionKey
  value?: T
  items: T[]
  placeholder: string

  onChange: (value?: T) => void

  onCreate: (dto: EntityForm) => Promise<T>
  onEdit: (params: { id: string; dto: EntityForm }) => Promise<T>
  onDelete: (id: string) => Promise<void>

  disabled?: boolean
}

export function EntitySelect<T extends EntityBase>({
  collection,
  value,
  items,
  placeholder,
  onChange,
  onCreate,
  onEdit,
  onDelete,
  disabled = false,
}: Props<T>) {

  const {
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
  } = useEntitySelect({
    value,
    items,
    onChange,
  })

  const inputRef = useRef<HTMLInputElement>(null)

  const definition = collectionRegistry[collection]

  const dialogTitle = editing
    ? `Editar ${placeholder}`
    : `Crear ${placeholder}`

  async function handleSubmit(dto: EntityForm) {
    const result = editing
      ? await onEdit({ id: editing.id, dto })
      : await onCreate(dto)

    onChange(result)
    closeDialog()
  }

  return (
    <>
      <Popover
        open={disabled ? false : open}
        onOpenChange={(v) => {

          if (disabled) {
            return
          }

          setOpen(v)

          if (!v) {
            setQuery("")
          } else {
            requestAnimationFrame(
              () => inputRef.current?.focus(),
            )
          }

        }}
      >
        <PopoverTrigger asChild>

          <button
            type="button"
            disabled={disabled}
            className="flex w-full min-w-0 items-center disabled:cursor-not-allowed"
          >

            <DynamicBadge
              label={value?.name ?? placeholder}
              color={value?.color ?? "#64748B"}
              icon={value?.icon}
              variant={collection === "colors" ? "solid" : "subtle"}
              placeholder={!value}
              width="field"
              showChevron={!disabled}
              chevronOpen={open}
            />

          </button>

        </PopoverTrigger>

        <PopoverContent className="w-72 border border-white/10 bg-[#101012] p-2">
          <Command shouldFilter={false}>
            <div className="sticky top-0 z-20 mb-2 flex items-center gap-2 bg-[#101012] px-2 pb-2">
              <Search size={14} className="text-white/35" />

              <Input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar..."
                className="h-9 border-0 bg-transparent px-0"
              />
            </div>

            <CommandList className="erp-scrollbar max-h-64 overflow-y-auto">
              <CommandEmpty>Sin resultados</CommandEmpty>

              <CommandGroup>
                {filteredItems.map((item) => (
                  <SelectOption
                    key={item.id}
                    label={item.name}
                    icon={item.icon}
                    color={item.color}
                    selected={value?.id === item.id}
                    onSelect={() => handleSelect(item)}
                    onEdit={
                      definition.canEdit
                        ? () => handleEdit(item)
                        : undefined
                    }
                    onDelete={
                      definition.canDelete
                        ? () => requestDelete(item)
                        : undefined
                    }
                  />
                ))}
              </CommandGroup>
            </CommandList>

            <EntitySelectActions
              onClear={handleClear}
              onCreate={handleCreate}
              canCreate={definition.canCreate}
            />
          </Command>
        </PopoverContent>

      </Popover>

      {/* CREATE / EDIT */}
      {dialogOpen && (
        <EntityDialog
          open={dialogOpen}
          title={dialogTitle}
          initialValue={
            editing
              ? {
                  name: editing.name,
                  icon: editing.icon,
                  color: editing.color,
                }
              : undefined
          }
          showIconPicker={definition.fields.includes("icon")}
          previewVariant={collection === "colors" ? "solid" : "subtle"}
          fixedIcon={definition.fixedIcon}
          allowedIcons={definition.allowedIcons}
          onClose={closeDialog}
          onSubmit={handleSubmit}
        />
      )}

      {/* DELETE CONFIRM */}
      {deleteOpen && deleting && (
        <ActionDialog
          open={deleteOpen}
          title="Eliminar elemento"
          description={`¿Seguro que deseas eliminar "${deleting.name}"? Esta acción no se puede deshacer.`}
          cancelLabel="Cancelar"
          confirmLabel="Eliminar"
          onClose={closeDelete}
          onConfirm={async () => {
            await onDelete(deleting.id)
            onChange(undefined)
            closeDelete()
          }}
        />
      )}
    </>
  )
}