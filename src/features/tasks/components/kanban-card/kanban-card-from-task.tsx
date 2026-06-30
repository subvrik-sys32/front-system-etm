"use client"

import { KanbanCardView } from "./kanban-card-view"

import { taskAccess } from "../../access/task-access"

import type { Task } from "../../types/task.types"

type Props={
  task:Task
  dragPreview?:boolean
}

export function KanbanCardFromTask({
  task,
  dragPreview=false,
}:Props){

  const stage=taskAccess.stageLabel(task)

  const status=taskAccess.statusLabel(task)

  return(
    <KanbanCardView
      dragPreview={dragPreview}
      priorityName={task.priority.name}
      priorityColor={task.priority.color}
      deliveryDate={task.deliveryDate}
      reference={task.reference}
      lotNumber={task.lotNumber}
      materialName={task.material.name}
      thicknessName={task.thickness.name}
      pieces={task.pieces}
      colorName={task.color?.name}
      colorHex={
        task.color?.color
      }
      stageName={stage.label}
      stageColor={stage.color}
      stageIcon={stage.icon}
      statusName={status.label}
      statusColor={status.color}
      statusIcon={status.icon}
      taskNumber={task.taskNumber}
    />
  )

}