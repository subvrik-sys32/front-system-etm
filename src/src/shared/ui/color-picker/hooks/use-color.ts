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
      // "next" se calcula UNA vez acá afuera, y setHsv/onChange son
      // dos statements hermanos — ninguno anidado adentro del
      // callback del otro. El bug anterior era exactamente eso:
      // onChange (que dispara setState en EntityDialog, un
      // componente ANCESTRO vía la cadena de props) estaba adentro
      // del callback funcional de setHsv, y React puede ejecutar ese
      // callback durante su propio render/reconciliación — ahí no se
      // puede disparar el setState de otro componente ("Cannot
      // update a component while rendering a different component").
      const next = { ...hsv, h };

      setHsv(next);
      onChange(hsvToHex(next));
    },
    [hsv, onChange],
  );

  const setSaturationAndValue = useCallback(
    (s: number, v: number) => {
      const next = { ...hsv, s, v };

      setHsv(next);
      onChange(hsvToHex(next));
    },
    [hsv, onChange],
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