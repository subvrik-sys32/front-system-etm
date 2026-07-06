"use client"

import { useState } from "react"
import { Search } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import { useComments } from "../hooks/use-comments"
import { CommentList } from "./comment-list"
import { EmptyComments } from "./empty-comments"
import type { Comment, CommentTarget } from "../types/comment.types"

type Props = {
  target: CommentTarget
  open: boolean
  onOpenChange: (open: boolean) => void
  onEditComment?: (comment: Comment) => void
}

export function CommentHistoryDialog({
  target,
  open,
  onOpenChange,
  onEditComment,
}: Props) {

  const [search, setSearch] = useState("")
  const { comments, loading } = useComments(target)

  const filteredComments = search.trim()
    ? comments.filter(c =>
        c.message.toLowerCase().includes(search.toLowerCase()) ||
        c.user.name.toLowerCase().includes(search.toLowerCase()),
      )
    : comments

  const handleEdit = (comment: Comment) => {
    onEditComment?.(comment)
    onOpenChange(false)
  }

  return (

    <Dialog open={open} onOpenChange={onOpenChange}>

      <DialogContent className="flex h-[70vh] max-w-lg flex-col gap-0 overflow-hidden p-0">

        <DialogHeader className="border-b border-white/5 px-4 py-3.5">
          <DialogTitle className="text-sm font-semibold text-neutral-200">
            Historial de comentarios
          </DialogTitle>
          <DialogDescription className="sr-only">
            Historial completo de comentarios
          </DialogDescription>
        </DialogHeader>

        <div className="border-b border-white/5 px-4 py-2.5">

          <div className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2">
            <Search size={15} className="shrink-0 text-neutral-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar en comentarios..."
              className="w-full bg-transparent text-sm text-neutral-200 outline-none placeholder:text-neutral-600"
            />
          </div>

        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">

          {loading ? (
            <div className="flex h-full items-center justify-center">
              <p className="text-sm text-neutral-500">Cargando...</p>
            </div>
          ) : filteredComments.length === 0 ? (
            <EmptyComments />
          ) : (
            <CommentList comments={filteredComments} onEdit={handleEdit} />
          )}

        </div>

      </DialogContent>

    </Dialog>

  )

}