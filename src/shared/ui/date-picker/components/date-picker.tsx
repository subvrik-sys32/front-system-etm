import * as Popover from '@radix-ui/react-popover';
import { useCallback, useRef, useState } from 'react';
import { DateCalendar } from './date-calendar';
import { DateInput } from './date-input';
import { useDateFormat } from '../hooks/use-date-format';
import type { DatePickerProps } from '../types/types';

/**
 * DatePicker público del Design System.
 * Única responsabilidad: orquestar Popover (Radix) + DateInput + DateCalendar.
 *
 * Uso:
 * <DatePicker value={value} onChange={setValue} />
 */
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

  const { inputValue, handleInputChange, handleInputBlur, handleInputKeyDown, syncFromExternalValue } =
    useDateFormat({ value, minDate, maxDate, onCommit: handleCommit });

  const handleSelectDay = useCallback(
    (date: Date) => {
      onChange(date);
      syncFromExternalValue(date);
      setOpen(false);
      inputRef.current?.focus();
    },
    [onChange, syncFromExternalValue],
  );

  const handleInputFocus = useCallback(() => {
    if (!disabled) setOpen(true);
  }, [disabled]);

  const handleInputKeyDownWithEscape = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Escape') {
        setOpen(false);
        return;
      }
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setOpen(true);
        return;
      }
      handleInputKeyDown(event);
    },
    [handleInputKeyDown],
  );

  return (
    <Popover.Root open={open} onOpenChange={disabled ? undefined : setOpen}>
      <Popover.Trigger asChild>
        <div
          className={className}
          onClick={event => event.preventDefault()}
        >
          <DateInput
            ref={inputRef}
            value={inputValue}
            placeholder={placeholder}
            disabled={disabled}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            onKeyDown={handleInputKeyDownWithEscape}
            onFocus={handleInputFocus}
          />
        </div>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          sideOffset={6}
          onOpenAutoFocus={(event) => event.preventDefault()}
          className={[
            'z-50 rounded-xl shadow-xl',
            'bg-[#101012]',
            'animate-in fade-in-0 zoom-in-95',
          ].join(' ')}
        >
          <DateCalendar
            value={value}
            minDate={minDate}
            maxDate={maxDate}
            onSelect={handleSelectDay}
          />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}