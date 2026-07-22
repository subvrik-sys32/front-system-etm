"use client"

import * as Popover from '@radix-ui/react-popover';
import { useCallback, useRef, useState, useMemo } from 'react';
import { DateCalendar } from './date-calendar';
import { DateInput } from './date-input';
import { useDateFormat } from '../hooks/use-date-format';
import type { DatePickerProps } from '../types/types';

function parsePartialDate(input: string): Date | null {
  const clean = input.replace(/[^\d/]/g, '');
  const parts = clean.split('/');

  if (parts.length >= 2) {
    const day = parseInt(parts[0], 10) || 1;
    const month = parseInt(parts[1], 10) - 1;
    let year = parts[2] ? parseInt(parts[2], 10) : new Date().getFullYear();

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
  const inputRef = useRef<HTMLInputElement>(null);

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

  const livePreviewDate = useMemo(() => {
    if (!inputValue) return null;
    return parsePartialDate(inputValue);
  }, [inputValue]);

  const handleOpenChange = useCallback((next: boolean) => {
    setOpen(next);
  }, []);

  const handleSelectDay = useCallback(
    (date: Date) => {
      onChange(date);
      syncFromExternalValue(date);
      handleOpenChange(false);
    },
    [onChange, syncFromExternalValue, handleOpenChange],
  );

  const handleKeyDownWithEscape = useCallback(
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

  // Detección precisa de click/tap
  const handleInputPointerDown = useCallback((event: React.PointerEvent<HTMLInputElement>) => {
    // Solo si es MOUSE (Desktop) abrimos el popover al presionar el input
    if (event.pointerType === 'mouse') {
      setOpen(true);
    }
  }, []);

  const handleCalendarIconClick = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setOpen((prev) => !prev);
  }, []);

  return (
    <Popover.Root open={open} onOpenChange={disabled ? undefined : handleOpenChange}>
      <Popover.Trigger asChild>
        <div className={className}>
          <DateInput
            ref={inputRef}
            value={inputValue}
            placeholder={placeholder}
            disabled={disabled}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            onKeyDown={handleKeyDownWithEscape}
            onPointerDown={handleInputPointerDown}
            onCalendarClick={handleCalendarIconClick}
          />
        </div>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          sideOffset={6}
          onOpenAutoFocus={(e) => e.preventDefault()}
          onCloseAutoFocus={(e) => e.preventDefault()}
          className="z-50 rounded-xl shadow-xl bg-[#101012] animate-in fade-in-0 zoom-in-95"
        >
          <DateCalendar
            value={value}
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