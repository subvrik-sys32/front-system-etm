import { api } from "@/lib/api"
import type { Stage } from "../types/stage.types"
import type { EntityForm } from "@/shared/ui/entity-dialog/entity-dialog.types"

export const stagesService = {
  findAll: async (): Promise<Stage[]> => {
    const { data } = await api.get("/stages")
    return data
  },

  create: async (dto: EntityForm): Promise<Stage> => {
    const { data } = await api.post("/stages", dto)
    return data
  },

  update: async (id: string, dto: EntityForm): Promise<Stage> => {
    const { data } = await api.patch(`/stages/${id}`, dto)
    return data
  },

  remove: async (id: string): Promise<void> => {
    await api.delete(`/stages/${id}`)
  },
}