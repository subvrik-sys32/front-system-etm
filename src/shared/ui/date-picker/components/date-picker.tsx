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

  // false por default: el primer click/foco solo abre el calendario,
  // sin habilitar tipeo (readOnly=true en el input de abajo — en
  // mobile eso además evita que salte el teclado virtual solo por
  // tocar el campo). Recién un SEGUNDO click, con el calendario ya
  // abierto, marca esto true y habilita escribir a mano.
  const [editable, setEditable] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // true justo después de que "onFocus" abre el calendario, y se
  // resetea en el siguiente frame. Sirve para IGNORAR el click que
  // viene pegado al mismo tap que disparó ese foco (focus y click
  // se disparan casi juntos para un mismo tap) — sin esto, no hay
  // forma confiable de distinguir "el click que abrió esto recién"
  // de "un click aparte, deliberado, con el calendario ya abierto".
  const justFocusedRef = useRef(false);

  const handleCommit = useCallback(
    (date: Date | null) => {
      onChange(date);
    },
    [onChange],
  );

  const { inputValue, handleInputChange, handleInputBlur, handleInputKeyDown, syncFromExternalValue } =
    useDateFormat({ value, minDate, maxDate, onCommit: handleCommit });

  // Se usa tanto para el propio setOpen del Popover.Root como para
  // cerrar el calendario manualmente (día seleccionado, Escape) —
  // en cualquier caso donde se cierra, reseteamos "editable" para
  // que la PRÓXIMA vez vuelva a arrancar en modo "solo calendario".
  const handleOpenChange = useCallback(
    (next: boolean) => {
      setOpen(next);
      if (!next) {
        setEditable(false);
      }
    },
    [],
  );

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

    // Deja pasar el resto de este mismo tap (el "click" que sigue
    // al "focus" en el mismo gesto) antes de volver a contar un
    // click como el segundo, deliberado.
    requestAnimationFrame(() => {
      justFocusedRef.current = false;
    });

  }, [disabled]);

  const handleInputClick = useCallback(() => {

    if (disabled) return;

    if (justFocusedRef.current) {
      // Este click es parte del MISMO tap que acaba de abrir el
      // calendario — no cuenta como el segundo click deliberado.
      return;
    }

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
        <div
          className={className}
          onClick={event => event.preventDefault()}
        >
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