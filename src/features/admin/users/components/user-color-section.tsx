"use client"

import {
  Users,
} from "lucide-react"

import {
  EntityColorPicker,
} from "@/shared/ui/entity-dialog/components/entity-color-picker"

import {
  EntityCustomColor,
} from "@/shared/ui/entity-dialog/components/entity-custom-color"

import {
  FormField,
} from "@/shared/ui/dialogs/form-dialog/form-field"

import {
  FormSection,
} from "@/shared/ui/dialogs/form-dialog/form-section"

import type {
  EntityIcon,
} from "@/shared/constants/entity-icons"

type Props={

  name:string

  icon:EntityIcon

  color:string

  onColorChange:(
    color:string
  )=>void

}

export function UserColorSection({

  name,

  icon,

  color,

  onColorChange,

}:Props){

  return(

    <FormSection
      title="Personalización"
      icon={Users}
    >

      <FormField label="Color">

        <div className="grid grid-cols-[1fr_1.2fr] gap-6">

          <EntityColorPicker

            value={{

              name,

              icon,

              color,

            }}

            onChange={value=>

              onColorChange(
                value.color
              )

            }

          />

          <EntityCustomColor

            value={{

              name,

              icon,

              color,

            }}

            onChange={value=>

              onColorChange(
                value.color
              )

            }

          />

        </div>

      </FormField>

    </FormSection>

  )

}