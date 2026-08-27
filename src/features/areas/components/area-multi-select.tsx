"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import {
  Command,
  CommandGroup,
  CommandList,
} from "@/components/ui/command"

import { DynamicBadge } from "@/shared/ui/badge/dynamic-badge"
import { SelectOption } from "@/shared/ui/select-option/select-option"
import { withSelectedFirst } from "@/shared/utils/with-selected-first"
import { cn } from "@/shared/utils/utils"
import { PROCESS_DEFINITIONS } from "@/features/processes/constants/process-definitions"
import type { ProcessCode } from "@/features/tasks/types/task.types"

import { useAreas } from "../hooks/use-areas"
import type { Area } from "../types/area.types"

function isProcessCode(value: string | null): value is ProcessCode {
  return !!value && value in PROCESS_DEFINITIONS
}

function getAreaVisuals(area: Area) {
  if (isProcessCode(area.processCode)) {
    const definition = PROCESS_DEFINITIONS[area.processCode]
    return {
      icon: definition.icon,
      color: definition.color,
    }
  }
  return {
    icon: "shield" as const,
    color: "#64748B",
  }
}

type Props = {
  value: Area[]
  placeholder?: string
  onChange: (areas: Area[]) => void
}

/**
 * Multi-área: cada área es un chip visual (no "A, B, C" en un solo badge).
 * El popover no cierra al marcar — se pueden elegir varias seguidas.
 */
export function AreaMultiSelect({
  value,
  placeholder = "Seleccionar áreas",
  onChange,
}: Props) {
  const [open, setOpen] = useState(false)
  const { areas } = useAreas()

  function toggleArea(area: Area) {
    const isSelected = value.some(v => v.id === area.id)
    onChange(
      isSelected
        ? value.filter(v => v.id !== area.id)
        : [...value, area],
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className="flex w-full min-w-0 items-center">
        <div
          className={cn(
            "flex min-h-9 w-full min-w-0 items-center gap-1.5 rounded-xl bg-foreground/5 px-2 py-1.5 text-left transition-colors",
            "hover:bg-foreground/8",
            open && "bg-foreground/10",
          )}
        >
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1">
            {value.length === 0 ? (
              <span className="px-1 text-xs text-muted-foreground">
                {placeholder}
              </span>
            ) : (
              value.map(area => {
                const v = getAreaVisuals(area)
                return (
                  <DynamicBadge
                    key={area.id}
                    label={area.label}
                    color={v.color}
                    icon={v.icon}
                    width="auto"
                  />
                )
              })
            )}
          </div>
          <ChevronDown
            size={14}
            className={cn(
              "shrink-0 text-muted-foreground transition-transform",
              open && "rotate-180",
            )}
          />
        </div>
      </PopoverTrigger>

      <PopoverContent sideOffset={8} floatingClassName="w-64" className="p-2">
        <Command className="bg-transparent">
          <CommandList className="max-h-none overflow-visible tablet:max-h-64 tablet:overflow-y-auto">
            <CommandGroup>
              {withSelectedFirst(
                areas,
                new Set(value?.map(a => a.id) ?? []),
              ).map(area => {
                const optionVisuals = getAreaVisuals(area)
                const selected = value.some(v => v.id === area.id)
                return (
                  <SelectOption
                    key={area.id}
                    label={area.label}
                    icon={optionVisuals.icon}
                    color={optionVisuals.color}
                    selected={selected}
                    onSelect={() => toggleArea(area)}
                  />
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
