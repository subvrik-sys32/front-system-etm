"use client"

import { useRef, useImperativeHandle, forwardRef, memo } from "react"

export type CommentComposerFieldHandle = {
  getValue: () => string
  setValue: (value: string) => void
  focus: () => void
  clear: () => void
}

type Props = {
  defaultValue?: string
  disabled?: boolean
  placeholder: string
  onHasText: (has: boolean) => void
  onMention: (query: string | null) => void
  onSubmit: () => void
  onEscape?: () => void
}

function mentionAtCursor(value: string, cursor: number) {
  const match = value.slice(0, cursor).match(/@([a-zA-Z0-9_.]*)$/)
  return match ? match[1] : null
}

/**
 * Isla del input (mismo criterio que SearchField).
 * Cada tecla se queda en el DOM. El padre solo se entera si cambia
 * "hay texto", el token @, Enter o Escape.
 */
const CommentComposerFieldInner = forwardRef<
  CommentComposerFieldHandle,
  Props
>(function CommentComposerField(
  {
    defaultValue = "",
    disabled,
    placeholder,
    onHasText,
    onMention,
    onSubmit,
    onEscape,
  },
  ref,
) {
  const elRef = useRef<HTMLInputElement>(null)
  const hasTextRef = useRef(Boolean(defaultValue.trim()))
  const mentionRef = useRef<string | null>(null)
  const onHasTextRef = useRef(onHasText)
  const onMentionRef = useRef(onMention)
  const onSubmitRef = useRef(onSubmit)
  const onEscapeRef = useRef(onEscape)
  onHasTextRef.current = onHasText
  onMentionRef.current = onMention
  onSubmitRef.current = onSubmit
  onEscapeRef.current = onEscape

  useImperativeHandle(ref, () => ({
    getValue: () => elRef.current?.value ?? "",
    setValue: (value: string) => {
      const el = elRef.current
      if (!el) return
      el.value = value
      syncFlags(value, value.length)
    },
    focus: () => elRef.current?.focus(),
    clear: () => {
      const el = elRef.current
      if (!el) return
      el.value = ""
      syncFlags("", 0)
    },
  }))

  function syncFlags(value: string, cursor: number) {
    const has = value.trim().length > 0
    if (has !== hasTextRef.current) {
      hasTextRef.current = has
      onHasTextRef.current(has)
    }
    const mention = mentionAtCursor(value, cursor)
    if (mention !== mentionRef.current) {
      mentionRef.current = mention
      onMentionRef.current(mention)
    }
  }

  return (
    <input
      ref={elRef}
      type="text"
      inputMode="text"
      enterKeyHint="send"
      defaultValue={defaultValue}
      disabled={disabled}
      placeholder={placeholder}
      autoCorrect="off"
      autoCapitalize="off"
      autoComplete="off"
      spellCheck={false}
      onInput={e => {
        const el = e.currentTarget
        syncFlags(el.value, el.selectionStart ?? el.value.length)
      }}
      onKeyDown={e => {
        if (e.key === "Enter") {
          e.preventDefault()
          onSubmitRef.current()
          return
        }
        if (e.key === "Escape") {
          if (mentionRef.current !== null) {
            e.preventDefault()
            mentionRef.current = null
            onMentionRef.current(null)
            return
          }
          onEscapeRef.current?.()
        }
      }}
      className="min-h-9 min-w-0 flex-1 bg-transparent py-2 text-base leading-none text-foreground outline-none placeholder:text-muted-foreground/70 sm:text-sm"
    />
  )
})

export const CommentComposerField = memo(CommentComposerFieldInner, (a, b) => (
  a.defaultValue === b.defaultValue &&
  a.disabled === b.disabled &&
  a.placeholder === b.placeholder
))
