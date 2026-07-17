import type { CalendarDay as CalendarDayModel } from '../types/types';

/**
 * Celda de un día individual dentro del grid.
 * Única responsabilidad: presentación + click de un día.
 */
export interface CalendarDayProps {
  day: CalendarDayModel;
  onSelect: (date: Date) => void;
}

export function CalendarDay({ day, onSelect }: CalendarDayProps): React.JSX.Element {
  const { date, isCurrentMonth, isToday, isSelected, isDisabled } = day;

  return (
    <button
      type="button"
      disabled={isDisabled}
      onClick={() => onSelect(date)}
      aria-pressed={isSelected}
      aria-current={isToday ? 'date' : undefined}
      className={[
        'relative flex items-center justify-center w-8 h-8 rounded-md text-xs',
        'transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400/40',
        !isCurrentMonth ? 'text-neutral-300 dark:text-neutral-700' : 'text-neutral-700 dark:text-neutral-300',
        !isDisabled && !isSelected ? 'hover:bg-neutral-100 dark:hover:bg-neutral-800' : '',
        isSelected
          ? 'bg-neutral-900 text-white hover:bg-neutral-900 dark:bg-white dark:text-neutral-900 dark:hover:bg-white'
          : '',
        isDisabled ? 'opacity-30 cursor-not-allowed hover:bg-transparent' : 'cursor-pointer',
      ].join(' ')}
    >
      {isToday && !isSelected ? (
        <span className="absolute bottom-1 w-1 h-1 rounded-full bg-neutral-900 dark:bg-white" />
      ) : null}
      {date.getDate()}
    </button>
  );
}