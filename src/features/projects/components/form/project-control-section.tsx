"use client"

import { Settings2 } from "lucide-react"

import { FormSection } from "@/shared/ui/dialogs/form-dialog/form-section"
import { FormField } from "@/shared/ui/dialogs/form-dialog/form-field"

import { EntitySelect } from "@/shared/ui/entity-select/entity-select"
import { DatePicker } from "@/shared/ui/date-picker/components/date-picker"

import { useStages } from "@/features/stages/hooks/use-stages"
import { useStatuses } from "@/features/statuses/hooks/use-statuses"

import { parseISODate, toISODateString } from "@/shared/ui/date-picker/utils/date-format"

import type { ProjectFormSectionProps } from "./types"

export function ProjectControlSection({
  form,
  update,
  errors,
}: ProjectFormSectionProps) {

  const { stages, create: createStage, update: updateStage, remove: removeStage } = useStages()
  const { statuses, create: createStatus, update: updateStatus, remove: removeStatus } = useStatuses()

  const selectedStage = stages.find((i) => i.id === form.stageId)
  const selectedStatus = statuses.find((i) => i.id === form.statusId)

  return (

    <FormSection title="Control" icon={Settings2}>

      <div className="grid grid-cols-1 gap-4 tablet:grid-cols-3">

        <FormField label="Etapa *" error={errors?.stageId}>
          <EntitySelect
            collection="stages"
            value={selectedStage}
            items={stages}
            placeholder="Etapa"
            onChange={(v) =>
              update({ stageId: v?.id ?? "" })
            }
            onCreate={createStage}
            onEdit={updateStage}
            onDelete={removeStage}
          />
        </FormField>

        <FormField label="Estado *" error={errors?.statusId}>
          <EntitySelect
            collection="statuses"
            value={selectedStatus}
            items={statuses}
            placeholder="Estado"
            onChange={(v) =>
              update({ statusId: v?.id ?? "" })
            }
            onCreate={createStatus}
            onEdit={updateStatus}
            onDelete={removeStatus}
          />
        </FormField>

        <FormField label="Fecha de entrega *" error={errors?.deliveryDate}>

          <div className="flex justify-center">

            <DatePicker
              value={parseISODate(form.deliveryDate)}
              onChange={(date) =>
                update({ deliveryDate: toISODateString(date) })
              }
              placeholder="fecha"
              className="w-44"
            />

          </div>

        </FormField>

      </div>

    </FormSection>

  )

}