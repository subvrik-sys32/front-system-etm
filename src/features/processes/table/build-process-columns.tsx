"use client"

import Link from "next/link"

import type { EntityColumn } from "@/shared/ui/entity-table"

import {
  DynamicBadge,
} from "@/shared/ui/badge/dynamic-badge"

import {
  ExpandCell,
} from "@/shared/ui/entity-table-common/expand-cell"

import {
  TABLE_WIDTHS,
} from "@/shared/constants/table-widths"

import {
  formatDate,
} from "@/shared/utils/date-format"

import {
  WorkflowStatusBadge,
} from "@/features/workflow/components/workflow-status-badge"

import {
  workflowAccess,
} from "@/features/workflow/access/workflow-access"

import {
  ProcessRowActions,
} from "../components/actions/process-row-actions"

import {
  processAccess,
} from "../access/process-access"

import type { ProcessTask } from "../types/process.types"

import {
  ProcessOperatorCell,
} from "../components/cells/process-operator-cell"

export function buildProcessColumns(): EntityColumn<ProcessTask>[] {

  return [

    {
      id: "drag",
      align: "center",
      title: "",
      width: TABLE_WIDTHS.drag,
      render: () => null,
      renderOverlay: () => null,
    },

    {
      id: "expand",
      align: "center",
      title: "",
      width: TABLE_WIDTHS.expand,
      render: (_, ctx) => (
        <ExpandCell
          expanded={ctx.isExpanded}
          onClick={ctx.toggleExpanded}
        />
      ),
      renderOverlay: () => null,
    },

    {
      id: "id",
      align: "center",
      title: "ID",
      width: TABLE_WIDTHS.id,
      render: item => (
        <span className="font-semibold text-white">
          {String(processAccess.task(item).taskNumber).padStart(3, "0")}
        </span>
      ),
    },

    {
      id: "client",
      align: "center",
      title: "CLIENTE",
      width: TABLE_WIDTHS.medium,
      render: item => {
        const client = processAccess.project(item).client
        return (
          <DynamicBadge
            label={client.name}
            color={client.color}
            icon={client.icon}
            width="field"
          />
        )
      },
    },

    {
      id: "project",
      align: "center",
      title: "PRY",
      width: TABLE_WIDTHS.projectCode,
      render: item => {
        const project = processAccess.project(item)
        return (
          <Link
            href={`/projects?projectId=${project.id}`}
            className="font-semibold text-white hover:text-cyan-300"
          >
            {project.projectCode}
          </Link>
        )
      },
    },

    {
      id: "reference",
      align: "left",
      title: "REFERENCIA",
      width: TABLE_WIDTHS.reference,
      render: item => {
        const task = processAccess.task(item)
        return (
          <Link
            href={`/tasks?taskId=${task.id}`}
            className="block truncate font-medium text-white hover:text-cyan-300"
          >
            {task.reference}
          </Link>
        )
      },
    },

    {
      id: "priority",
      align: "center",
      title: "PRIORIDAD",
      width: TABLE_WIDTHS.medium,
      render: item => {
        const priority = processAccess.priority(item)
        return (
          <DynamicBadge
            label={priority.name}
            color={priority.color}
            icon={priority.icon}
            width="field"
          />
        )
      },
    },

    {
      id: "status",
      align: "center",
      title: "ESTADO",
      width: TABLE_WIDTHS.medium,
      render: item => (
        <WorkflowStatusBadge
          status={workflowAccess.status(item)}
        />
      ),
    },

    {
      id: "operator",
      align: "center",
      title: "OPERADOR",
      width: TABLE_WIDTHS.medium,
      render: item => (
        <ProcessOperatorCell processTask={item} />
      ),
    },

    {
      id: "deliveryDate",
      align: "center",
      title: "ENTREGA",
      width: TABLE_WIDTHS.delivery,
      render: item => (
        <span>
          {formatDate(processAccess.task(item).deliveryDate)}
        </span>
      ),
    },

    {
      id: "actions",
      align: "center",
      title: "",
      width: TABLE_WIDTHS.actions,
      render: item => {
        const task = processAccess.task(item)
        const stepId = workflowAccess.stepId(item)
        const processCode = workflowAccess.processCode(item)

        if (!stepId || !processCode) return null

        return (
          <ProcessRowActions
            task={task}
            stepId={stepId}
            status={workflowAccess.status(item)}
            processCode={processCode}
          />
        )
      },
    },

  ]
}