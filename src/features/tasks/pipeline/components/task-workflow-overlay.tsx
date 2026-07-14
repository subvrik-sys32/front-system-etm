"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { ChevronLeft, X } from "lucide-react"

import { cn } from "@/shared/utils/utils"

import { workflowAccess } from "@/features/workflow/access/workflow-access"
import { ProcessOperatorCell } from "@/features/processes/components/cells/process-operator-cell"

import { PIPELINE_SCROLL_INTERACTION_EVENT } from "@/shared/ui/horizontal-scroll/use-drag-scroll"

import { WorkflowActionButtons } from "./workflow-action-buttons"
import { WorkflowNumericField, type WorkflowNumericFieldKey } from "./workflow-numeric-field"

import { getWorkflowFormFields } from "../utils/get-workflow-form-fields"
import type { WorkflowFieldType } from "../config/workflow-form-fields"

import type { ProcessTask } from "@/features/processes/types/process.types"
import type { ProcessCode } from "@/features/tasks/types/task.types"

export type WorkflowFormVariant =
  | "start"
  | "complete"

type Props = {
  processTask: ProcessTask
  processCode: ProcessCode
  visible: boolean
  onClose: () => void
}

const FIELD_LABELS: Record<WorkflowFieldType, string> = {
  operator: "Operario",
  piecesOutput: "Piezas",
  plRtReal: "PL/RT real",
  paintKgReal: "Pintura (KG)",
}

const FIELD_LABELS_BY_PROCESS: Partial<
  Record<ProcessCode, Partial<Record<WorkflowFieldType, string>>>
> = {
  DS: { piecesOutput: "Piezas" },
}

function getFieldLabel(
  processCode: ProcessCode,
  field: WorkflowFieldType,
) {

  return (
    FIELD_LABELS_BY_PROCESS[processCode]?.[field] ??
    FIELD_LABELS[field]
  )

}

export function TaskWorkflowOverlay({
  processTask,
  processCode,
  visible,
  onClose,
}: Props) {

  const [variant, setVariant] =
    useState<WorkflowFormVariant | null>(null)

  // displayVariant se congela cuando visible pasa a false —
  // el overlay se desvanece mostrando el último estado,
  // sin flash de pantalla anterior.
  const [displayVariant, setDisplayVariant] =
    useState<WorkflowFormVariant | null>(null)

  const savingFields =
    useRef(new Set<string>())

  const [anyFieldSaving, setAnyFieldSaving] =
    useState(false)

  const [savedFields, setSavedFields] =
    useState(new Set<WorkflowNumericFieldKey>())

  const locked =
    workflowAccess.isCompleted(processTask)

  const status =
    processTask.workflowStep?.status

  const skipsSelector =
    status === "PENDING"

  // variant controla la lógica real.
  // displayVariant solo se actualiza mientras visible es true,
  // así el contenido visual se "congela" al cerrar.
  useEffect(() => {

    if (!visible) {
      return
    }

    setDisplayVariant(variant)

  }, [visible, variant])

  // Al abrir limpio el estado.
  useEffect(() => {

    if (!visible) {
      return
    }

    setVariant(null)
    setDisplayVariant(null)
    setSavedFields(new Set())
    setAnyFieldSaving(false)
    savingFields.current.clear()

    if (skipsSelector) {
      setVariant("start")
    }

  }, [visible]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {

    if (!visible) {
      return
    }

    function handleScrollInteraction() {
      onClose()
    }

    window.addEventListener(
      PIPELINE_SCROLL_INTERACTION_EVENT,
      handleScrollInteraction,
    )

    return () => {

      window.removeEventListener(
        PIPELINE_SCROLL_INTERACTION_EVENT,
        handleScrollInteraction,
      )

    }

  }, [visible, onClose])

  const fields =
    useMemo(

      () =>

        displayVariant
          ? getWorkflowFormFields(
              processCode,
              displayVariant,
            )
          : [],

      [processCode, displayVariant],

    )

  const numericFields =
    useMemo(

      () =>

        fields.filter(
          (f): f is WorkflowNumericFieldKey => f !== "operator",
        ),

      [fields],

    )

  const allFieldsSaved =
    displayVariant === "complete" &&
    numericFields.length > 0 &&
    numericFields.every(f => savedFields.has(f))

  const showFieldsStep =
    displayVariant === "complete" && !allFieldsSaved

  const showCompleteStep =
    displayVariant === "complete" && allFieldsSaved

  function handleFieldSavingChange(
    field: WorkflowNumericFieldKey,
    saving: boolean,
  ) {

    if (saving) {
      savingFields.current.add(field)
    } else {
      savingFields.current.delete(field)
    }

    setAnyFieldSaving(savingFields.current.size > 0)

  }

  function handleFieldSaved(
    field: WorkflowNumericFieldKey,
  ) {

    setSavedFields(prev => {

      const next = new Set(prev)

      next.add(field)

      return next

    })

  }

  function handleClose() {
    onClose()
  }

  function handleBack() {

    setVariant(null)
    setSavedFields(new Set())

  }

  const showBackButton =
    Boolean(displayVariant) &&
    !(displayVariant === "start" && skipsSelector)

  return (

    <div
      data-drag-scroll-ignore
      onMouseDown={event => event.stopPropagation()}
      onClick={event => event.stopPropagation()}
      className={cn(
        "absolute inset-0 flex flex-col overflow-hidden rounded-xl bg-[#0a0a0a] transition-all duration-150",
        visible
          ? "pointer-events-auto opacity-100"
          : "pointer-events-none opacity-0",
      )}
    >

      {showBackButton && (

        <button
          type="button"
          onClick={handleBack}
          className="absolute left-2 top-2 z-10 flex items-center gap-1 text-xs font-semibold text-neutral-400 transition-colors hover:text-neutral-200"
        >
          <ChevronLeft size={14} />
          Volver
        </button>

      )}

      <button
        type="button"
        onClick={handleClose}
        aria-label="Cerrar"
        className="absolute right-2 top-2 z-10 flex size-6 items-center justify-center rounded-md text-neutral-400 transition-colors hover:bg-white/8 hover:text-neutral-200"
      >
        <X size={14} />
      </button>

      <div className="flex min-h-0 flex-1 flex-col justify-center gap-3 p-4">

        {showFieldsStep && (

          numericFields.length === 1 ? (

            <div className="flex justify-center">

              <div className="w-1/2 min-w-40">

                <WorkflowNumericField
                  processTask={processTask}
                  field={numericFields[0]}
                  label={getFieldLabel(processCode, numericFields[0])}
                  disabled={locked}
                  onSavingChange={saving =>
                    handleFieldSavingChange(numericFields[0], saving)
                  }
                  onSaved={() =>
                    handleFieldSaved(numericFields[0])
                  }
                />

              </div>

            </div>

          ) : (

            <div className="grid grid-cols-2 gap-2">

              {numericFields.map(field => (

                <WorkflowNumericField
                  key={field}
                  processTask={processTask}
                  field={field}
                  label={getFieldLabel(processCode, field)}
                  disabled={locked}
                  onSavingChange={saving =>
                    handleFieldSavingChange(field, saving)
                  }
                  onSaved={() =>
                    handleFieldSaved(field)
                  }
                />

              ))}

            </div>

          )

        )}

        {displayVariant === "start" && (

          <div className="flex items-center justify-between gap-3 rounded-lg bg-white/4 px-3 py-2">

            <span className="text-xs font-medium text-neutral-400">
              {getFieldLabel(processCode, "operator")}
            </span>

            <ProcessOperatorCell
              processTask={processTask}
            />

          </div>

        )}

        <div className="flex flex-col gap-2">

          {displayVariant === "start" && (

            <div className="flex gap-2">

              <button
                type="button"
                onClick={handleClose}
                className="h-9 flex-1 rounded-lg bg-white/4 text-xs font-semibold text-neutral-300 transition-colors hover:bg-white/8"
              >
                Cancelar
              </button>

              <div className="flex-1">

                <WorkflowActionButtons
                  processTask={processTask}
                  variant="start"
                  onBack={handleBack}
                  onClose={handleClose}
                />

              </div>

            </div>

          )}

          {showCompleteStep && (

            <WorkflowActionButtons
              processTask={processTask}
              variant="complete"
              onBack={handleBack}
              onClose={handleClose}
              blocked={anyFieldSaving}
            />

          )}

          {!displayVariant && (

            <WorkflowActionButtons
              processTask={processTask}
              onStart={() => setVariant("start")}
              onComplete={() => setVariant("complete")}
              onClose={handleClose}
            />

          )}

        </div>

      </div>

    </div>

  )

}