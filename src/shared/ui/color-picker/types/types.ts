/**
 * Tipos públicos e internos del Hex Color Picker.
 * Única responsabilidad: definición de contratos (props, modelos de color).
 */

export interface HexColorPickerProps {
  /** Color en formato hexadecimal, ej. "#7C5CFC" (controlado). */
  value?: string | null;
  /** Notifica el cambio de color, siempre en formato "#RRGGBB". */
  onChange: (hex: string) => void;
  /** Deshabilita el trigger y la apertura del popover. */
  disabled?: boolean;
  /** Clases adicionales para el contenedor raíz. */
  className?: string;
  /**
   * false: el trigger es un bloque sólido del color, sin círculo ni
   * texto hex adentro — para cuando el hex ya se muestra en un campo
   * aparte al lado. true (default): swatch + código hex.
   */
  showLabel?: boolean;
}

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface HSV {
  h: number; // 0-360
  s: number; // 0-100
  v: number; // 0-100
}

export interface UseColorOptions {
  value?: string | null;
  onChange: (hex: string) => void;
}

export interface UseColorReturn {
  hsv: HSV;
  hex: string;
  setHue: (h: number) => void;
  setSaturationAndValue: (s: number, v: number) => void;
  setFromHex: (hex: string) => boolean;
}

export interface UseHexFormatOptions {
  hex: string;
  onCommit: (hex: string) => boolean;
}

export interface UseHexFormatReturn {
  inputValue: string;
  handleInputChange: (raw: string) => void;
  handleInputBlur: () => void;
  handleInputKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
}