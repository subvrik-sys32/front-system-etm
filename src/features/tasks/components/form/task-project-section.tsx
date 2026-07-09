"use client"

import { Folder } from "lucide-react"

import { FormSection } from "@/shared/ui/dialogs/form-dialog/form-section"

import { ProjectPicker } from "@/features/tasks/components/project-picker"

import type { TaskFormSectionProps } from "./types"

export function TaskProjectSection({
  form,
  update,
  errors,
}: TaskFormSectionProps) {

  return (

    <FormSection
      title="Proyecto"
      icon={Folder}
    >

      <div className="space-y-1.5">

        <p className="text-sm font-medium text-neutral-300">
          Proyecto
        </p>

        <div className="flex justify-center">

          <ProjectPicker
            value={form.projectId}
            onChange={projectId =>
              update({
                projectId,
              })
            }
          />

        </div>

        {errors?.projectId && (

          <p className="text-xs font-medium text-red-400">

            * {errors.projectId}

          </p>

        )}

      </div>

    </FormSection>

  )

}