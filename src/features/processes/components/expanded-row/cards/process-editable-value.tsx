"use client"

import {
  useEffect,
  useRef,
  useState,
} from "react"

import { Spinner } from "@/shared/ui/spinner/spinner"
import {
  useWorkflowFieldErrorsStore,
  type WorkflowFieldKey,
} from "@/features/workflow/store/workflow-field-errors-store"
import { cn } from "@/shared/utils/utils"

type EditableProps = {
  value: string | number | null
  placeholder?: string
  suffix?: string
  numeric?: boolean
  disabled?: boolean
  treatZeroAsEmpty?: boolean
  /** En chips KPI: sin w-full para no estirar el badge. */
  inline?: boolean
  /** Pill Ingresar legible sobre fondo oscuro del badge compacto. */
  onDark?: boolean
  /** stepId + fieldKey → resalta en rojo si falló validación al completar. */
  stepId?: string | null
  fieldKey?: WorkflowFieldKey
  onSave: (
    value: string | null
  ) => void | Promise<void>
}

export function ProcessEditableValue({
  value,
  placeholder = "Ingresar",
  suffix,
  numeric,
  disabled,
  treatZeroAsEmpty = true,
  inline = false,
  onDark = false,
  stepId,
  fieldKey,
  onSave,
}: EditableProps) {
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [draft, setDraft] = useState(
    value === null || value === undefined
      ? ""
      : String(value)
  )

  const inputRef = useRef<HTMLInputElement>(null)

  const invalid = useWorkflowFieldErrorsStore(state =>
    stepId && fieldKey
      ? (state.byStep[stepId]?.fields.includes(fieldKey) ?? false)
      : false,
  )

  useEffect(() => {
    setDraft(
      value === null || value === undefined
        ? ""
        : String(value)
    )
  }, [value])

  useEffect(() => {
    if (!editing) return
    inputRef.current?.focus()
  }, [editing])

  const clearError = () => {
    if (stepId && fieldKey) {
      useWorkflowFieldErrorsStore.getState().clear(stepId, fieldKey)
    }
  }

  const save = async () => {
    if (saving) return

    const normalized = draft.trim()
    const isZero =
      numeric &&
      treatZeroAsEmpty &&
      normalized !== "" &&
      Number(normalized) === 0

    const toSave =
      normalized === "" || isZero
        ? null
        : normalized

    setSaving(true)

    try {
      await onSave(toSave)
      clearError()
      setEditing(false)
    } catch {
      inputRef.current?.focus()
    } finally {
      setSaving(false)
    }
  }

  if (editing && !disabled) {
    return (
      <div
        className={
          inline
            // Ancho fijo: type=number sin size se expande (~20ch) y rompe el KPI strip.
            ? "relative inline-flex h-[1.25em] w-[3.25rem] max-w-[3.25rem] shrink-0 items-center justify-center"
            : "relative flex w-full min-w-0 items-center"
        }
      >
        <input
          ref={inputRef}
          // text + inputMode evita el min-width nativo de type=number
          type="text"
          inputMode={numeric ? "decimal" : "text"}
          size={inline ? 4 : undefined}
          value={draft}
          disabled={saving}
          onChange={event => {
            const next = event.target.value
            if (numeric) {
              if (next !== "" && !/^\d*\.?\d*$/.test(next)) {
                return
              }
            }
            setDraft(next)
          }}
          onBlur={save}
          onKeyDown={event => {
            if (event.key === "Enter") save()
            if (event.key === "Escape") setEditing(false)
          }}
          className={
            inline
              ? "block w-full max-w-full border-0 bg-transparent p-0 text-center font-inherit tabular-nums leading-inherit text-inherit outline-none disabled:opacity-60"
              : "block w-full min-w-0 border-0 bg-transparent p-0 pr-5 text-left font-inherit leading-inherit text-inherit outline-none disabled:opacity-60"
          }
        />

        {saving && (
          <Spinner
            size={13}
            className="absolute right-0 text-muted-foreground"
          />
        )}
      </div>
    )
  }

  const isEmpty =
    value === null ||
    value === undefined ||
    (typeof value === "number" && Number.isNaN(value)) ||
    (typeof value === "string" && value.trim() === "")

  const hasValue = !isEmpty

  return (
    <span
      role={disabled ? undefined : "button"}
      tabIndex={disabled ? undefined : 0}
      onClick={() => {
        if (disabled) return
        clearError()
        setEditing(true)
      }}
      onKeyDown={event => {
        if (disabled) return

        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault()
          clearError()
          setEditing(true)
        }
      }}
      className={
        disabled
          ? inline
            ? "inline-flex max-w-[5rem] shrink-0 cursor-default items-center font-inherit tabular-nums leading-none text-inherit opacity-50"
            : "block w-full min-w-0 cursor-default text-left font-inherit leading-inherit text-inherit opacity-50"
          : inline
            ? "inline-flex max-w-[5rem] shrink-0 cursor-pointer items-center font-inherit tabular-nums leading-none text-inherit"
            : "block w-full min-w-0 cursor-pointer text-left font-inherit leading-inherit text-inherit"
      }
    >
      {hasValue
        ? (
          <span className="truncate">
            {suffix ? `${value} ${suffix}` : value}
          </span>
        )
        : (
          // Sin truncate en el pill: el ring/borde no se recorta.
          // Sombra inset en vez de ring externo → no choca con overflow-hidden del strip.
          <span
            className={cn(
              "inline-flex max-w-full items-center rounded-md px-1.5 py-0.5 font-inherit text-[length:inherit] font-semibold leading-none transition-colors duration-150",
              invalid
                ? onDark
                  ? "bg-red-500/40 text-red-50 shadow-[inset_0_0_0_1.5px_rgba(248,113,113,0.95)]"
                  : "bg-red-500/15 text-red-600 shadow-[inset_0_0_0_1.5px_rgba(239,68,68,0.7)] dark:text-red-400"
                : onDark
                  // Pill base: suave, legible sobre badge oscuro (mismo look que diseño).
                  ? "bg-white/20 text-white"
                  : "bg-foreground/10 text-inherit",
            )}
          >
            {placeholder}
          </span>
        )
      }
    </span>
  )
}
