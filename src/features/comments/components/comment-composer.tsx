"use client"

import { useEffect, useRef, useState, KeyboardEvent, ChangeEvent } from "react"
import { SendHorizontal, X } from "lucide-react"
import { PrimaryAction } from "@/shared/ui/actions/primary-action"
import { IconAction } from "@/shared/ui/actions/icon-action"
import { useCreateComment } from "../hooks/use-create-comment"
import { useUpdateComment } from "../hooks/use-update-comment"
import { useMentionableUsers } from "../hooks/use-mentionable-users"
import { MentionSuggestions } from "./mention-suggestions"
import type { Comment, CommentTarget } from "../types/comment.types"

type Props = {
  target: CommentTarget
  editingComment?: Comment | null
  onCancelEdit?: () => void
}

export function CommentComposer({
  target,
  editingComment,
  onCancelEdit,
}: Props) {

  const [message, setMessage] = useState("")
  const [mentionQuery, setMentionQuery] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const { createComment, creating } = useCreateComment(target)
  const { updateComment, updating } = useUpdateComment(target)
  const { users } = useMentionableUsers()

  const isEditing = !!editingComment
  const busy = creating || updating

  useEffect(() => {
    setMessage(editingComment?.message ?? "")
  }, [editingComment])

  const filteredUsers = mentionQuery === null
    ? []
    : users.filter(u =>
        u.username?.toLowerCase().includes(mentionQuery.toLowerCase()) ||
        u.name.toLowerCase().includes(mentionQuery.toLowerCase()),
      )

  const detectMentionQuery = (value: string, cursor: number) => {

    const upToCursor = value.slice(0, cursor)
    const match = upToCursor.match(/@([a-zA-Z0-9_.]*)$/)

    setMentionQuery(match ? match[1] : null)

  }

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {

    setMessage(e.target.value)
    detectMentionQuery(e.target.value, e.target.selectionStart)

  }

  const handleSelectMention = (username: string) => {

    const cursor = textareaRef.current?.selectionStart ?? message.length
    const upToCursor = message.slice(0, cursor)
    const afterCursor = message.slice(cursor)

    const replaced = upToCursor.replace(/@([a-zA-Z0-9_.]*)$/, `@${username} `)

    const newMessage = replaced + afterCursor
    setMessage(newMessage)
    setMentionQuery(null)

    requestAnimationFrame(() => textareaRef.current?.focus())

  }

  const handleCancel = () => {
    setMessage("")
    onCancelEdit?.()
  }

  const handleSubmit = async () => {

    const trimmed = message.trim()
    if (!trimmed || busy) return

    if (isEditing && editingComment) {

      await updateComment({ id: editingComment.id, dto: { message: trimmed } })
      onCancelEdit?.()

    } else {

      await createComment({ message: trimmed })

    }

    setMessage("")
    setMentionQuery(null)

  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {

    if (mentionQuery !== null && filteredUsers.length > 0) {
      if (e.key === "Escape") {
        e.preventDefault()
        setMentionQuery(null)
        return
      }
    }

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }

    if (e.key === "Escape" && isEditing && mentionQuery === null) {
      handleCancel()
    }

  }

  return (

    <div className="flex min-h-0 flex-1 flex-col rounded-xl bg-white/2 p-2.5">

      {isEditing && (

        <div className="mb-1.5 flex items-center justify-between rounded-lg bg-white/5 px-2.5 py-1.5">
          <span className="text-xs font-medium text-cyan-300">Editando comentario</span>
          <IconAction icon={X} onClick={handleCancel} />
        </div>

      )}

      <div className="relative flex min-h-0 flex-1 flex-col">

        {mentionQuery !== null && filteredUsers.length > 0 && (
          <MentionSuggestions users={filteredUsers} onSelect={handleSelectMention} />
        )}

        <textarea
          ref={textareaRef}
          value={message}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={busy}
          placeholder="Escribe una observación... usá @ para mencionar"
          className="text-sm font-medium min-h-9 flex-1 resize-none bg-transparent text-white outline-none placeholder:text-neutral-600"
        />

      </div>

      <div className="mt-1 flex justify-end">

        <PrimaryAction
          label={
            busy
              ? isEditing ? "Guardando..." : "Publicando..."
              : isEditing ? "Guardar" : "Publicar"
          }
          icon={SendHorizontal}
          onClick={handleSubmit}
          disabled={!message.trim() || busy}
        />

      </div>

    </div>

  )

}