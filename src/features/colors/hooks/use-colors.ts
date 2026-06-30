"use client"

import {
  useEntityModule,
} from "@/shared/core/entity/use-entity-module"

import {
  colorsService,
} from "../services/colors.service"

export function useColors() {

  const {

    items,

    loading,

    create,

    update,

    remove,

  } = useEntityModule(
    "colors",
    colorsService,
  )

  return {

    colors: items,

    loading,

    create,

    update,

    remove,

  }

}