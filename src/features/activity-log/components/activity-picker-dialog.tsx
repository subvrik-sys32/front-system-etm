"use client"

import {
  useMemo,
  useState,
} from "react"

import {
  Search,
} from "lucide-react"

import {
  FormDialog,
} from "@/shared/ui/dialogs/form-dialog/form-dialog"

import {
  cn,
} from "@/shared/utils/utils"

import {
  ProjectPicker,
} from "@/features/tasks/components/project-picker"

import {
  useTasks,
} from "@/features/tasks/hooks/use-tasks"

import {
  useActivityTypes,
} from "../hooks/use-activity-types"

import {
  useCreateActivityLog,
} from "../hooks/use-create-activity-log"

import {
  getActivityIcon,
} from "../constants/activity-icons"

import {
  getCurrentShift,
} from "../constants/shift-definitions"

import type {
  ShiftSlotDefinition,
} from "../constants/shift-definitions"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  // Slot sobre el que se tocó "+ Registrar" — solo para mostrar
  // contexto y el aviso de abajo. Lo que realmente queda guardado
  // como franja lo decide el servidor a partir de la hora real al
  // momento de guardar (ver activity-log.service.ts), no este valor.
  activeSlot?: ShiftSlotDefinition | null
}

export function ActivityPickerDialog({
  open,
  onOpenChange,
  activeSlot,
}: Props) {

  const {
    types,
  } = useActivityTypes()

  const {
    createLog,
    creating,
  } = useCreateActivityLog(types)

  const {
    tasks,
  } = useTasks()

  const [
    selectedTypeId,
    setSelectedTypeId,
  ] = useState<string | null>(null)

  const [
    note,
    setNote,
  ] = useState("")

  const [
    projectId,
    setProjectId,
  ] = useState("")

  const [
    taskId,
    setTaskId,
  ] = useState("")

  const tasksForProject =
    useMemo(
      () =>
        tasks.filter(
          task =>
            task.project.id === projectId,
        ),
      [
        tasks,
        projectId,
      ],
    )

  function handleClose() {

    setSelectedTypeId(null)
    setNote("")
    setProjectId("")
    setTaskId("")

    onOpenChange(false)

  }

  async function handleSubmit() {

    if (!selectedTypeId) {
      return
    }

    await createLog({
      activityTypeId: selectedTypeId,
      projectId:
        projectId || undefined,
      taskId:
        taskId || undefined,
      note:
        note.trim() || undefined,
    }).catch(() => {
      // El rollback (si falla de verdad)
      // ya lo maneja useCreateActivityLog.
    })

    handleClose()

  }

  const canSave = !!selectedTypeId

  return (

    <FormDialog
      open={open}
      title="¿Qué estás haciendo?"
      icon={Search}
      canSave={canSave}
      saving={creating}
      saveLabel="Registrar"
      savingLabel="Guardando..."
      onClose={handleClose}
      onSave={handleSubmit}
    >

      <div className="flex flex-col gap-4">

        {activeSlot && activeSlot.shift !== getCurrentShift(new Date()) && (

          <p className="rounded-lg bg-amber-500/10 px-3 py-2 text-xs text-amber-400">
            Ya pasó la hora de &ldquo;{activeSlot.label}&rdquo; — esto se
            va a guardar en la franja que corresponde a la hora
            actual, no en esa.
          </p>

        )}

        <div className="grid grid-cols-3 gap-2">

          {types.map(type => {

            const Icon =
              getActivityIcon(type.icon)

            const isSelected =
              selectedTypeId === type.id

            return (

              <button
                key={type.id}
                type="button"
                onClick={() => {

                  setSelectedTypeId(type.id)

                  // Cambiar de tipo limpia proyecto/tarea — evita
                  // arrastrar una elección hecha para el tipo
                  // anterior si la persona cambia de opinión.
                  setProjectId("")
                  setTaskId("")

                }}
                className={cn(
                  "flex flex-col items-center gap-1.5 rounded-xl p-3 text-center transition-colors",
                  isSelected
                    ? "bg-white/12 ring-1 ring-white/20"
                    : "bg-white/4 hover:bg-white/8",
                )}
              >

                <div
                  className="flex size-9 items-center justify-center rounded-full"
                  style={{
                    backgroundColor: `${type.color}22`,
                    color: type.color,
                  }}
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

        {selectedTypeId && (

          <div className="flex flex-col gap-2 rounded-xl bg-white/4 p-3">

            <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
              ¿En qué proyecto? (opcional)
            </span>

            <ProjectPicker
              value={projectId}
              onChange={next => {

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
                  onChange={event =>
                    setTaskId(event.target.value)
                  }
                  className="rounded-lg bg-white/6 px-3 py-2 text-sm text-white outline-none"
                >

                  <option value="">
                    Sin tarea puntual
                  </option>

                  {tasksForProject.map(task => (

                    <option
                      key={task.id}
                      value={task.id}
                    >
                      #
                      {String(task.taskNumber).padStart(3, "0")}
                      {" · "}
                      {task.reference}
                    </option>

                  ))}

                </select>

              </>

            )}

          </div>

        )}

        <textarea
          value={note}
          onChange={event =>
            setNote(event.target.value)
          }
          placeholder="Detalle opcional..."
          className="min-h-16 resize-none rounded-xl bg-white/4 p-3 text-sm text-white outline-none placeholder:text-neutral-600"
        />

      </div>

    </FormDialog>

  )

}