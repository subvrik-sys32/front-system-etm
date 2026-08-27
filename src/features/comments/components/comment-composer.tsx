"use client"

import { useEffect, useRef, useState, ChangeEvent } from "react"
import { Camera, Check, FileText, ImageIcon, Paperclip, Pencil, Reply, Send, X } from "lucide-react"
import { toast } from "sonner"
import { CHROME_ICON_BTN } from "@/shared/ui/actions/icon-action"
import { cn } from "@/shared/utils/utils"
import { PermissionCode } from "@/shared/core/enums/permission-code.enum"
import { useVisualViewportFrame } from "@/components/ui/popover/use-visual-viewport-frame"
import { usePermissions } from "@/features/permissions/hooks/use-permissions"
import { useCreateComment } from "../hooks/use-create-comment"
import { useUpdateComment } from "../hooks/use-update-comment"
import { useMentionableUsers } from "../hooks/use-mentionable-users"
import { MentionSuggestions } from "./mention-suggestions"
import {
  CommentComposerField,
  type CommentComposerFieldHandle,
} from "./comment-composer-field"
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
  const [selectedFile, setSelectedFile] = useState<{
    base64: string
    name: string
    mime: string
  } | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const fieldRef = useRef<CommentComposerFieldHandle>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const attachInputRef = useRef<HTMLInputElement>(null)

  const { createComment } = useCreateComment(target)
  const { updateComment, updating } = useUpdateComment(target)
  const { users } = useMentionableUsers()

  const isEditing = !!editingComment
  const isReplying = !isEditing && !!replyingTo
  const showContext = isEditing || isReplying || !!selectedImage || !!selectedFile

  const { has } = usePermissions()
  const canCreate = isEditing || has(PermissionCode.COMMENT_CREATE)
  const busy = updating
  // overlayInset: 0 si layout ya se achicó; si no, eleva sobre el teclado.
  // CHROME_GAP: residual barra de accesos iOS/Android (~10px) solo con teclado.
  const { overlayInset, keyboardOpen } = useVisualViewportFrame()
  const KEYBOARD_CHROME_GAP = 10
  const padBottom =
    Math.max(0, overlayInset) + (keyboardOpen ? KEYBOARD_CHROME_GAP : 0)

  useEffect(() => {
    fieldRef.current?.setValue(editingComment?.message ?? "")
    setMentionQuery(null)
  }, [editingComment])

  useEffect(() => {
    if (replyingTo) requestAnimationFrame(() => fieldRef.current?.focus())
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

  const handleSelectMention = (username: string) => {
    const current = fieldRef.current?.getValue() ?? ""
    const replaced = current.replace(/@([a-zA-Z0-9_.]*)$/, `@${username} `)
    fieldRef.current?.setValue(replaced)
    setMentionQuery(null)
    fieldRef.current?.focus()
  }

  const clearComposer = () => {
    fieldRef.current?.clear()
    setSelectedImage(null)
    setSelectedFile(null)
    setMentionQuery(null)
  }

  const handleCancel = () => {
    clearComposer()
    onCancelEdit?.()
    onCancelReply?.()
  }

  const MAX_FILE_BYTES = 20 * 1024 * 1024

  const readAsDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = () => reject(new Error("No se pudo leer el archivo"))
      reader.readAsDataURL(file)
    })

  const acceptImageFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Ese archivo no es una imagen")
      return
    }
    if (file.size > MAX_FILE_BYTES) {
      toast.error("La imagen supera 20 MB")
      return
    }
    setSelectedFile(null)
    setSelectedImage(await readAsDataUrl(file))
  }

  const acceptAttachmentFile = async (file: File) => {
    const name = file.name || "archivo"
    const lower = name.toLowerCase()
    const isPdf = lower.endsWith(".pdf") || file.type === "application/pdf"
    const isDxf = lower.endsWith(".dxf") || file.type.includes("dxf")
    if (!isPdf && !isDxf) {
      toast.error("Solo PDF o DXF")
      return
    }
    if (file.size > MAX_FILE_BYTES) {
      toast.error("El archivo supera 20 MB")
      return
    }
    setSelectedImage(null)
    const base64 = await readAsDataUrl(file)
    setSelectedFile({
      base64,
      name,
      mime: isPdf ? "application/pdf" : "application/dxf",
    })
  }

  const acceptDroppedOrPicked = async (file: File) => {
    if (file.type.startsWith("image/")) {
      await acceptImageFile(file)
      return
    }
    await acceptAttachmentFile(file)
  }

  const handleSelectImage = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return
    void acceptImageFile(file).catch(() => toast.error("No se pudo cargar la imagen"))
  }

  const handleSelectAttachment = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return
    void acceptAttachmentFile(file).catch(() =>
      toast.error("No se pudo cargar el archivo"),
    )
  }

  // Ctrl/Cmd+V imagen desde portapapeles (capturas, WhatsApp, etc.)
  useEffect(() => {
    if (!canCreate || isEditing) return
    const onPaste = (ev: ClipboardEvent) => {
      const items = ev.clipboardData?.items
      if (!items) return
      for (const item of Array.from(items)) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile()
          if (!file) continue
          ev.preventDefault()
          void acceptImageFile(file).catch(() =>
            toast.error("No se pudo pegar la imagen"),
          )
          return
        }
      }
    }
    window.addEventListener("paste", onPaste)
    return () => window.removeEventListener("paste", onPaste)
  }, [canCreate, isEditing])


  const handleSubmit = () => {
    const trimmed = (fieldRef.current?.getValue() ?? "").trim()
    if ((!trimmed && !selectedImage && !selectedFile) || busy || !canCreate) return

    if (isEditing && editingComment) {
      const snapshot = trimmed
      updateComment({ id: editingComment.id, dto: { message: trimmed } })
        .then(() => {
          clearComposer()
          onCancelEdit?.()
        })
        .catch(() => {
          toast.error("No se pudo guardar el mensaje")
          fieldRef.current?.setValue(snapshot)
        })
      return
    }

    const snapshotText = trimmed
    const snapshotImage = selectedImage
    const snapshotFile = selectedFile
    const parentId = replyingTo?.id

    clearComposer()
    onCancelReply?.()

    createComment({
      message: snapshotText || undefined,
      imageBase64: snapshotImage ?? undefined,
      fileBase64: snapshotFile?.base64,
      fileName: snapshotFile?.name,
      fileMime: snapshotFile?.mime,
      parentId,
    }).catch(() => {
      toast.error("No se pudo enviar el mensaje. Revisá permisos o la conexión.")
      if (snapshotText) fieldRef.current?.setValue(snapshotText)
      if (snapshotImage) setSelectedImage(snapshotImage)
      if (snapshotFile) setSelectedFile(snapshotFile)
    })
  }

  const canSubmit =
    (hasText || !!selectedImage || !!selectedFile) && !busy && canCreate

  return (
    <div
      className="flex flex-col gap-1 rounded-2xl bg-foreground/[0.06] px-2.5 py-1.5"
      style={padBottom > 0 ? { paddingBottom: padBottom } : undefined}
    >
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
            {selectedFile && (
              <div className="mt-1.5 flex items-center gap-2 rounded-lg bg-foreground/5 px-2 py-1.5 text-xs text-foreground">
                <FileText size={14} className="shrink-0 text-muted-foreground" />
                <span className="min-w-0 truncate font-medium">{selectedFile.name}</span>
              </div>
            )}
          </div>
          <button
            type="button"
            aria-label="Cancelar"
            title="Cancelar"
            onClick={
              (selectedImage || selectedFile) && !isEditing && !isReplying
                ? () => {
                    setSelectedImage(null)
                    setSelectedFile(null)
                  }
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
      <input
        ref={attachInputRef}
        type="file"
        tabIndex={-1}
        accept=".pdf,.dxf,application/pdf"
        className="hidden"
        onChange={handleSelectAttachment}
      />

      <div
        className={cn("relative", dragOver && "ring-2 ring-foreground/25 rounded-2xl")}
        onDragEnter={e => {
          e.preventDefault()
          e.stopPropagation()
          if (canCreate && !isEditing) setDragOver(true)
        }}
        onDragOver={e => {
          e.preventDefault()
          e.stopPropagation()
        }}
        onDragLeave={e => {
          e.preventDefault()
          if (e.currentTarget === e.target) setDragOver(false)
        }}
        onDrop={e => {
          e.preventDefault()
          e.stopPropagation()
          setDragOver(false)
          if (!canCreate || isEditing) return
          const file = e.dataTransfer.files?.[0]
          if (file) void acceptDroppedOrPicked(file)
        }}
      >
        {mentionOpen ? (
          <div className="absolute bottom-full left-0 z-50 mb-2">
            <MentionSuggestions
              users={filteredUsers}
              onSelect={handleSelectMention}
            />
          </div>
        ) : null}
          <div className="flex items-center gap-1.5">
            <CommentComposerField
              ref={fieldRef}
              defaultValue={editingComment?.message ?? ""}
              disabled={busy || !canCreate}
              placeholder={
                !canCreate
                  ? "Sin permiso para comentar"
                  : isEditing
                    ? "Edita tu mensaje…"
                    : "Añade un mensaje  @mencionar"
              }
              onHasText={setHasText}
              onMention={setMentionQuery}
              onSubmit={handleSubmit}
              onEscape={showContext ? handleCancel : undefined}
            />

            {hasText && (
              <button
                type="button"
                aria-label="Borrar mensaje"
                title="Borrar mensaje"
                onClick={() => fieldRef.current?.clear()}
                className="flex size-8 shrink-0 items-center justify-center rounded-[10px] text-muted-foreground transition-colors hover:bg-foreground/8 hover:text-foreground"
              >
                <X size={16} strokeWidth={2.2} />
              </button>
            )}

            {!isEditing && (
              <>
                <button
                  type="button"
                  aria-label="Adjuntar foto"
                  title="Adjuntar foto (o Ctrl+V)"
                  disabled={!canCreate}
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    CHROME_ICON_BTN,
                    "size-8 rounded-[10px] disabled:cursor-not-allowed disabled:opacity-40",
                  )}
                >
                  <Camera size={16} strokeWidth={2.25} />
                </button>
                <button
                  type="button"
                  aria-label="Adjuntar PDF o DXF"
                  title="Adjuntar PDF o DXF"
                  disabled={!canCreate}
                  onClick={() => attachInputRef.current?.click()}
                  className={cn(
                    CHROME_ICON_BTN,
                    "size-8 rounded-[10px] disabled:cursor-not-allowed disabled:opacity-40",
                  )}
                >
                  <Paperclip size={16} strokeWidth={2.25} />
                </button>
              </>
            )}

            <button
              type="button"
              aria-label={isEditing ? "Guardar" : "Enviar"}
              title={isEditing ? "Guardar" : "Enviar"}
              disabled={!canSubmit}
              onClick={handleSubmit}
              className="flex size-8 shrink-0 items-center justify-center rounded-[10px] bg-foreground text-background shadow-xs transition disabled:opacity-40"
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
