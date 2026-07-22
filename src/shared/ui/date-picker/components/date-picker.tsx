// components/date-picker.tsx
import * as Popover from '@radix-ui/react-popover';
import { useCallback, useRef, useState, useMemo } from 'react';
import { DateCalendar } from './date-calendar';
import { DateInput } from './date-input';
import { useDateFormat } from '../hooks/use-date-format';
import type { DatePickerProps } from '../types/types';

/**
 * Función auxiliar para interpretar fechas parciales mientras el usuario escribe.
 * Retorna un objeto Date si detecta mes y año válidos.
 */
function parsePartialDate(input: string): Date | null {
  const clean = input.replace(/[^\d/]/g, '');
  const parts = clean.split('/');

  if (parts.length >= 2) {
    const day = parseInt(parts[0], 10) || 1;
    const month = parseInt(parts[1], 10) - 1; // 0-indexed
    let year = parts[2] ? parseInt(parts[2], 10) : new Date().getFullYear();

    // Si está escribiendo el año en 4 dígitos (ej. 2028)
    if (parts[2] && parts[2].length === 4) {
      year = parseInt(parts[2], 10);
    }

    if (month >= 0 && month <= 11 && year > 1000 && year < 3000) {
      return new Date(year, month, Math.min(day, 28));
    }
  }
  return null;
}

export function DatePicker({
  value = null,
  onChange,
  placeholder,
  disabled,
  minDate,
  maxDate,
  className,
}: DatePickerProps): React.JSX.Element {
  const [open, setOpen] = useState(false);
  const [editable, setEditable] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const justFocusedRef = useRef(false);

  const handleCommit = useCallback(
    (date: Date | null) => {
      onChange(date);
    },
    [onChange],
  );

  const {
    inputValue,
    handleInputChange,
    handleInputBlur,
    handleInputKeyDown,
    syncFromExternalValue,
  } = useDateFormat({ value, minDate, maxDate, onCommit: handleCommit });

  // Calculamos en tiempo real qué mes debería mostrar el calendario basándonos en lo que hay tipeado
  const livePreviewDate = useMemo(() => {
    if (!inputValue) return null;
    return parsePartialDate(inputValue);
  }, [inputValue]);

  const handleOpenChange = useCallback((next: boolean) => {
    setOpen(next);
    if (!next) {
      setEditable(false);
    }
  }, []);

  const handleSelectDay = useCallback(
    (date: Date) => {
      onChange(date);
      syncFromExternalValue(date);
      handleOpenChange(false);
      inputRef.current?.focus();
    },
    [onChange, syncFromExternalValue, handleOpenChange],
  );

  const handleInputFocus = useCallback(() => {
    if (disabled) return;
    justFocusedRef.current = true;
    setOpen(true);

    requestAnimationFrame(() => {
      justFocusedRef.current = false;
    });
  }, [disabled]);

  const handleInputClick = useCallback(() => {
    if (disabled) return;

    if (justFocusedRef.current) return;

    if (open) {
      setEditable(true);
    }
  }, [open, disabled]);

  const handleInputKeyDownWithEscape = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Escape') {
        handleOpenChange(false);
        return;
      }
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setOpen(true);
        return;
      }
      handleInputKeyDown(event);
    },
    [handleInputKeyDown, handleOpenChange],
  );

  return (
    <Popover.Root open={open} onOpenChange={disabled ? undefined : handleOpenChange}>
      <Popover.Trigger asChild>
        <div className={className} onClick={(e) => e.preventDefault()}>
          <DateInput
            ref={inputRef}
            value={inputValue}
            placeholder={placeholder}
            disabled={disabled}
            readOnly={!editable}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            onKeyDown={handleInputKeyDownWithEscape}
            onFocus={handleInputFocus}
            onClick={handleInputClick}
          />
        </div>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          sideOffset={6}
          onOpenAutoFocus={(event) => event.preventDefault()}
          className="z-50 rounded-xl shadow-xl bg-[#101012] animate-in fade-in-0 zoom-in-95"
        >
          <DateCalendar
            value={value}
            // Priorizamos la vista dinámica del tipeo si existe
            displayDate={livePreviewDate} 
            minDate={minDate}
            maxDate={maxDate}
            onSelect={handleSelectDay}
          />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}