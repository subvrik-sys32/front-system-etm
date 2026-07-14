import { api } from "@/lib/api"

import type {
  WorkflowActionPayload,
  WorkflowUpdatePayload,
} from "../types/workflow.payloads"

import type {
  WorkflowStep,
} from "../types/workflow.types"

import type {
  ProcessCode,
} from "@/features/tasks/types/task.types"

export type WorkflowResponse={

  taskId:string

  updated:WorkflowStep[]

}

export const workflowService={

  async getRequirements(){

    const res=
      await api.get<Record<ProcessCode,string[]>>(
        "/workflow/requirements",
      )

    return res.data

  },

  async update(
    stepId:string,
    dto:WorkflowUpdatePayload,
  ){

    const res=
      await api.patch<WorkflowResponse>(
        `/workflow/${stepId}`,
        dto,
      )

    return res.data

  },

  async start(
    stepId:string,
  ){

    const res=
      await api.patch<WorkflowResponse>(
        `/workflow/${stepId}/start`,
      )

    return res.data

  },

  async pause(
    stepId:string,
  ){

    const res=
      await api.patch<WorkflowResponse>(
        `/workflow/${stepId}/pause`,
      )

    return res.data

  },

  async resume(
    stepId:string,
  ){

    const res=
      await api.patch<WorkflowResponse>(
        `/workflow/${stepId}/resume`,
      )

    return res.data

  },

  async complete(
    stepId:string,
    dto:WorkflowActionPayload,
  ){

    const res=
      await api.patch<WorkflowResponse>(
        `/workflow/${stepId}/complete`,
        {
          piecesOutput:dto.piecesOutput??undefined,
          plRtReal:dto.plRtReal??undefined,
          paintKgReal:dto.paintKgReal??undefined,
        },
      )

    return res.data

  },

  async review(
    stepId:string,
  ){

    const res=
      await api.patch<WorkflowResponse>(
        `/workflow/${stepId}/review`,
      )

    return res.data

  },

  async reopen(
    stepId:string,
  ){

    const res=
      await api.patch<WorkflowResponse>(
        `/workflow/${stepId}/reopen`,
      )

    return res.data

  },

}