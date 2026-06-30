"use client"

import {
  useCallback,
  useMemo,
  useState,
} from "react"

import type {
  FilterChip,
  FilterField,
  FilterModule,
  FilterOption,
} from "../types/filter.types"

import {
  getFilterOptions,
} from "../selectors/get-filter-options"

import {
  useFilterStore,
} from "../store/filter-store"

import {
  useUsers,
} from "@/features/users/hooks/use-users"

import {
  useClients,
} from "@/features/clients/hooks/use-clients"

import {
  useStages,
} from "@/features/stages/hooks/use-stages"

import {
  useStatuses,
} from "@/features/statuses/hooks/use-statuses"

import {
  usePriorities,
} from "@/features/priorities/hooks/use-priorities"

export function useFilterBar(module: FilterModule) {

  const [open, setOpen] = useState(false)

  const [selectedField, setSelectedField] =
    useState<FilterField | undefined>()

  const [editingChip, setEditingChip] =
    useState<FilterChip | undefined>()

  const { users } = useUsers()

  const { clients } = useClients()

  const { stages } = useStages()

  const { statuses } = useStatuses()

  const { priorities } = usePriorities()

  const chips = useFilterStore(
    state => state.filters[module]
  )

  const addFilter = useFilterStore(
    state => state.addFilter
  )

  const updateFilter = useFilterStore(
    state => state.updateFilter
  )

  const removeFilter = useFilterStore(
    state => state.removeFilter
  )

  const availableOptions = useMemo(() => {

    if (!selectedField) return []

    return getFilterOptions({
      module,
      field: selectedField,
      clients,
      priorities,
      stages,
      statuses,
      users,
    }).filter(option =>
      !chips.some(
        chip =>
          chip.field === selectedField &&
          chip.value === option.value
      )
    )

  }, [
    module,
    selectedField,
    clients,
    priorities,
    stages,
    statuses,
    users,
    chips,
  ])

  const availableChipOptions = useMemo(() => {

    if (!editingChip) return []

    return getFilterOptions({
      module,
      field: editingChip.field,
      clients,
      priorities,
      stages,
      statuses,
      users,
    }).filter(option =>
      !chips.some(
        chip =>
          chip.field === editingChip.field &&
          chip.value === option.value &&
          chip.value !== editingChip.value
      )
    )

  }, [
    module,
    editingChip,
    clients,
    priorities,
    stages,
    statuses,
    users,
    chips,
  ])

  const handleFieldSelect = useCallback(
    (field: FilterField) => {
      setSelectedField(field)
    },
    []
  )

  const handleBack = useCallback(() => {
    setSelectedField(undefined)
  }, [])

  const handleValueSelect = useCallback(
    (option: FilterOption) => {

      if (!selectedField) return

      addFilter(module, {
        field: selectedField,
        value: option.value,
        label: option.label,
        color: option.color,
        icon: option.icon,
      })

      setSelectedField(undefined)
      setOpen(false)

    },
    [module, selectedField, addFilter]
  )

  const handleChipUpdate = useCallback(
    (option: FilterOption) => {

      if (!editingChip) return

      updateFilter(module, editingChip, {
        field: editingChip.field,
        value: option.value,
        label: option.label,
        color: option.color,
        icon: option.icon,
      })

      setEditingChip(undefined)

    },
    [module, editingChip, updateFilter]
  )

  const handleChipRemove = useCallback(() => {

    if (!editingChip) return

    removeFilter(module, editingChip)

    setEditingChip(undefined)

  }, [module, editingChip, removeFilter])

  const handleDirectChipRemove = useCallback(
    (chip: FilterChip) => {
      removeFilter(module, chip)
    },
    [module, removeFilter]
  )

  return {

    chips,

    open,
    setOpen,

    selectedField,

    editingChip,
    setEditingChip,

    availableOptions,
    availableChipOptions,

    handleBack,
    handleFieldSelect,
    handleValueSelect,
    handleChipUpdate,
    handleChipRemove,
    handleDirectChipRemove,

  }

}