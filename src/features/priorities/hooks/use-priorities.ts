"use client"

import {
  useEntityModule,
} from "@/shared/core/entity/use-entity-module"

import {
  prioritiesService,
} from "../services/priorities.service"

export function usePriorities() {

  const {

    items,

    loading,

    create,

    update,

    remove,

  } = useEntityModule(
    "priorities",
    prioritiesService,
  )

  return {

    priorities: items,

    loading,

    create,

    update,

    remove,

  }

}