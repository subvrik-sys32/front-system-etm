"use client"

import { useState } from "react"
import { Pencil, Plus, Power, Trash2 } from "lucide-react"

import { ActionDialog } from "@/shared/ui/dialogs/action-dialog/action-dialog"
import { PrimaryAction } from "@/shared/ui/actions/primary-action"
import { IconAction } from "@/shared/ui/actions/icon-action"

import { useActivityTypes } from "../hooks/use-activity-types"
import { useActivityTypeMutations } from "../hooks/use-activity-type-mutations"
import { getActivityIcon } from "../constants/activity-icons"
import { ActivityTypeFormDialog } from "./activity-type-form-dialog"

import type { ActivityType } from "../types/activity-log.types"

export function ActivityTypesPageContent() {

  // true: trae también los desactivados, para poder reactivarlos.
  const { types } = useActivityTypes(true)
  const { updateType, removeType } = useActivityTypeMutations()

  const [formOpen, setFormOpen] = useState(false)
  const [editingType, setEditingType] = useState<ActivityType | null>(null)
  const [pendingDelete, setPendingDelete] = useState<ActivityType | null>(null)

  const handleCreate = () => {
    setEditingType(null)
    setFormOpen(true)
  }

  const handleEdit = (type: ActivityType) => {
    setEditingType(type)
    setFormOpen(true)
  }

  const handleToggleActive = (type: ActivityType) => {
    updateType({ id: type.id, dto: { active: !type.active } })
  }

  const handleConfirmDelete = async () => {

    if (!pendingDelete) {
      return
    }

    await removeType(pendingDelete.id)
    setPendingDelete(null)

  }

  return (

    <div className="flex flex-col gap-3">

      <div className="flex justify-end">

        <PrimaryAction
          label="Nueva actividad"
          icon={Plus}
          onClick={handleCreate}
        />

      </div>

      <div className="flex flex-col gap-2">

        {types.map((type) => {

          const Icon = getActivityIcon(type.icon)

          return (

            <div
              key={type.id}
              className="flex items-center gap-3 rounded-xl bg-white/3 p-3"
            >

              <div
                className="flex size-9 shrink-0 items-center justify-center rounded-full"
                style={{ backgroundColor: `${type.color}22`, color: type.color }}
              >
                <Icon size={16} />
              </div>

              <div className="min-w-0 flex-1">

                <p className="truncate text-sm font-medium text-neutral-200">
                  {type.label}
                </p>

                <p className="text-xs text-neutral-500">
                  {type.active ? "Activa" : "Desactivada"}
                </p>

              </div>

              <div className="flex items-center gap-1">

                <IconAction
                  icon={Power}
                  onClick={() => handleToggleActive(type)}
                />

                <IconAction
                  icon={Pencil}
                  onClick={() => handleEdit(type)}
                />

                <IconAction
                  icon={Trash2}
                  variant="danger"
                  onClick={() => setPendingDelete(type)}
                />

              </div>

            </div>

          )

        })}

        {types.length === 0 && (

          <div className="flex h-32 items-center justify-center rounded-xl bg-white/2 text-sm text-neutral-500">
            Sin tipos de actividad todavía
          </div>

        )}

      </div>

      <ActivityTypeFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        editingType={editingType}
      />

      <ActionDialog
        open={!!pendingDelete}
        title="Eliminar actividad"
        description={
          pendingDelete
            ? `¿Eliminar "${pendingDelete.label}"? Las entradas de bitácora ya registradas con este tipo se van a seguir viendo, pero nadie va a poder elegirlo en entradas nuevas.`
            : ""
        }
        icon={Trash2}
        confirmLabel="Eliminar"
        variant="danger"
        onClose={() => setPendingDelete(null)}
        onConfirm={handleConfirmDelete}
      />

    </div>

  )

}