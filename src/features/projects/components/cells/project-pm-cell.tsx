"use client"

import {
  UserSelect,
} from "@/features/users/components/user-select"

import {
  useUsers,
} from "@/features/users/hooks/use-users"

import {
  useProjectField,
} from "../../hooks/use-project-field"

import type {
  Project,
} from "../../types/project.types"

type Props={
  project:Project
}

export function ProjectPmCell({
  project,
}:Props){

  const{
    users,
  }=useUsers()

  const updateField=
    useProjectField()

  const pms=
    users.filter(
      user=>user.role?.code==="PROJECT_MANAGER",
    )

  return(

    <UserSelect

      value={project.pm}

      items={pms}

      placeholder="PM"

      onChange={user=>{

        if(!user){

          return

        }

        updateField(

          project.id,

          {

            pmId:user.id,

          },

          {

            pm:user,

          },

        )

      }}

    />

  )

}