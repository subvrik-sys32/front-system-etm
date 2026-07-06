"use client"

import { useEffect, useState, KeyboardEvent } from "react"
import { SendHorizontal, X } from "lucide-react"
import { PrimaryAction } from "@/shared/ui/actions/primary-action"
import { IconAction } from "@/shared/ui/actions/icon-action"
import { useCreateComment } from "../hooks/use-create-comment"
import { useUpdateComment } from "../hooks/use-update-comment"
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

  const { createComment, creating } = useCreateComment(target)
  const { updateComment, updating } = useUpdateComment(target)

  const isEditing = !!editingComment
  const busy = creating || updating

  useEffect(() => {
    setMessage(editingComment?.message ?? "")
  }, [editingComment])

  const handleCancel = () => {
    setMessage("")
    onCancelEdit?.()
  }

  const handleSubmit = async () => {

    const trimmed = message.trim()
    if (!trimmed || busy) return

    if (isEditing && editingComment) {

      await updateComment({
        id: editingComment.id,
        dto: { message: trimmed },
      })

      onCancelEdit?.()

    } else {

      await createComment({ message: trimmed })

    }

    setMessage("")

  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }

    if (e.key === "Escape" && isEditing) {
      handleCancel()
    }

  }

  return (

    <div className="flex min-h-0 flex-1 flex-col rounded-xl bg-white/2 p-2.5">

      {isEditing && (

        <div className="mb-1.5 flex items-center justify-between rounded-lg bg-white/5 px-2.5 py-1.5">
          <span className="text-xs font-medium text-cyan-300">
            Editando comentario
          </span>
          <IconAction icon={X} onClick={handleCancel} />
        </div>

      )}

      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={busy}
        placeholder="Escribe una observación..."
        className="text-sm font-medium min-h-9 flex-1 resize-none bg-transparent text-white outline-none placeholder:text-neutral-600"
      />

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