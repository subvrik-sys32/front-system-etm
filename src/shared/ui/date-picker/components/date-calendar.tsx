import { CalendarGrid } from './calendar-grid';
import { CalendarHeader } from './calendar-header';
import { useCalendar } from '../hooks/use-calendar';

/**
 * Composición del calendario: combina header y grid usando `useCalendar`.
 * Única responsabilidad: orquestar navegación + selección de día.
 */
export interface DateCalendarProps {
  value?: Date | null;
  minDate?: Date;
  maxDate?: Date;
  onSelect: (date: Date) => void;
}

export function DateCalendar({ value, minDate, maxDate, onSelect }: DateCalendarProps): React.JSX.Element {
  const { weeks, monthYearLabel, goToPreviousMonth, goToNextMonth, goToPreviousYear, goToNextYear } =
    useCalendar({ value, minDate, maxDate });

  return (
    <div className="w-60 p-3">
      <CalendarHeader
        label={monthYearLabel}
        onPreviousMonth={goToPreviousMonth}
        onNextMonth={goToNextMonth}
        onPreviousYear={goToPreviousYear}
        onNextYear={goToNextYear}
      />
      <CalendarGrid weeks={weeks} onSelectDay={onSelect} />
    </div>
  );
}