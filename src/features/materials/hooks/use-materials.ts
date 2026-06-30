"use client"

import {
  useEntityModule,
} from "@/shared/core/entity/use-entity-module"

import {
  materialsService,
} from "../services/materials.service"

export function useMaterials(){

  const{
    items,
    loading,
    create,
    update,
    remove,
  }=useEntityModule(
    "materials",
    materialsService,
  )

  return{
    materials:items,
    loading,
    create,
    update,
    remove,
  }

}