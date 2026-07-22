import { forwardRef } from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';

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
  onPointerDown?: (event: React.PointerEvent<HTMLInputElement>) => void;
  onCalendarClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
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
      onPointerDown,
      onCalendarClick,
    },
    ref,
  ) => {
    return (
      <div className="relative flex items-center w-full">
        <input
          ref={ref}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          spellCheck={false}
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onBlur}
          onKeyDown={onKeyDown}
          onFocus={onFocus}
          onPointerDown={onPointerDown}
          className={[
            'w-full h-10 pl-3 pr-9 rounded-xl text-sm font-medium outline-none transition-colors',
            'bg-white/6 text-neutral-200 placeholder:text-neutral-600',
            'border border-transparent',
            'focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            className ?? '',
          ].join(' ')}
        />

        <button
          type="button"
          tabIndex={-1}
          disabled={disabled}
          onMouseDown={(e) => e.preventDefault()}
          onTouchEnd={(e) => {
            // Previene que en móvil el tap del botón se transmita al input
            e.stopPropagation();
          }}
          onClick={onCalendarClick}
          className="absolute right-2 flex h-7 w-7 items-center justify-center rounded-lg text-neutral-400 hover:bg-white/10 hover:text-white transition-colors disabled:opacity-50"
          aria-label="Abrir calendario"
        >
          <CalendarIcon size={16} />
        </button>
      </div>
    );
  },
);

DateInput.displayName = 'DateInput';