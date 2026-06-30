"use client"

import {
  useEntityModule,
} from "@/shared/core/entity/use-entity-module"

import {
  thicknessesService,
} from "../services/thicknesses.service"

export function useThicknesses(){

  const{
    items,
    loading,
    create,
    update,
    remove,
  }=useEntityModule(
    "thicknesses",
    thicknessesService,
  )

  return{
    thicknesses:items,
    loading,
    create,
    update,
    remove,
  }

}