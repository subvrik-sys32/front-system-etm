"use client"

import { useState } from "react"

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
 * Mismo trigger field (DynamicBadge) que roles / sub-nivel.
 * 0 áreas → placeholder; 1 → un badge; 2+ → chips separados (no "A, B, C").
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

  const single = value.length === 1 ? value[0] : null
  const singleVisuals = single ? getAreaVisuals(single) : null

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className="flex w-full min-w-0 items-center">
        {value.length <= 1 ? (
          <DynamicBadge
            label={single?.label ?? placeholder}
            color={singleVisuals?.color ?? "#64748B"}
            icon={singleVisuals?.icon}
            placeholder={value.length === 0}
            width="field"
            showChevron
            chevronOpen={open}
          />
        ) : (
          <DynamicBadge
            label={value.map(a => a.label).join(" · ")}
            color="#64748B"
            placeholder={false}
            width="field"
            showChevron
            chevronOpen={open}
          />
        )}
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
