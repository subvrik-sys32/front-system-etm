"use client"

import { useMemo, useState } from "react"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import { PrimaryAction } from "@/shared/ui/actions/primary-action"
import { SendHorizontal } from "lucide-react"

import { useActivityTypes } from "../hooks/use-activity-types"
import { useCreateActivityLog } from "../hooks/use-create-activity-log"
import { getActivityIcon } from "../constants/activity-icons"
import { cn } from "@/shared/utils/utils"

import { ProjectPicker } from "@/features/tasks/components/project-picker"
import { useTasks } from "@/features/tasks/hooks/use-tasks"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ActivityPickerDialog({ open, onOpenChange }: Props) {

  const { types } = useActivityTypes()
  const { createLog, creating } = useCreateActivityLog(types)
  const { tasks } = useTasks()

  const [selectedTypeId, setSelectedTypeId] = useState<string | null>(null)
  const [note, setNote] = useState("")
  const [projectId, setProjectId] = useState("")
  const [taskId, setTaskId] = useState("")

  const selectedType = types.find(t => t.id === selectedTypeId)

  // Por ahora solo "Produciendo" pide proyecto/tarea — es el tipo
  // pensado para cruzar la bitácora con el trabajo real y sacar
  // KPIs (tiempo por proyecto/tarea/operario). Los demás tipos
  // (Limpieza, Descanso, etc.) no lo necesitan.
  const requiresWorkRef = selectedType?.code === "PRODUCIENDO"

  const tasksForProject = useMemo(
    () => tasks.filter(t => t.project.id === projectId),
    [tasks, projectId],
  )

  const handleClose = () => {
    setSelectedTypeId(null)
    setNote("")
    setProjectId("")
    setTaskId("")
    onOpenChange(false)
  }

  const handleSubmit = async () => {

    if (!selectedTypeId) {
      return
    }

    if (requiresWorkRef && !projectId) {
      return
    }

    await createLog({
      activityTypeId: selectedTypeId,
      projectId: projectId || undefined,
      taskId: taskId || undefined,
      note: note.trim() || undefined,
    }).catch(() => {
      // El rollback (si falla de verdad) ya lo maneja useCreateActivityLog.
    })

    handleClose()

  }

  return (

    <Dialog open={open} onOpenChange={(next) => { if (!next) handleClose() }}>

      <DialogContent className="max-w-sm">

        <DialogHeader>
          <DialogTitle>¿Qué estás haciendo?</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 px-5 pb-5">

          <div className="grid grid-cols-3 gap-2">

            {types.map((type) => {

              const Icon = getActivityIcon(type.icon)
              const isSelected = selectedTypeId === type.id

              return (

                <button
                  key={type.id}
                  type="button"
                  onClick={() => {
                    setSelectedTypeId(type.id)
                    // Cambiar de tipo limpia proyecto/tarea — evita
                    // mandar un projectId elegido para "Produciendo"
                    // si la persona cambia de opinión y elige "Descanso".
                    setProjectId("")
                    setTaskId("")
                  }}
                  className={cn(
                    "flex flex-col items-center gap-1.5 rounded-xl p-3 text-center transition-colors",
                    isSelected ? "bg-white/12 ring-1 ring-white/20" : "bg-white/4 hover:bg-white/8",
                  )}
                >

                  <div
                    className="flex size-9 items-center justify-center rounded-full"
                    style={{ backgroundColor: `${type.color}22`, color: type.color }}
                  >
                    <Icon size={17} />
                  </div>

                  <span className="text-[11px] font-medium leading-tight text-neutral-300">
                    {type.label}
                  </span>

                </button>

              )

            })}

          </div>

          {requiresWorkRef && (

            <div className="flex flex-col gap-2 rounded-xl bg-white/4 p-3">

              <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                ¿En qué proyecto?
              </span>

              <ProjectPicker
                value={projectId}
                onChange={(next) => {
                  setProjectId(next)
                  setTaskId("")
                }}
              />

              {projectId && (

                <>

                  <span className="mt-1 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    ¿Qué tarea? (opcional)
                  </span>

                  <select
                    value={taskId}
                    onChange={(e) => setTaskId(e.target.value)}
                    className="rounded-lg bg-white/6 px-3 py-2 text-sm text-white outline-none"
                  >

                    <option value="">Sin tarea puntual</option>

                    {tasksForProject.map((task) => (
                      <option key={task.id} value={task.id}>
                        #{String(task.taskNumber).padStart(3, "0")} · {task.reference}
                      </option>
                    ))}

                  </select>

                </>

              )}

            </div>

          )}

          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Detalle opcional..."
            className="min-h-16 resize-none rounded-xl bg-white/4 p-3 text-sm text-white outline-none placeholder:text-neutral-600"
          />

          <PrimaryAction
            label={creating ? "Guardando..." : "Registrar"}
            icon={SendHorizontal}
            onClick={handleSubmit}
            disabled={!selectedTypeId || (requiresWorkRef && !projectId) || creating}
          />

        </div>

      </DialogContent>

    </Dialog>

  )

}