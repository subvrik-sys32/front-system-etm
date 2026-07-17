/**
 * Formateo/parseo de fechas para el formato de visualización dd/MM/yyyy.
 * Única responsabilidad: conversión Date <-> string, sin lógica de UI.
 */

const DATE_PATTERN = /^(\d{2})\/(\d{2})\/(\d{4})$/;

export function formatDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear());
  return `${day}/${month}/${year}`;
}

/**
 * Parsea un string dd/MM/yyyy de forma estricta.
 * Devuelve `null` si el formato o la fecha calendárica no son válidos
 * (por ejemplo, 31/02/2026 se considera inválido).
 */
export function parseDateString(raw: string): Date | null {
  const match = DATE_PATTERN.exec(raw.trim());
  if (!match) return null;

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);

  if (month < 1 || month > 12) return null;

  const candidate = new Date(year, month - 1, day);
  const isRealDate =
    candidate.getFullYear() === year &&
    candidate.getMonth() === month - 1 &&
    candidate.getDate() === day;

  return isRealDate ? candidate : null;
}

/** Permite solo dígitos y "/" mientras el usuario escribe, sin validar aún. */
export function sanitizeDateInput(raw: string): string {
  return raw.replace(/[^\d/]/g, '').slice(0, 10);
}