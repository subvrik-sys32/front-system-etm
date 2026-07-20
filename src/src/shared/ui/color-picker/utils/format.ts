/**
 * Sanitización y formateo del texto del input hexadecimal.
 * Única responsabilidad: normalizar texto libre antes/después de validar.
 */

/** Permite solo dígitos hex mientras el usuario escribe, sin validar aún. */
export function sanitizeHexInput(raw: string): string {
  const withoutHash = raw.replace('#', '');
  const onlyHexChars = withoutHash.replace(/[^0-9a-fA-F]/g, '');
  return onlyHexChars.slice(0, 6).toUpperCase();
}

export function withHashPrefix(value: string): string {
  return value.length > 0 ? `#${value}` : '';
}