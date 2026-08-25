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

const MAX_FIELD_PX = 96

function mentionAtCursor(value: string, cursor: number) {
  const match = value.slice(0, cursor).match(/@([a-zA-Z0-9_.]*)$/)
  return match ? match[1] : null
}

function fitHeight(el: HTMLTextAreaElement) {
  el.style.height = "auto"
  el.style.height = `${Math.min(el.scrollHeight, MAX_FIELD_PX)}px`
}

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
  const elRef = useRef<HTMLTextAreaElement>(null)
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
      fitHeight(el)
      syncFlags(value, value.length)
    },
    focus: () => elRef.current?.focus(),
    clear: () => {
      const el = elRef.current
      if (!el) return
      el.value = ""
      fitHeight(el)
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
    <textarea
      ref={elRef}
      defaultValue={defaultValue}
      disabled={disabled}
      rows={1}
      placeholder={placeholder}
      autoComplete="off"
      autoCorrect="off"
      autoCapitalize="off"
      spellCheck={false}
      data-form-type="other"
      data-lpignore="true"
      enterKeyHint="send"
      onInput={e => {
        const el = e.currentTarget
        fitHeight(el)
        syncFlags(el.value, el.selectionStart ?? el.value.length)
      }}
      onKeyDown={e => {
        if (e.key === "Enter" && !e.shiftKey) {
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
      className="themed-scrollbar-y max-h-24 min-h-9 min-w-0 flex-1 resize-none overflow-y-auto bg-transparent py-2 text-base leading-snug text-foreground outline-none placeholder:text-muted-foreground/70 sm:text-sm"
    />
  )
})

export const CommentComposerField = memo(CommentComposerFieldInner, (a, b) => (
  a.defaultValue === b.defaultValue &&
  a.disabled === b.disabled &&
  a.placeholder === b.placeholder
))
