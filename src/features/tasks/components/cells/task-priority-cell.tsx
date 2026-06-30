"use client"

import {
  EntitySelect,
} from "@/shared/ui/entity-select/entity-select"

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
}

export function TaskPriorityCell({
  task,
}:Props){

  const{

    priorities,

    create,

    update,

    remove,

  }=usePriorities()

  const updateField=
    useTaskField()

  return(

    <EntitySelect

      collection="priorities"

      value={task.priority}

      items={priorities}

      placeholder="Prioridad"

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