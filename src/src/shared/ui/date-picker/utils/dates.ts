/**
 * Funciones puras de manipulación de fechas.
 * Única responsabilidad: cálculos y comparaciones de `Date`, sin estado ni UI.
 */

export function getToday(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function isSameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function addMonths(date: Date, amount: number): Date {
  const result = new Date(date.getFullYear(), date.getMonth() + amount, 1);
  return result;
}

export function addYears(date: Date, amount: number): Date {
  return new Date(date.getFullYear() + amount, date.getMonth(), 1);
}

export function addDays(date: Date, amount: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + amount);
  return result;
}

export function getDaysInMonth(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

/** 0 = lunes ... 6 = domingo (semana ISO, lunes como primer día). */
export function getISOWeekday(date: Date): number {
  const jsDay = date.getDay(); // 0 = domingo ... 6 = sábado
  return jsDay === 0 ? 6 : jsDay - 1;
}

export function isBefore(a: Date, b: Date): boolean {
  return a.getTime() < b.getTime();
}

export function isAfter(a: Date, b: Date): boolean {
  return a.getTime() > b.getTime();
}

export function isDateDisabled(date: Date, minDate?: Date, maxDate?: Date): boolean {
  if (minDate && isBefore(stripTime(date), stripTime(minDate))) return true;
  if (maxDate && isAfter(stripTime(date), stripTime(maxDate))) return true;
  return false;
}

export function stripTime(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function clampToMonth(date: Date, minDate?: Date, maxDate?: Date): Date {
  let result = date;
  if (minDate && isBefore(result, startOfMonth(minDate))) result = startOfMonth(minDate);
  if (maxDate && isAfter(result, startOfMonth(maxDate))) result = startOfMonth(maxDate);
  return result;
}

const MONTH_LABELS = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
] as const;

export function getMonthLabel(date: Date): string {
  return MONTH_LABELS[date.getMonth()];
}

export const WEEKDAY_LABELS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'] as const;