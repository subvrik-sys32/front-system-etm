import { forwardRef } from 'react';

/**
 * Input de texto puro y controlado. Sin iconos, sin botones.
 * Única responsabilidad: presentación + eventos del campo de texto.
 */
export interface DateInputProps {
  value: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  onChange: (raw: string) => void;
  onBlur: () => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  onFocus?: () => void;
}

export const DateInput = forwardRef<HTMLInputElement, DateInputProps>(
  ({ value, placeholder = 'dd/mm/aaaa', disabled, className, onChange, onBlur, onKeyDown, onFocus }, ref) => {
    return (
      <input
        ref={ref}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        spellCheck={false}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
        onFocus={onFocus}
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