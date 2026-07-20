"use client"

import Link from "next/link"

import type { EntityColumn } from "@/shared/ui/entity-table"
import type { Task } from "../types/task.types"

import { DynamicBadge } from "@/shared/ui/badge/dynamic-badge"

import { DragCell } from "@/shared/ui/entity-table-common/drag-cell"
import { ExpandCell } from "@/shared/ui/entity-table-common/expand-cell"

import { TaskRowActions } from "@/features/tasks/components/actions/task-row-actions"

import { TABLE_WIDTHS } from "@/shared/constants/table-widths"

import { formatDate } from "@/shared/utils/date-format"

import { taskAccess } from "@/features/tasks/access/task-access"

import {
  TaskPriorityCell,
} from "../components/cells/task-priority-cell"

export function buildTaskColumns():EntityColumn<Task>[]{

  return[

    {
      id:"drag",
      title:"",
      width:TABLE_WIDTHS.drag,
      skeletonShape:"icon",
      render:()=>(
        <DragCell/>
      ),
    },

    {
      id:"expand",
      title:"",
      width:TABLE_WIDTHS.expand,
      skeletonShape:"icon",
      render:(_,context)=>(
        <ExpandCell
          expanded={context.isExpanded}
          onClick={context.toggleExpanded}
        />
      ),
    },

    {
      id:"id",
      align:"center",
      title:"ID",
      width:TABLE_WIDTHS.id,
      cardOrder:0,
      skeletonShape:"text",
      render:task=>(
        <span className="font-semibold text-white">
          {String(task.taskNumber).padStart(3,"0")}
        </span>
      ),
    },

    {
      id:"client",
      title:"CLIENTE",
      width:TABLE_WIDTHS.medium,
      cardOrder:4,
      cardGroup:"meta",
      skeletonShape:"badge",
      render:task=>(
        <DynamicBadge
          label={task.project.client.name}
          color={task.project.client.color}
          icon={task.project.client.icon}
          width="field"
        />
      ),
    },

    {
      id:"project",
      align:"center",
      title:"PRY",
      width:TABLE_WIDTHS.projectCode,
      cardOrder:2,
      skeletonShape:"text",
      render:task=>(
        <Link
          href={`/projects?projectId=${task.project.id}`}
          className="font-semibold text-white transition-colors hover:text-cyan-300"
        >
          {task.project.projectCode}
        </Link>
      ),
    },

    {
      id:"reference",
      align:"left",
      title:"REFERENCIA",
      width:TABLE_WIDTHS.reference,
      cardOrder:1,
      skeletonShape:"text",
      render:task=>(
        <div className="min-w-0 overflow-hidden">
          <span className="block truncate font-medium">
            {task.reference}
          </span>
        </div>
      ),
    },

    {
      id:"priority",
      title:"PRIORIDAD",
      width:TABLE_WIDTHS.medium,
      cardOrder:5,
      cardGroup:"meta",
      skeletonShape:"badge",
      render:task=>(
        <TaskPriorityCell
          task={task}
        />
      ),
    },

    {
      id:"stage",
      title:"ETAPA",
      width:TABLE_WIDTHS.small,
      cardOrder:6,
      cardGroup:"meta",
      skeletonShape:"badge",
      render:task=>{

        const stage=
          taskAccess.stageLabel(task)

        return(

          <DynamicBadge
            label={stage.label}
            color={stage.color}
            icon={stage.icon}
            width="field"
          />

        )

      },
    },

    {
      id:"status",
      title:"ESTADO",
      width:TABLE_WIDTHS.medium,
      cardOrder:7,
      cardGroup:"meta",
      skeletonShape:"badge",
      render:task=>{

        const status=
          taskAccess.statusLabel(task)

        return(
          <DynamicBadge
            label={status.label}
            color={status.color}
            icon={status.icon}
            width="field"
          />
        )

      },
    },

    {
      id:"deliveryDate",
      align:"center",
      title:"ENTREGA",
      width:TABLE_WIDTHS.delivery,
      cardOrder:3,
      skeletonShape:"text",
      render:task=>(
        <span>
          {formatDate(task.deliveryDate)}
        </span>
      ),
    },

    {
      id:"actions",
      title:"",
      width:TABLE_WIDTHS.actions,
      skeletonShape:"actions-pair",
      render:task=>(
        <TaskRowActions
          task={task}
        />
      ),
    },

  ]

}