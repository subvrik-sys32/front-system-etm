"use client"

import {
  EntitySelect,
} from "@/shared/ui/entity-select/entity-select"

import {
  PermissionCode,
} from "@/shared/core/enums/permission-code.enum"

import {
  usePermissions,
} from "@/features/permissions/hooks/use-permissions"

import {
  usePriorities,
} from "@/features/priorities/hooks/use-priorities"

import {
  useTaskField,
} from "../../hooks/use-task-field"

import type {
  Task,
} from "../../types/task.types"

type Props={
  task:Task
  triggerVariant?:"badge"|"row"
  rowLabel?:string
}

export function TaskPriorityCell({
  task,
  triggerVariant,
  rowLabel,
}:Props){

  const{

    priorities,

    create,

    update,

    remove,

  }=usePriorities()

  const updateField=
    useTaskField()

  const{
    has,
  }=usePermissions()

  const canUpdate=
    has(
      PermissionCode.TASK_UPDATE,
    )

  return(

    <EntitySelect

      collection="priorities"

      value={task.priority}

      items={priorities}

      placeholder="Prioridad"

      disabled={!canUpdate}

      triggerVariant={triggerVariant}

      rowLabel={rowLabel}

      onChange={priority=>{

        if(!priority){

          return

        }

        updateField(

          task.id,

          {

            priorityId:
              priority.id,

          },

          {

            priority,

          },

        )

      }}

      onCreate={create}

      onEdit={update}

      onDelete={remove}

    />

  )

}