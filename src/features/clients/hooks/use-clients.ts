"use client"

import { useEntityModule } from "@/shared/core/entity/use-entity-module"
import { clientsService } from "../services/clients.service"

export function useClients() {
  const {
    items,
    loading,
    create,
    update,
    remove,
  } = useEntityModule("clients", clientsService)

  return {
    clients: items,
    loading,
    create,
    update,
    remove,
  }
}