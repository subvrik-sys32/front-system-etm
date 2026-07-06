"use client"

import {
  Pencil,
  Trash2,
} from "lucide-react"

import { IconAction } from "@/shared/ui/actions/icon-action"
import { useAuthStore } from "@/features/auth/store/auth-store"

import { formatCommentDate } from "../utils/format-comment-date"

import type { Comment } from "../types/comment.types"

type Props={
  comment:Comment

  onEdit?:(comment:Comment)=>void

  onDelete?:(comment:Comment)=>void
}

export function CommentItem({
  comment,
  onEdit,
  onDelete,
}:Props){

  const currentUser=
    useAuthStore(s=>s.user)

  const{user}=comment

  const canManage=
    currentUser?.id===user.id

  return(

    <div className="group animate-comment-in flex gap-2.5 rounded-lg bg-white/3 px-3 py-2.5 transition-colors hover:bg-white/6">

      {user.avatarUrl?(
        <img
          src={user.avatarUrl}
          alt={user.name}
          className="h-8 w-8 shrink-0 rounded-full object-cover"
        />
      ):(
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
          style={{
            backgroundColor:user.color,
          }}
        >
          {user.name.charAt(0).toUpperCase()}
        </div>
      )}

      <div className="min-w-0 flex-1">

        <div className="flex items-start justify-between gap-3">

          <div className="min-w-0">

            <div className="flex items-center gap-2">

              <span className="truncate text-sm font-semibold text-neutral-200">
                {user.name}
              </span>

              <span className="text-xs text-neutral-500">
                {formatCommentDate(comment.createdAt)}
              </span>

            </div>

          </div>

          {canManage&&(

            <div className="flex items-center gap-0.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100">

              <IconAction
                icon={Pencil}
                onClick={()=>
                  onEdit?.(comment)
                }
              />

              <IconAction
                icon={Trash2}
                variant="danger"
                onClick={()=>
                  onDelete?.(comment)
                }
              />

            </div>

          )}

        </div>

        <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-neutral-300">
          {comment.message}
        </p>

      </div>

    </div>

  )

}