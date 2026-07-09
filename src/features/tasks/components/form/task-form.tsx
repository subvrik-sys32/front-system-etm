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
  errors,
}: TaskFormSectionProps) {

  return (

    <div className="space-y-3">

      <TaskProjectSection
        form={form}
        update={update}
        projectLocked={projectLocked}
        errors={errors}
      />

      <TaskInfoSection
        form={form}
        update={update}
        errors={errors}
      />

      <TaskMaterialSection
        form={form}
        update={update}
        errors={errors}
      />

    </div>

  )

}