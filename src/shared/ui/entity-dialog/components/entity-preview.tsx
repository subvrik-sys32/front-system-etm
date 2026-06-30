"use client"

import {
  DynamicBadge,
} from "@/shared/ui/badge/dynamic-badge"

import type {
  EntityForm,
} from "../entity-dialog.types"

type Props={

  value:EntityForm

  variant?:
    | "subtle"
    | "solid"

}

export function EntityPreview({

  value,

  variant="subtle",

}:Props){

  return(

    <div className="flex justify-center">

      <DynamicBadge
        label={
          value.name ||
          "Preview"
        }
        icon={
          value.icon
        }
        color={
          value.color
        }
        variant={variant}
      />

    </div>

  )

}