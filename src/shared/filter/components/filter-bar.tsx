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

  /** Popover desktop: botón claro pero compacto (soft primary, no CTA h-11). */
  const listoButtonPopover = (
    <button
      type="button"
      disabled={draft.length === 0}
      onClick={handleValueConfirm}
      className={
        "mt-2 flex h-9 w-full items-center justify-center gap-1.5 rounded-lg text-xs font-semibold shadow-xs transition " +
        (draft.length === 0
          ? "cursor-not-allowed bg-muted text-muted-foreground/50"
          : "bg-primary/10 text-primary hover:bg-primary/15 active:bg-primary/20 dark:bg-primary/20 dark:text-primary-foreground dark:hover:bg-primary/25")
      }
    >
      Listo
      {draft.length > 0 ? (
        <span className="tabular-nums opacity-80">({draft.length})</span>
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
