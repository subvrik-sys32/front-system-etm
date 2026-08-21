"use client"

import { EntityToggle } from "@/shared/ui/entity-toggle/entity-toggle"

export type PermissionsMode = "roles" | "usuarios"

type Props = {
  mode: PermissionsMode
  onChange: (mode: PermissionsMode) => void
}

const OPTIONS: { value: PermissionsMode; label: string }[] = [
  { value: "roles", label: "Roles" },
  { value: "usuarios", label: "Usuarios" },
]

export function PermissionsModeTabs({ mode, onChange }: Props) {
  return (
    <EntityToggle
      value={mode}
      onChange={onChange}
      options={OPTIONS}
      aria-label="Modo de permisos"
    />
  )
}