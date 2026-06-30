"use client"

import {
  UserSelect,
} from "@/features/users/components/user-select"

import {
  useUsers,
} from "@/features/users/hooks/use-users"

import {
  useWorkflowStepField,
} from "@/features/workflow/hooks/use-workflow-step-field"

import {
  workflowAccess,
} from "@/features/workflow/access/workflow-access"

import type {
  ProcessTask,
} from "../../types/process.types"

type Props={
  processTask:ProcessTask
}

export function ProcessOperatorCell({
  processTask,
}:Props){

  const{
    users,
  }=useUsers()

  const updateField=
    useWorkflowStepField()

  const operators=
    users.filter(
      user=>
        user.role?.code==="OPERARIO",
    )

  return(

    <UserSelect
      value={
        workflowAccess.operator(processTask)??undefined
      }
      items={operators}
      placeholder="Operario"
      onChange={async user=>{

        const stepId=
          workflowAccess.stepId(processTask)

        if(!stepId){
          return
        }

        await updateField(

          stepId,

          {
            operatorId:user?.id??null,
          },

          {
            operator:user??null,
            operatorId:user?.id??null,
          },

        )

      }}
    />

  )

}