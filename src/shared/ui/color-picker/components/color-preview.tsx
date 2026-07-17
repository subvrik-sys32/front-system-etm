import { forwardRef } from 'react';

/**
 * Botón trigger: swatch de color + código hex, sin iconos.
 * Única responsabilidad: presentación del valor actual como trigger clicable.
 */
export interface ColorPreviewProps {
  hex: string;
  disabled?: boolean;
  className?: string;
  onClick?: () => void;
}

export const ColorPreview = forwardRef<HTMLButtonElement, ColorPreviewProps>(
  ({ hex, disabled, className, onClick, ...rest }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        disabled={disabled}
        onClick={onClick}
        className={[
          'flex items-center gap-2 h-9 px-3 rounded-md text-sm',
          'bg-white border border-neutral-200 hover:border-neutral-300',
          'dark:bg-neutral-900 dark:border-neutral-800 dark:hover:border-neutral-700',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400/40',
          'disabled:opacity-50 disabled:cursor-not-allowed transition-colors',
          className ?? '',
        ].join(' ')}
        {...rest}
      >
        <span
          className="w-4 h-4 rounded border border-black/10 dark:border-white/10"
          style={{ backgroundColor: hex }}
        />
        <span className="text-neutral-700 dark:text-neutral-300 font-mono text-xs">{hex}</span>
      </button>
    );
  },
);

ColorPreview.displayName = 'ColorPreview';