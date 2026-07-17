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
          'w-full h-9 px-3 rounded-md text-sm outline-none transition-colors',
          'bg-white text-neutral-900 placeholder:text-neutral-400',
          'border border-neutral-200 hover:border-neutral-300',
          'focus:border-neutral-400 focus:ring-2 focus:ring-neutral-900/5',
          'dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder:text-neutral-600',
          'dark:border-neutral-800 dark:hover:border-neutral-700',
          'dark:focus:border-neutral-600 dark:focus:ring-white/5',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          className ?? '',
        ].join(' ')}
      />
    );
  },
);

DateInput.displayName = 'DateInput';