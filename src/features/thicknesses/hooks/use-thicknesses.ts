"use client"

import { useQueryClient } from "@tanstack/react-query"

import { useEntityModule } from "@/shared/core/entity/use-entity-module"
import { thicknessesService } from "../services/thicknesses.service"
import { propagateThicknessUpdate } from "../cache/propagate-thickness-update"
import type { Thickness } from "../types/thickness.types"
import type { EntityForm } from "@/shared/ui/entity-dialog/entity-dialog.types"

export function useThicknesses() {
  const queryClient = useQueryClient()

  const { items, loading, create, update, remove } = useEntityModule<
    Thickness,
    EntityForm,
    EntityForm
  >("thicknesses", thicknessesService)

  const updateThickness = async (input: {
    id: string
    dto: EntityForm
    optimistic?: Partial<Thickness>
  }) => {
    const thickness = await update(input)
    propagateThicknessUpdate(queryClient, thickness)
    return thickness
  }

  return {
    thicknesses: items,
    loading,
    create,
    update: updateThickness,
    remove,
  }
}
