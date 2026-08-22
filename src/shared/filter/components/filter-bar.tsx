"use client"

import type { FilterModule } from "../types/filter.types"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useResponsive } from "@/shared/responsive/hooks/use-responsive"

import { useFilterBar } from "../hooks/use-filter-bar"
import { FilterAddButton } from "./filter-add-button"
import { FilterFieldView } from "./filter-field-view"
import { FilterValueView } from "./filter-value-view"
import { FilterChipPopover } from "./filter-chip-popover"

type Props = {
  module: FilterModule
  alwaysExpanded?: boolean
  showAddButton?: boolean
  showChips?: boolean
}

export function FilterBar({
  module,
  alwaysExpanded = false,
  showAddButton = true,
  showChips = true,
}: Props) {
  const {
    chips,
    open,
    setOpen,
    selectedField,
    editingChip,
    setEditingChip,
    availableOptions,
    availableChipOptions,
    draft,
    draftValuesForField,
    handleDraftToggle,
    handleBack,
    handleFieldSelect,
    handleValueConfirm,
    handleChipUpdate,
    handleDirectChipRemove,
  } = useFilterBar(module)

  const { isMobile } = useResponsive()

  /** Bottomsheet: CTA full width. */
  const listoButtonSheet = (
    <button
      type="button"
      disabled={draft.length === 0}
      onClick={handleValueConfirm}
      className="flex h-11 w-full items-center justify-center rounded-xl bg-primary text-sm font-semibold text-primary-foreground transition enabled:active:scale-[0.99] disabled:opacity-40"
    >
      Listo{draft.length > 0 ? ` (${draft.length})` : ""}
    </button>
  )

  /** Popover desktop: fila compacta (mismo peso visual que "Dirección" del sort). */
  const listoButtonPopover = (
    <button
      type="button"
      disabled={draft.length === 0}
      onClick={handleValueConfirm}
      className={
        "mt-1 flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs transition " +
        (draft.length === 0
          ? "pointer-events-none opacity-40 text-muted-foreground"
          : "text-muted-foreground hover:bg-foreground/5")
      }
    >
      <span>Listo</span>
      {draft.length > 0 ? (
        <span className="font-semibold tabular-nums text-primary">
          {draft.length}
        </span>
      ) : null}
    </button>
  )

  return (
    <div className="flex items-center gap-2">
      {showAddButton && (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <FilterAddButton
              expanded={alwaysExpanded || chips.length > 0}
              active={open}
              hasActiveFilters={chips.length > 0}
              onClick={() => {}}
            />
          </PopoverTrigger>

          <PopoverContent
            align="start"
            sideOffset={8}
            floatingClassName="w-64"
            className="p-2"
            // Listo GLOBAL: visible en menú de campos Y dentro de cada lista
            sheetFooter={isMobile ? listoButtonSheet : undefined}
          >
            {!selectedField ? (
              <FilterFieldView module={module} onSelect={handleFieldSelect} />
            ) : (
              <>
                <FilterValueView
                  selectedField={selectedField}
                  availableOptions={availableOptions}
                  selectedValues={draftValuesForField}
                  onBack={handleBack}
                  onToggle={handleDraftToggle}
                />
                {!isMobile && listoButtonPopover}
              </>
            )}

            {/* Desktop: Listo también en el menú de campos si hay borrador */}
            {!isMobile && !selectedField && draft.length > 0 && listoButtonPopover}
          </PopoverContent>
        </Popover>
      )}

      {showChips && chips.length > 0 && (
        <div className="flex max-w-full flex-wrap items-center gap-2 overflow-visible">
          {chips.map(chip => (
            <FilterChipPopover
              key={`${chip.field}-${chip.value}`}
              chip={chip}
              open={
                editingChip?.field === chip.field &&
                editingChip?.value === chip.value
              }
              onOpenChange={next => setEditingChip(next ? chip : undefined)}
              options={availableChipOptions}
              onSelect={handleChipUpdate}
              onRemove={() => handleDirectChipRemove(chip)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
