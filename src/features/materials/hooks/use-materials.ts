"use client"

import { useQueryClient } from "@tanstack/react-query"

import { useEntityModule } from "@/shared/core/entity/use-entity-module"
import { materialsService } from "../services/materials.service"
import { propagateMaterialUpdate } from "../cache/propagate-material-update"
import type { Material } from "../types/material.types"
import type { EntityForm } from "@/shared/ui/entity-dialog/entity-dialog.types"

export function useMaterials() {
  const queryClient = useQueryClient()

  const { items, loading, create, update, remove } = useEntityModule<
    Material,
    EntityForm,
    EntityForm
  >("materials", materialsService)

  const updateMaterial = async (input: {
    id: string
    dto: EntityForm
    optimistic?: Partial<Material>
  }) => {
    const material = await update(input)
    propagateMaterialUpdate(queryClient, material)
    return material
  }

  return {
    materials: items,
    loading,
    create,
    update: updateMaterial,
    remove,
  }
}
