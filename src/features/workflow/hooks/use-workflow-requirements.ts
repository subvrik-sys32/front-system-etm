"use client"

import { useQuery } from "@tanstack/react-query"

import { workflowService } from "../services/workflow.services"

export function useWorkflowRequirements(){

  return useQuery({
    queryKey:["workflow-requirements"],
    queryFn:workflowService.getRequirements,
    staleTime:Infinity,
    gcTime:Infinity,
  })

}