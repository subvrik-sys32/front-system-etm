"use client"

import type {
  EntityColumn,
} from "@/shared/ui/entity-table"

import type {
  Project,
} from "../types/project.types"

import type {
  User,
} from "@/features/users/types/user.types"

import {
  DragCell,
} from "@/shared/ui/entity-table-common/drag-cell"

import {
  ExpandCell,
} from "@/shared/ui/entity-table-common/expand-cell"

import {
  ProjectPmCell,
} from "../components/cells/project-pm-cell"

import {
  ProjectClientCell,
} from "../components/cells/project-client-cell"

import {
  ProjectStageCell,
} from "../components/cells/project-stage-cell"

import {
  ProjectStatusCell,
} from "../components/cells/project-status-cell"

import {
  ProjectRowActions,
} from "../components/actions/project-row-actions"

import {
  TABLE_WIDTHS,
} from "@/shared/constants/table-widths"

import {
  formatDate,
} from "@/shared/utils/date-format"

export function buildProjectColumns(): EntityColumn<Project>[] {

  return[

    {
      id:"drag",
      align:"center",
      title:"",
      width:TABLE_WIDTHS.drag,
      render:()=>(
        <DragCell/>
      ),
      renderOverlay:()=>null,
    },

    {
      id:"expand",
      align:"center",
      title:"",
      width:TABLE_WIDTHS.expand,
      render:(_,context)=>(
        <ExpandCell
          expanded={context.isExpanded}
          onClick={context.toggleExpanded}
        />
      ),
      renderOverlay:()=>null,
    },

    {
      id:"id",
      align:"center",
      title:"ID",
      width:TABLE_WIDTHS.id,
      render:project=>(
        <span className="font-semibold text-white">
          {String(project.sequence).padStart(3,"0")}
        </span>
      ),
    },

    {
      id:"client",
      align:"center",
      title:"CLIENTE",
      width:TABLE_WIDTHS.medium,
      render:project=>(
        <ProjectClientCell
          project={project}
        />
      ),
    },

    {
      id:"projectCode",
      align:"center",
      title:"PRY",
      width:TABLE_WIDTHS.projectCode,
      render:project=>(
        <span>{project.projectCode}</span>
      ),
    },

    {
      id:"name",
      align:"left",
      title:"PROYECTO",
      width:TABLE_WIDTHS.reference,
      render:project=>(
        <span className="block truncate font-medium">
          {project.name}
        </span>
      ),
    },

    {
      id:"stage",
      align:"center",
      title:"ETAPA",
      width:TABLE_WIDTHS.large,
      render:project=>(
        <ProjectStageCell
          project={project}
        />
      ),
    },

    {
      id:"status",
      align:"center",
      title:"ESTADO",
      width:TABLE_WIDTHS.medium,
      render:project=>(
        <ProjectStatusCell
          project={project}
        />
      ),
    },

    {
      id:"pm",
      align:"center",
      title:"PM",
      width:TABLE_WIDTHS.medium,
      render:project=>(
        <ProjectPmCell
          project={project}
        />
      ),
    },

    {
      id:"deliveryDate",
      align:"center",
      title:"ENTREGA",
      width:TABLE_WIDTHS.delivery,
      render:project=>(
        <span>
          {formatDate(project.deliveryDate)}
        </span>
      ),
    },

    {
      id:"actions",
      align:"center",
      title:"",
      width:TABLE_WIDTHS.actions,
      render:project=>(
        <ProjectRowActions
          project={project}
        />
      ),
      renderOverlay:()=>null,
    },

  ]

}