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

import {
  DynamicBadge,
} from "@/shared/ui/badge/dynamic-badge"

import {
  SelectOption,
} from "@/shared/ui/select-option/select-option"

import type {
  EntityIcon,
} from "@/shared/constants/entity-icons"

export type Level = "OPERARIO" | "SUPERVISOR"

// Mismo criterio que roles-select.tsx: acá también son solo 2
// opciones hoy, pero si mañana se agrega un tercer sub-nivel en
// Producción, esta lista es el único lugar a tocar — el selector
// ya escala solo.
const LEVEL_OPTIONS: {
  value: Level
  label: string
  color: string
  icon: EntityIcon
}[] = [
  {
    value: "OPERARIO",
    label: "Operario",
    color: "#7C3AED",
    icon: "operator",
  },
  {
    value: "SUPERVISOR",
    label: "Supervisor",
    color: "#0284C7",
    icon: "shield",
  },
]

type Props = {
  value: Level | null
  placeholder?: string
  onChange: (level: Level | null) => void
}

export function LevelSelect({
  value,
  placeholder = "Seleccionar sub-nivel",
  onChange,
}: Props) {

  const [open, setOpen] = useState(false)

  const selected =
    LEVEL_OPTIONS.find(
      option => option.value === value,
    )

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
    >

      <PopoverTrigger className="flex w-full min-w-0 items-center">

        <DynamicBadge
          label={selected?.label ?? placeholder}
          color={selected?.color ?? "#64748B"}
          icon={selected?.icon}
          placeholder={!selected}
          width="field"
          showChevron
          chevronOpen={open}
        />

      </PopoverTrigger>

      <PopoverContent
        sideOffset={8}
        className="w-64 p-2"
      >

        <Command className="bg-transparent">

          <CommandList>

            <CommandGroup>

              {LEVEL_OPTIONS.map(option => (

                <SelectOption
                  key={option.value}
                  label={option.label}
                  icon={option.icon}
                  color={option.color}
                  selected={value === option.value}
                  onSelect={() => {

                    onChange(
                      value === option.value
                        ? null
                        : option.value,
                    )

                    setOpen(false)

                  }}
                />

              ))}

            </CommandGroup>

          </CommandList>

        </Command>

      </PopoverContent>

    </Popover>

  )

}