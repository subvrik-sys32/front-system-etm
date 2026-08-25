"use client"

import { useEffect, useRef, useState, KeyboardEvent, ChangeEvent, FormEvent } from "react"
import { Camera, Check, ImageIcon, Pencil, Reply, Send, X } from "lucide-react"
import { IconAction } from "@/shared/ui/actions/icon-action"
import { PermissionCode } from "@/shared/core/enums/permission-code.enum"
import { usePermissions } from "@/features/permissions/hooks/use-permissions"
import { useCreateComment } from "../hooks/use-create-comment"
import { useUpdateComment } from "../hooks/use-update-comment"
import { useMentionableUsers } from "../hooks/use-mentionable-users"
import { MentionSuggestions } from "./mention-suggestions"
import type { Comment, CommentTarget } from "../types/comment.types"

type Props = {
  target: CommentTarget
  editingComment?: Comment | null
  onCancelEdit?: () => void
  replyingTo?: Comment | null
  onCancelReply?: () => void
}

export function CommentComposer({
  target,
  editingComment,
  onCancelEdit,
  replyingTo,
  onCancelReply,
}: Props) {
  const [mentionQuery, setMentionQuery] = useState<string | null>(null)
  const [hasText, setHasText] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { createComment } = useCreateComment(target)
  const { updateComment, updating } = useUpdateComment(target)
  const { users } = useMentionableUsers()

  const isEditing = !!editingComment
  const isReplying = !isEditing && !!replyingTo
  const showContext = isEditing || isReplying || !!selectedImage

  const { has } = usePermissions()
  const canCreate = isEditing || has(PermissionCode.COMMENT_CREATE)
  const busy = updating

  useEffect(() => {
    const el = textareaRef.current
    if (el) el.value = editingComment?.message ?? ""
    setHasText(Boolean(editingComment?.message?.trim()))
    setMentionQuery(null)
  }, [editingComment])

  useEffect(() => {
    if (replyingTo) {
      requestAnimationFrame(() => textareaRef.current?.focus())
    }
  }, [replyingTo])

  const filteredUsers =
    mentionQuery === null
      ? []
      : users.filter(
          u =>
            u.username?.toLowerCase().includes(mentionQuery.toLowerCase()) ||
            u.name.toLowerCase().includes(mentionQuery.toLowerCase()),
        )

  const mentionOpen = mentionQuery !== null && filteredUsers.length > 0

  const handleInput = (e: FormEvent<HTMLTextAreaElement>) => {
    const el = e.currentTarget
    const value = el.value
    setHasText(value.trim().length > 0)
    const cursor = el.selectionStart ?? value.length
    const match = value.slice(0, cursor).match(/@([a-zA-Z0-9_.]*)$/)
    const next = match ? match[1] : null
    setMentionQuery(prev => (prev === next ? prev : next))
  }

  const handleSelectMention = (username: string) => {
    const el = textareaRef.current
    if (!el) return
    const cursor = el.selectionStart ?? el.value.length
    const upToCursor = el.value.slice(0, cursor)
    const afterCursor = el.value.slice(cursor)
    el.value =
      upToCursor.replace(/@([a-zA-Z0-9_.]*)$/, `@${username} `) + afterCursor
    setHasText(el.value.trim().length > 0)
    setMentionQuery(null)
    requestAnimationFrame(() => el.focus())
  }

  const clearComposer = () => {
    if (textareaRef.current) textareaRef.current.value = ""
    setHasText(false)
    setSelectedImage(null)
    setMentionQuery(null)
  }

  const handleCancel = () => {
    clearComposer()
    onCancelEdit?.()
    onCancelReply?.()
  }

  const handleSelectImage = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setSelectedImage(reader.result as string)
    reader.readAsDataURL(file)
  }

  const handleSubmit = () => {
    const trimmed = (textareaRef.current?.value ?? "").trim()
    if ((!trimmed && !selectedImage) || busy || !canCreate) return

    if (isEditing && editingComment) {
      updateComment({ id: editingComment.id, dto: { message: trimmed } })
        .then(() => onCancelEdit?.())
        .catch(() => {})
    } else {
      createComment({
        message: trimmed || undefined,
        imageBase64: selectedImage ?? undefined,
        parentId: replyingTo?.id,
      }).catch(() => {})
      onCancelReply?.()
    }

    clearComposer()
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (mentionQuery !== null && filteredUsers.length > 0 && e.key === "Escape") {
      e.preventDefault()
      setMentionQuery(null)
      return
    }

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }

    if (e.key === "Escape" && showContext && mentionQuery === null) {
      handleCancel()
    }
  }

  const canSubmit = (hasText || !!selectedImage) && !busy && canCreate

  return (
    <div className="flex flex-col gap-1.5 rounded-2xl bg-foreground/[0.06] px-2 py-1.5">
      {showContext && (
        <div className="flex items-start gap-2 rounded-xl bg-foreground/[0.04] px-2.5 py-2">
          <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground shadow-xs">
            {isEditing ? (
              <Pencil size={12} strokeWidth={2.2} />
            ) : isReplying ? (
              <Reply size={12} strokeWidth={2.2} />
            ) : (
              <ImageIcon size={12} strokeWidth={2.2} />
            )}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-medium text-foreground">
              {isEditing
                ? "Editando mensaje"
                : isReplying
                  ? `Respondiendo a ${replyingTo?.user.name}`
                  : "Foto adjunta"}
            </p>
            {isReplying && replyingTo && (
              <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                {replyingTo.message || "Foto"}
              </p>
            )}
            {isEditing && (
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                Esc para cancelar · Enter para guardar
              </p>
            )}
            {selectedImage && (
              <div className="relative mt-1.5 w-fit">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedImage}
                  alt="Foto adjunta"
                  className="size-12 rounded-lg object-cover"
                />
              </div>
            )}
          </div>
          <button
            type="button"
            aria-label="Cancelar"
            title="Cancelar"
            onClick={
              selectedImage && !isEditing && !isReplying
                ? () => setSelectedImage(null)
                : handleCancel
            }
            className="flex size-6 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-foreground/8 hover:text-foreground"
          >
            <X size={14} strokeWidth={2.2} />
          </button>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        tabIndex={-1}
        accept="image/*"
        className="hidden"
        onChange={handleSelectImage}
      />

      <div className="relative">
        {mentionOpen ? (
          <div className="absolute bottom-full left-0 z-50 mb-2">
            <MentionSuggestions
              users={filteredUsers}
              onSelect={handleSelectMention}
            />
          </div>
        ) : null}
          <div className="flex items-center gap-1">
            {!isEditing && (
              <div className="flex size-9 shrink-0 items-center justify-center">
                <IconAction
                  icon={Camera}
                  disabled={!canCreate}
                  onClick={() => fileInputRef.current?.click()}
                />
              </div>
            )}

            <textarea
              ref={textareaRef}
              defaultValue={editingComment?.message ?? ""}
              onInput={handleInput}
              onKeyDown={handleKeyDown}
              disabled={busy || !canCreate}
              rows={1}
              placeholder={
                !canCreate
                  ? "Sin permiso para comentar"
                  : isEditing
                    ? "Edita tu mensaje…"
                    : "Mensaje…  @mencionar"
              }
              className="max-h-24 min-h-9 flex-1 resize-none bg-transparent py-2 text-[15px] leading-snug text-foreground outline-none placeholder:text-muted-foreground/70"
            />

            <button
              type="button"
              aria-label={isEditing ? "Guardar" : "Enviar"}
              title={isEditing ? "Guardar" : "Enviar"}
              disabled={!canSubmit}
              onClick={handleSubmit}
              className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-foreground text-background shadow-xs transition disabled:opacity-40"
            >
              {isEditing ? (
                <Check className="size-4" strokeWidth={2.4} />
              ) : (
                <Send className="size-4" />
              )}
            </button>
          </div>
      </div>
    </div>
  )
}
