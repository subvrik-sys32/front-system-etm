"use client"

import { Package } from "lucide-react"

import { Input } from "@/components/ui/input"

import { FormSection } from "@/shared/ui/dialogs/form-dialog/form-section"
import { FormField } from "@/shared/ui/dialogs/form-dialog/form-field"
import { EntitySelect } from "@/shared/ui/entity-select/entity-select"

import { useMaterials } from "@/features/materials/hooks/use-materials"
import { useThicknesses } from "@/features/thicknesses/hooks/use-thicknesses"

import type { TaskFormSectionProps } from "./types"

export function TaskMaterialSection({
  form,
  update,
  errors,
}: TaskFormSectionProps) {

  const{
    materials,
    create:createMaterial,
    update:updateMaterial,
    remove:deleteMaterial,
  }=useMaterials()

  const{
    thicknesses,
    create:createThickness,
    update:updateThickness,
    remove:deleteThickness,
  }=useThicknesses()

  const selectedMaterial=materials.find(
    item=>item.id===form.materialId,
  )

  const selectedThickness=thicknesses.find(
    item=>item.id===form.thicknessId,
  )

  return(

    <FormSection
      title="Material"
      icon={Package}
    >

      <div className="grid grid-cols-1 gap-4 tablet:grid-cols-3">

        <FormField label="Material *" error={errors?.materialId}>

          <EntitySelect
            collection="materials"
            value={selectedMaterial}
            items={materials}
            placeholder="Material"
            onChange={entity=>
              update({
                materialId:
                  entity?.id??"",
              })
            }
            onCreate={createMaterial}
            onEdit={updateMaterial}
            onDelete={deleteMaterial}
          />

        </FormField>

        <FormField label="Espesor *" error={errors?.thicknessId}>

          <EntitySelect
            collection="thicknesses"
            value={selectedThickness}
            items={thicknesses}
            placeholder="Espesor"
            onChange={entity=>
              update({
                thicknessId:
                  entity?.id??"",
              })
            }
            onCreate={createThickness}
            onEdit={updateThickness}
            onDelete={deleteThickness}
          />

        </FormField>

        <FormField label="Piezas *" error={errors?.pieces}>

          <Input
            value={
              form.pieces
                ? String(form.pieces)
                : ""
            }
            inputMode="numeric"
            placeholder="0"
            onChange={event=>
              update({
                pieces:
                  Number(event.target.value)||0,
              })
            }
          />

        </FormField>

      </div>

    </FormSection>

  )

}