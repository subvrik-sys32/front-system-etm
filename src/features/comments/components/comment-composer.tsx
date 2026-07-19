"use client"

import { useEffect, useRef, useState, KeyboardEvent, ChangeEvent } from "react"
import { Camera, SendHorizontal, X } from "lucide-react"
import { PrimaryAction } from "@/shared/ui/actions/primary-action"
import { IconAction } from "@/shared/ui/actions/icon-action"
import { Popover, PopoverAnchor } from "@/components/ui/popover"
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
  // data URI ("data:image/...;base64,...") de la foto elegida, lista
  // para mandarse tal cual como imageBase64 — null si no hay ninguna.
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { createComment } = useCreateComment(target)
  const { updateComment, updating } = useUpdateComment(target)
  const { users } = useMentionableUsers()

  const isEditing = !!editingComment

  // "busy" ahora SOLO refleja edición (una acción puntual, tiene sentido
  // esperar su confirmación antes de permitir tocar de nuevo el mismo
  // comentario). Crear NO bloquea nada: el comentario ya aparece
  // optimista en la lista (con su propio loader en CommentItem), así que
  // el usuario debe poder seguir escribiendo y mandar otro de inmediato,
  // sin esperar los ~1.3s que tarda el servidor en confirmar.
  const busy = updating

  useEffect(() => {
    setMessage(editingComment?.message ?? "")
  }, [editingComment])

  const filteredUsers = mentionQuery === null
    ? []
    : users.filter(u =>
        u.username?.toLowerCase().includes(mentionQuery.toLowerCase()) ||
        u.name.toLowerCase().includes(mentionQuery.toLowerCase()),
      )

  const mentionOpen = mentionQuery !== null && filteredUsers.length > 0

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

  const handleRemoveImage = () => {
    setSelectedImage(null)
  }

  const handleCancel = () => {
    setMessage("")
    setSelectedImage(null)
    onCancelEdit?.()
  }

  const handleSelectImage = (e: ChangeEvent<HTMLInputElement>) => {

    const file = e.target.files?.[0]

    // Limpiar el input ya, para poder elegir la misma foto de nuevo
    // más adelante si hace falta (si no, el navegador no dispara
    // "onChange" de nuevo con el mismo archivo).
    e.target.value = ""

    if (!file) return

    const reader = new FileReader()

    reader.onload = () => {
      setSelectedImage(reader.result as string)
    }

    reader.readAsDataURL(file)

  }

  const handleSubmit = () => {

    const trimmed = message.trim()

    // Ahora alcanza con tener texto O foto — antes exigía texto sí o
    // sí, lo que no tenía sentido para un comentario que es solo una
    // foto compartida.
    if ((!trimmed && !selectedImage) || busy) return

    if (isEditing && editingComment) {

      // Editar sí espera confirmación: es una acción puntual sobre UN
      // comentario ya existente, no algo que se manda en ráfaga como
      // crear. Cerramos el modo edición recién cuando el servidor
      // confirma, para no dar por hecho un cambio que podría fallar.
      updateComment({ id: editingComment.id, dto: { message: trimmed } })
        .then(() => onCancelEdit?.())
        .catch(() => {
          // El rollback visual ya lo maneja useUpdateComment (si tiene
          // el mismo patrón optimista); acá no hace falta nada más.
        })

    } else {

      // NO se espera esto. onMutate ya insertó el comentario optimista
      // de forma síncrona antes de que esta función siga corriendo, así
      // que el textarea puede limpiarse YA, sin esperar al servidor.
      createComment({
        message: trimmed || undefined,
        imageBase64: selectedImage ?? undefined,
      }).catch(() => {
        // El rollback (si falla de verdad) ya lo maneja useCreateComment.
      })

    }

    setMessage("")
    setSelectedImage(null)
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

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleSelectImage}
      />

      <Popover
        open={mentionOpen}
        onOpenChange={(next) => {
          if (!next) setMentionQuery(null)
        }}
      >

        <PopoverAnchor asChild>

          {/* Foto (si hay) y texto van uno al lado del otro — antes
              la foto se apilaba ARRIBA del textarea en su propio
              bloque separado, empujando todo hacia abajo y
              generando un layout roto que además parece haber
              interferido con el click de "Publicar". */}
          <div className="flex min-h-0 flex-1 gap-2">

            {selectedImage && (

              <div className="relative shrink-0">

                <img
                  src={selectedImage}
                  alt="Foto adjunta"
                  className="h-16 w-16 rounded-lg object-cover"
                />

                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
                >
                  <X size={12} />
                </button>

              </div>

            )}

            <textarea
              ref={textareaRef}
              value={message}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              disabled={busy}
              placeholder="Escribe una observación... y usa @ para mencionar"
              className="text-sm font-medium min-h-9 min-w-0 flex-1 resize-none bg-transparent text-white outline-none placeholder:text-neutral-600"
            />

          </div>

        </PopoverAnchor>

        {mentionOpen && (
          <MentionSuggestions users={filteredUsers} onSelect={handleSelectMention} />
        )}

      </Popover>

      <div className="mt-1 flex items-center justify-between">

        {/* Solo al crear — editar sigue siendo texto solamente. */}
        {!isEditing && (

          <IconAction
            icon={Camera}
            onClick={() => fileInputRef.current?.click()}
          />

        )}

        <PrimaryAction
          label={
            isEditing
              ? (busy ? "Guardando..." : "Guardar")
              : "Publicar"
          }
          icon={SendHorizontal}
          onClick={handleSubmit}
          disabled={(!message.trim() && !selectedImage) || busy}
        />

      </div>

    </div>

  )

}