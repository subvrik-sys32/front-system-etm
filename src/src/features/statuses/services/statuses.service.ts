import { api } from "@/lib/api"
import type { Status } from "../types/status.types"
import type { EntityForm } from "@/shared/ui/entity-dialog/entity-dialog.types"

export const statusesService = {
  findAll: async (): Promise<Status[]> => {
    const { data } = await api.get("/statuses")
    return data
  },

  create: async (dto: EntityForm): Promise<Status> => {
    const { data } = await api.post("/statuses", dto)
    return data
  },

  update: async (id: string, dto: EntityForm): Promise<Status> => {
    const { data } = await api.patch(`/statuses/${id}`, dto)
    return data
  },

  remove: async (id: string): Promise<void> => {
    await api.delete(`/statuses/${id}`)
  },
}