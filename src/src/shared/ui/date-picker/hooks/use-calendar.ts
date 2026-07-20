import { useCallback, useMemo, useState } from 'react';
import type { UseCalendarOptions, UseCalendarReturn } from '../types/types';
import { buildCalendarMatrix } from '../utils/calendar';
import { addMonths, addYears, getMonthLabel, getToday } from '../utils/dates';

/**
 * Maneja el mes visible y la navegación (mes/año anterior-siguiente).
 * Única responsabilidad: estado de navegación + derivar la grilla de días.
 */
export function useCalendar({ value, minDate, maxDate }: UseCalendarOptions): UseCalendarReturn {
  const [viewDate, setViewDateState] = useState<Date>(() => value ?? getToday());

  const weeks = useMemo(
    () => buildCalendarMatrix(viewDate, value ?? null, minDate, maxDate),
    [viewDate, value, minDate, maxDate],
  );

  const monthYearLabel = useMemo(
    () => `${getMonthLabel(viewDate)} ${viewDate.getFullYear()}`,
    [viewDate],
  );

  const setViewDate = useCallback((date: Date) => {
    setViewDateState(date);
  }, []);

  const goToPreviousMonth = useCallback(() => {
    setViewDateState((current) => addMonths(current, -1));
  }, []);

  const goToNextMonth = useCallback(() => {
    setViewDateState((current) => addMonths(current, 1));
  }, []);

  const goToPreviousYear = useCallback(() => {
    setViewDateState((current) => addYears(current, -1));
  }, []);

  const goToNextYear = useCallback(() => {
    setViewDateState((current) => addYears(current, 1));
  }, []);

  return {
    viewDate,
    weeks,
    monthYearLabel,
    goToPreviousMonth,
    goToNextMonth,
    goToPreviousYear,
    goToNextYear,
    setViewDate,
  };
}