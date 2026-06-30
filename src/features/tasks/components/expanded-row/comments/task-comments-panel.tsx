"use client"

import {
  CommentComposer,
} from "./comment-composer"

import {
  CommentPreviewPanel,
} from "./comment-preview-panel"

type Props = {
  taskId: string
}

export function TaskCommentsPanel({
  taskId,
}: Props) {

  return (

    <div className="flex h-full w-full flex-col rounded-xl bg-white/2 p-3">

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 2xl:grid-cols-[1fr_1fr]">

        <div className="flex min-h-0 flex-col gap-3">

          <CommentComposer
            taskId={taskId}
          />

        </div>

        <CommentPreviewPanel />

      </div>

    </div>

  )

}