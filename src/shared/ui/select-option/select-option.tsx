"use client"

import { Check } from "lucide-react"

import { CommandItem } from "@/components/ui/command"
import { ENTITY_ICONS, type EntityIcon } from "@/shared/constants/entity-icons"
import { EntityNameLabel } from "@/shared/ui/entity-name-label/entity-name-label"
import { EntitySelectActionMenu } from "@/shared/ui/entity-select/actions/entity-select-actions"

type Props = {
  label: string
  icon?: EntityIcon
  color: string
  selected: boolean
  swatchColor?: string
  disableCheckAnimation?: boolean
  onSelect: () => void
  onEdit?: () => void
  onDelete?: () => void
}

export function SelectOption({
  label,
  icon,
  color,
  selected,
  swatchColor,
  disableCheckAnimation,
  onSelect,
  onEdit,
  onDelete,
}: Props) {

  const Icon = icon ? ENTITY_ICONS[icon] : undefined
  const resolvedColor = swatchColor ?? color

  const actions = {
    edit: onEdit,
    delete: onDelete,
  }

  const hasActions = !!(actions.edit || actions.delete)

  return (
    <CommandItem
      value={label}
      onSelect={onSelect}
      style={selected ? { background: "rgba(255,255,255,0.03)" } : undefined}
      className="group mb-0.5 last:mb-0 w-full cursor-pointer rounded-xl border-0 px-3 py-2.5 transition-all duration-150 hover:bg-[#1c1c20]"
    >
      <div className="flex w-full items-center justify-between gap-3">

        <div className="flex min-w-0 flex-1 items-center gap-3">

          {Icon && (
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-white/5">
              <Icon size={18} strokeWidth={2} style={{ color: resolvedColor }} />
            </div>
          )}

          <EntityNameLabel
            name={label}
            className="truncate text-xs font-medium tracking-[-0.01em]"
            style={{ color: "#F5F5F5" }}
          />
        </div>

        <div className="relative flex h-8 w-14 items-center justify-end">

          {hasActions && (
            <div className="absolute right-0 opacity-0 translate-x-1 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100">
              <EntitySelectActionMenu
                onEdit={actions.edit}
                onDelete={actions.delete}
              />
            </div>
          )}

          {selected && (
            <Check
              size={16}
              strokeWidth={2.5}
              style={{ color: resolvedColor }}
              className={`absolute right-0 transition-all duration-200 ${
                disableCheckAnimation ? "" : hasActions ? "group-hover:-translate-x-10" : ""
              }`}
            />
          )}

        </div>

      </div>
    </CommandItem>
  )
}