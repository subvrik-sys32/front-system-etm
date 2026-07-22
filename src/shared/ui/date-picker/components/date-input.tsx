import { forwardRef } from 'react';

export interface DateInputProps {
  value: string;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  className?: string;
  onChange: (raw: string) => void;
  onBlur: () => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onClick?: (event: React.MouseEvent<HTMLInputElement>) => void;
}

export const DateInput = forwardRef<HTMLInputElement, DateInputProps>(
  (
    {
      value,
      placeholder = 'dd/mm/aaaa',
      disabled,
      readOnly,
      className,
      onChange,
      onBlur,
      onKeyDown,
      onFocus,
      onClick,
    },
    ref,
  ) => {
    return (
      <input
        ref={ref}
        type="text"
        // 'decimal' o 'text' evita que ciertos navegadores bloqueen la entrada táctil cuando el input ya tiene foco
        inputMode="decimal"
        autoComplete="off"
        spellCheck={false}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        // IMPORTANTE: Asegúrate de que readOnly no esté clavado en `true` cuando se quiere editar
        readOnly={readOnly}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
        onFocus={onFocus}
        onClick={(event) => {
          // Si el input está enfocado pero el teclado no subió en mobile, forzamos la selección/foco
          if (onClick) onClick(event);
        }}
        className={[
          'w-full h-10 px-4 rounded-xl text-base text-center font-medium outline-none transition-colors',
          'bg-white/6 text-neutral-200 placeholder:text-neutral-600',
          'border border-transparent',
          'focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          className ?? '',
        ].join(' ')}
      />
    );
  },
);

DateInput.displayName = 'DateInput';