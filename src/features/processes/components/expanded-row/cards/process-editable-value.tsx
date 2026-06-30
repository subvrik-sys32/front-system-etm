"use client"

import {
  useEffect,
  useRef,
  useState,
} from "react"

type Props = {
  value: string | number | null
  placeholder?: string
  suffix?: string
  numeric?: boolean
  disabled?: boolean
  onSave: (
    value: string | null
  ) => void
}

export function ProcessEditableValue({
  value,
  placeholder = "Ingresar",
  suffix,
  numeric,
  disabled,
  onSave,
}: Props) {

  const [
    editing,
    setEditing,
  ] = useState(false)

  const [
    draft,
    setDraft,
  ] = useState(
    value?.toString() ?? ""
  )

  const inputRef =
    useRef<HTMLInputElement>(null)

  useEffect(() => {

    setDraft(
      value?.toString() ?? ""
    )

  }, [
    value,
  ])

  useEffect(() => {

    if (!editing) {
      return
    }

    inputRef.current?.focus()

  }, [
    editing,
  ])

  const save = () => {

    const normalized =
      draft.trim()

    if (
      normalized === ""
    ) {

      onSave(null)

      setEditing(false)

      return

    }

    onSave(
      normalized
    )

    setEditing(false)

  }

  if (
    editing &&
    !disabled
  ) {

    return (

      <input
        ref={inputRef}
        type={
          numeric
            ? "number"
            : "text"
        }
        value={draft}
        onChange={event => {

          const next =
            event.target.value

          if (
            numeric
          ) {

            if (
              next !== "" &&
              !/^\d*\.?\d*$/.test(
                next
              )
            ) {
              return
            }

          }

          setDraft(
            next
          )

        }}
        onBlur={save}
        onKeyDown={event => {

          if (
            event.key ===
            "Enter"
          ) {

            save()

          }

          if (
            event.key ===
            "Escape"
          ) {

            setEditing(false)

          }

        }}
        className="block w-full border-0 bg-transparent p-0 text-left text-sm font-bold leading-tight outline-none"
      />

    )

  }

  const hasValue =

    value !== null &&

    value !== undefined &&

    !(

      typeof value === "number" &&

      Number.isNaN(
        value
      )

    )

  return (

    <span
      role="button"
      tabIndex={0}
      onClick={() =>

        !disabled &&
        setEditing(
          true
        )

      }
      onKeyDown={event => {

        if (
          event.key ===
            "Enter" ||
          event.key ===
            " "
        ) {

          event.preventDefault()

          setEditing(
            true
          )

        }

      }}
      className="block w-full cursor-pointer text-left text-sm font-bold leading-tight"
    >

      {hasValue

        ? (

            suffix

              ? `${value} ${suffix}`

              : value

          )

        : (

            <span className="text-neutral-500">

              {placeholder}

            </span>

          )

      }

    </span>

  )

}