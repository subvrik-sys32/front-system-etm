"use client"

import { useQueryClient } from "@tanstack/react-query"

import { useEntityModule } from "@/shared/core/entity/use-entity-module"
import { colorsService } from "../services/colors.service"
import { propagateColorUpdate } from "../cache/propagate-color-update"
import type { Color } from "../types/color.types"
import type { EntityForm } from "@/shared/ui/entity-dialog/entity-dialog.types"

export function useColors() {
  const queryClient = useQueryClient()

  const { items, loading, create, update, remove } = useEntityModule<
    Color,
    EntityForm,
    EntityForm
  >("colors", colorsService)

  const updateColor = async (input: {
    id: string
    dto: EntityForm
    optimistic?: Partial<Color>
  }) => {
    const color = await update(input)
    propagateColorUpdate(queryClient, color)
    return color
  }

  return {
    colors: items,
    loading,
    create,
    update: updateColor,
    remove,
  }
}
