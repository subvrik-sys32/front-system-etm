import { api } from "@/lib/api"
import type { Client } from "../types/client.types"
import type { EntityForm } from "@/shared/ui/entity-dialog/entity-dialog.types"

export const clientsService = {
  findAll: async (): Promise<Client[]> => {
    const { data } = await api.get("/clients")
    return data
  },

  create: async (dto: EntityForm): Promise<Client> => {

    try {

      const { data } = await api.post(
        "/clients",
        dto,
      )

      return data

    } catch (error: any) {

      console.log("STATUS", error.response?.status)
      console.log("BACKEND", error.response?.data)

      throw error

    }

  },

  update: async (id: string, dto: EntityForm): Promise<Client> => {
    const { data } = await api.patch(`/clients/${id}`, dto)
    return data
  },

  remove: async (id: string): Promise<void> => {
    await api.delete(`/clients/${id}`)
  },
}