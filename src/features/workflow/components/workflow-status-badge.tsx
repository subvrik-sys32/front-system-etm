"use client"

import {
  DynamicBadge,
} from "@/shared/ui/badge/dynamic-badge"

import {
  WORKFLOW_STATUS_DEFINITIONS,
} from "../constants/workflow-status-definitions"

import type {
  WorkflowStatus,
} from "../types/workflow.types"

type Props={
  status?:WorkflowStatus|null
}

const placeholderColor="#64748B"

export function WorkflowStatusBadge({
  status,
}:Props){

  if(!status){

    return(

      <DynamicBadge
        label="Sin estado"
        color={placeholderColor}
        width="field"
      />

    )

  }

  const definition=
    WORKFLOW_STATUS_DEFINITIONS[
      status
    ]

  return(

    <DynamicBadge
      label={definition.label}
      color={definition.color}
      icon={definition.icon}
      width="field"
    />

  )

}