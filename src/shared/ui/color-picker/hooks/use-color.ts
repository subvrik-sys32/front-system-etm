import { useCallback, useEffect, useState } from 'react';
import type { HSV, UseColorOptions, UseColorReturn } from '../types/types';
import { hexToRgb, hsvToHex, isValidHex, normalizeHex, rgbToHsv } from '../utils/color';

const DEFAULT_HSV: HSV = { h: 260, s: 70, v: 90 };

function hexToHsvSafe(hex: string | null | undefined): HSV {
  if (!hex) return DEFAULT_HSV;
  const rgb = hexToRgb(hex);
  return rgb ? rgbToHsv(rgb) : DEFAULT_HSV;
}

/**
 * Estado de color en HSV derivado/sincronizado con la prop `value` (hex).
 * Única responsabilidad: mantener el modelo HSV coherente con el hex externo.
 */
export function useColor({ value, onChange }: UseColorOptions): UseColorReturn {
  const [hsv, setHsv] = useState<HSV>(() => hexToHsvSafe(value));

  useEffect(() => {
    setHsv(hexToHsvSafe(value));
  }, [value]);

  const hex = hsvToHex(hsv);

  const setHue = useCallback(
    (h: number) => {
      setHsv((current) => {
        const next = { ...current, h };
        onChange(hsvToHex(next));
        return next;
      });
    },
    [onChange],
  );

  const setSaturationAndValue = useCallback(
    (s: number, v: number) => {
      setHsv((current) => {
        const next = { ...current, s, v };
        onChange(hsvToHex(next));
        return next;
      });
    },
    [onChange],
  );

  const setFromHex = useCallback(
    (candidate: string): boolean => {
      if (!isValidHex(candidate)) return false;
      const normalized = normalizeHex(candidate);
      const rgb = hexToRgb(normalized);
      if (!rgb) return false;
      setHsv(rgbToHsv(rgb));
      onChange(normalized);
      return true;
    },
    [onChange],
  );

  return { hsv, hex, setHue, setSaturationAndValue, setFromHex };
}