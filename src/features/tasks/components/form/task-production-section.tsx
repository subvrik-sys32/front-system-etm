"use client"

import {
  Route,
} from "lucide-react"

import {
  FormSection,
} from "@/shared/ui/dialogs/form-dialog/form-section"

import {
  ProcessRoutePicker,
} from "@/features/tasks/components/process-route-picker"

import type {
  TaskFormSectionProps,
} from "./types"

export function TaskProductionSection({
  form,
  update,
}: TaskFormSectionProps) {

  return (

    <FormSection
      title="Ruta de producción"
      icon={Route}
    >

      <ProcessRoutePicker
        value={form.route}
        onChange={(route) =>
          update({
            route,
          })
        }
      />

    </FormSection>

  )

}