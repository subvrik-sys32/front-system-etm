"use client"

import {
  useState,
} from "react"

import {
  Search,
  MessageSquarePlus,
} from "lucide-react"

import {
  FormDialog,
} from "@/shared/ui/dialogs/form-dialog/form-dialog"

import {
  FormField,
} from "@/shared/ui/dialogs/form-dialog/form-field"

import {
  cn,
} from "@/shared/utils/utils"

import {
  ContextPicker,
  type ContextPickerValue,
} from "@/features/tasks/components/context-picker"

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

const EMPTY_CONTEXT: ContextPickerValue = {
  projectId: "",
  taskId: "",
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

  const [
    selectedTypeId,
    setSelectedTypeId,
  ] = useState<string | null>(null)

  const [
    note,
    setNote,
  ] = useState("")

  const [
    context,
    setContext,
  ] = useState<ContextPickerValue>(EMPTY_CONTEXT)

  // Sólo se muestra el mensaje rojo después de un intento de
  // guardar fallido — igual que el form de Task, no molesta con
  // rojo mientras la persona todavía está eligiendo tipo/proyecto.
  const [
    submitAttempted,
    setSubmitAttempted,
  ] = useState(false)

  // Estado para alternar la visibilidad de la nota (detalle opcional) en móviles
  const [
    showNoteInput,
    setShowNoteInput,
  ] = useState(false)

  function handleClose() {

    setSelectedTypeId(null)
    setNote("")
    setContext(EMPTY_CONTEXT)
    setSubmitAttempted(false)
    setShowNoteInput(false)

    onOpenChange(false)

  }

  const canSave =
    !!selectedTypeId && !!context.projectId

  const errors = {

    projectId:

      submitAttempted && !context.projectId

        ? "El proyecto es obligatorio"

        : undefined,

  }

  async function handleSubmit() {

    if (!canSave) {

      setSubmitAttempted(true)

      return

    }

    await createLog({
      activityTypeId: selectedTypeId!,
      projectId: context.projectId,
      taskId:
        context.taskId || undefined,
      note:
        note.trim() || undefined,
    }).catch(() => {
      // El rollback (si falla de verdad)
      // ya lo maneja useCreateActivityLog.
    })

    handleClose()

  }

  return (

    <FormDialog
      open={open}
      title="¿Qué estás haciendo?"
      icon={Search}
      canSave={!!selectedTypeId}
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

        {/* 1. Proyectos */}
        <div className="flex flex-col gap-2 rounded-xl bg-white/4 p-3">

          <FormField label="Proyecto *" error={errors.projectId}>

            <ContextPicker
              mode="projects"
              value={context}
              onChange={next =>
                setContext({

                  projectId: next.projectId,

                  // Si cambia el proyecto, la tarea elegida antes
                  // ya no aplica.
                  taskId:
                    next.projectId === context.projectId
                      ? context.taskId
                      : "",

                })
              }
            />

          </FormField>

          {/* 2. Tareas */}
          <FormField label="Tarea (opcional)">

            <ContextPicker
              mode="tasks"
              // Sin proyecto elegido todavía, taskProjectId queda
              // undefined y el picker simplemente lista tareas de
              // todos los proyectos — elegir una tarea acá también
              // completa el proyecto solo (ver selectTask).
              taskProjectId={context.projectId || undefined}
              value={context}
              onChange={next =>
                setContext({
                  projectId: next.projectId,
                  taskId: next.taskId,
                })
              }
            />

          </FormField>

        </div>

        {/* 3. Detalles (Input de texto colapsable con icono) */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-400">Nota u observación</span>
            
            <button
              type="button"
              onClick={() => setShowNoteInput(prev => !prev)}
              className={cn(
                "relative flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-medium transition-colors",
                showNoteInput || note.trim()
                  ? "bg-white/12 text-white"
                  : "bg-white/4 text-neutral-400 hover:bg-white/8 hover:text-white"
              )}
            >
              <MessageSquarePlus size={15} />
              <span>{showNoteInput ? "Ocultar detalle" : "Añadir detalle"}</span>
              {note.trim() && (
                <span className="absolute -top-1 -right-1 size-2 rounded-full bg-emerald-500" />
              )}
            </button>
          </div>

          <div
            className={cn(
              "overflow-hidden transition-all duration-200",
              showNoteInput || note.trim()
                ? "max-h-32 opacity-100"
                : "max-h-0 opacity-0 pointer-events-none"
            )}
          >
            <textarea
              value={note}
              onChange={event =>
                setNote(event.target.value)
              }
              placeholder="Detalle opcional..."
              className="w-full min-h-16 resize-none rounded-xl bg-white/4 p-3 text-sm text-white outline-none placeholder:text-neutral-600"
            />
          </div>
        </div>

        {/* 4. Iconos / Tipos de Actividad */}
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
                onClick={() =>
                  setSelectedTypeId(type.id)
                }
                className={cn(
                  "flex flex-col items-center gap-1.5 rounded-xl p-3 text-center transition-colors",
                  isSelected
                    ? "bg-white/12"
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

      </div>

    </FormDialog>

  )

}