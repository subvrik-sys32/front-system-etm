"use client"

import {
  TaskProjectSection,
} from "./task-project-section"

import {
  TaskInfoSection,
} from "./task-info-section"

import {
  TaskMaterialSection,
} from "./task-material-section"

import type {
  TaskFormSectionProps,
} from "./types"

export function TaskForm({
  form,
  update,
  projectLocked,
}: TaskFormSectionProps) {

  return (

    <div className="space-y-3">

      <TaskProjectSection
        form={form}
        update={update}
        projectLocked={projectLocked}
      />

      <TaskInfoSection
        form={form}
        update={update}
      />

      <TaskMaterialSection
        form={form}
        update={update}
      />

    </div>

  )

}