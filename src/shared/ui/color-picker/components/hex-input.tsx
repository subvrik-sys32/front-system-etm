import { forwardRef } from 'react';

/**
 * Input de texto puro para el código hex, con prefijo "#" fijo.
 * Única responsabilidad: presentación + eventos del campo de texto.
 */
export interface HexInputProps {
  value: string;
  disabled?: boolean;
  onChange: (raw: string) => void;
  onBlur: () => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
}

export const HexInput = forwardRef<HTMLInputElement, HexInputProps>(
  ({ value, disabled, onChange, onBlur, onKeyDown }, ref) => {
    return (
      <div
        className={[
          'flex items-center h-9 px-3 rounded-md text-sm gap-0.5',
          'bg-white border border-neutral-200 focus-within:border-neutral-400',
          'dark:bg-neutral-900 dark:border-neutral-800 dark:focus-within:border-neutral-600',
          'transition-colors',
        ].join(' ')}
      >
        <span className="text-neutral-400 dark:text-neutral-600 font-mono">#</span>
        <input
          ref={ref}
          type="text"
          autoComplete="off"
          spellCheck={false}
          value={value}
          disabled={disabled}
          maxLength={6}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onBlur}
          onKeyDown={onKeyDown}
          className={[
            'w-full bg-transparent outline-none font-mono text-neutral-900 dark:text-neutral-100',
            'disabled:opacity-50 disabled:cursor-not-allowed',
          ].join(' ')}
        />
      </div>
    );
  },
);

HexInput.displayName = 'HexInput';