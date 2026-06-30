"use client"

import { Folder } from "lucide-react"

import { FormSection } from "@/shared/ui/dialogs/form-dialog/form-section"

import { ProjectPicker } from "@/features/tasks/components/project-picker"

import type { TaskFormSectionProps } from "./types"

export function TaskProjectSection({
  form,
  update,
}: TaskFormSectionProps) {

  return (

    <FormSection
      title="Proyecto"
      icon={Folder}
    >

      <div className="space-y-2">

        <p className="text-sm font-semibold text-neutral-400">
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

      </div>

    </FormSection>

  )

}