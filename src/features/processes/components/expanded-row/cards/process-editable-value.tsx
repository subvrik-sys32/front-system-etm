"use client"

import {
  useEffect,
  useRef,
  useState,
} from "react"

import { Spinner } from "@/shared/ui/spinner/spinner"

type EditableProps = {
  value: string | number | null
  placeholder?: string
  suffix?: string
  numeric?: boolean
  disabled?: boolean
  treatZeroAsEmpty?: boolean
  /** En chips KPI: sin w-full para no estirar el badge. */
  inline?: boolean
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
            ? "relative inline-flex w-[3.25rem] max-w-[3.25rem] shrink-0 items-center"
            : "relative flex w-full min-w-0 items-center"
        }
      >
        <input
          ref={inputRef}
          type={numeric ? "number" : "text"}
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
              ? "block w-full min-w-0 border-0 bg-transparent p-0 text-center font-inherit tabular-nums leading-inherit text-inherit outline-none disabled:opacity-60"
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
        setEditing(true)
      }}
      onKeyDown={event => {
        if (disabled) return

        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault()
          setEditing(true)
        }
      }}
      className={
        disabled
          ? inline
            ? "inline-flex max-w-[4.5rem] shrink-0 cursor-default truncate font-inherit leading-inherit text-inherit opacity-50"
            : "block w-full min-w-0 truncate cursor-default text-left font-inherit leading-inherit text-inherit opacity-50"
          : inline
            ? "inline-flex max-w-[4.5rem] shrink-0 cursor-pointer truncate font-inherit leading-inherit text-inherit"
            : "block w-full min-w-0 truncate cursor-pointer text-left font-inherit leading-inherit text-inherit"
      }
    >
      {hasValue
        ? (suffix ? `${value} ${suffix}` : value)
        : (
          <span
            className={
              "inline-flex max-w-full items-center truncate rounded-md " +
              "bg-foreground/10 px-1.5 py-0.5 font-inherit text-[length:inherit] " +
              "font-semibold leading-inherit text-inherit "
            }
          >
            {placeholder}
          </span>
        )
      }
    </span>
  )
}