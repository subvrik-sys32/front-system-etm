"use client"

import { FolderKanban } from "lucide-react"

import { Input } from "@/components/ui/input"

import { FormSection } from "@/shared/ui/dialogs/form-dialog/form-section"
import { FormField } from "@/shared/ui/dialogs/form-dialog/form-field"

import type { ProjectFormSectionProps } from "./types"

export function ProjectInfoSection({
  form,
  update,
  errors,
}: ProjectFormSectionProps) {

  return (

    <FormSection title="Información principal" icon={FolderKanban}>

      <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2">

        <FormField label="Código de proyecto *" error={errors?.projectCode}>
          <Input
            value={form.projectCode}
            placeholder="26-001-M"
            onChange={(e) =>
              update({ projectCode: e.target.value.toUpperCase() })
            }
          />
        </FormField>

        <FormField label="Nombre de proyecto *" error={errors?.name}>
          <Input
            value={form.name}
            placeholder="TABLERO AUTOSOPORTADO - TTA"
            onChange={(e) =>
              update({ name: e.target.value.toUpperCase() })
            }
          />
        </FormField>

      </div>

    </FormSection>

  )

}