"use client"

import { CommentItem } from "./comment-item"
import type { Comment } from "../types/comment.types"

type Props = {
  comments: Comment[]
  onEdit?: (comment: Comment) => void
  onDelete?: (comment: Comment) => void
}

export function CommentList({ comments, onEdit, onDelete }: Props) {

  return (

    <div className="flex flex-col gap-1.5">
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>

  )

}