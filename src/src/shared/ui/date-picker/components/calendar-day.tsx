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
        'relative flex items-center justify-center w-8 h-8 rounded-lg text-xs font-medium',
        'transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/15',
        !isCurrentMonth ? 'text-neutral-700' : 'text-neutral-300',
        !isDisabled && !isSelected ? 'hover:bg-white/8' : '',
        isSelected
          ? 'bg-white text-neutral-900 hover:bg-white font-semibold'
          : '',
        isDisabled ? 'opacity-30 cursor-not-allowed hover:bg-transparent' : 'cursor-pointer',
      ].join(' ')}
    >
      {isToday && !isSelected ? (
        <span className="absolute bottom-1 w-1 h-1 rounded-full bg-white" />
      ) : null}
      {date.getDate()}
    </button>
  );
}