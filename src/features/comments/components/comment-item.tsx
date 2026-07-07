"use client"

import {
  Pencil,
  Trash2,
} from "lucide-react"

import { IconAction } from "@/shared/ui/actions/icon-action"
import { useAuthStore } from "@/features/auth/store/auth-store"
import { usePermissions } from "@/features/permissions/hooks/use-permissions"
import { PermissionCode } from "@/shared/core/enums/permission-code.enum"
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

  const currentUser=useAuthStore(s=>s.user)
  const { has }=usePermissions()
  const { user }=comment

  const isOwner=currentUser?.id===user.id
  const canDeleteAny=has(PermissionCode.COMMENT_DELETE_ANY)

  const canEdit=isOwner
  const canDelete=isOwner||canDeleteAny

  return(
    <div className="group animate-comment-in flex gap-2.5 rounded-lg bg-white/3 px-3 py-2.5 transition-colors hover:bg-white/6">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-linear-to-br from-white/10 to-white/5 ring-1 ring-white/8 text-xs font-semibold text-white shadow-inner">
        {user.avatarUrl ? (
            <img
            src={user.avatarUrl}
            alt={user.name}
            className="h-full w-full object-cover"
            />
        ) : (
            user.name.charAt(0).toUpperCase()
        )}
        </div>
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
          {(canEdit||canDelete)&&(
            <div className="flex items-center gap-0.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              {canEdit&&(
                <IconAction
                  icon={Pencil}
                  onClick={()=>
                    onEdit?.(comment)
                  }
                />
              )}
              {canDelete&&(
                <IconAction
                  icon={Trash2}
                  variant="danger"
                  onClick={()=>
                    onDelete?.(comment)
                  }
                />
              )}
            </div>
          )}
        </div>
        <p className="mt-1 whitespace-pre-wrap wrap-break-word text-sm leading-6 text-neutral-300">
          {comment.message}
        </p>
      </div>
    </div>
  )
}