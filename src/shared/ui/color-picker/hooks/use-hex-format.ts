import { useCallback, useEffect, useState } from 'react';
import type { UseHexFormatOptions, UseHexFormatReturn } from '../types/types';
import { sanitizeHexInput } from '../utils/format';

/**
 * Sincroniza el texto del input hex con el color externo, valida al
 * confirmar (blur / Enter) y revierte si el texto no es un hex válido.
 * Única responsabilidad: puente entre texto libre y el modelo de color.
 */
export function useHexFormat({ hex, onCommit }: UseHexFormatOptions): UseHexFormatReturn {
  const [inputValue, setInputValue] = useState<string>(hex.replace('#', ''));

  useEffect(() => {
    setInputValue(hex.replace('#', ''));
  }, [hex]);

  const handleInputChange = useCallback((raw: string) => {
    setInputValue(sanitizeHexInput(raw));
  }, []);

  const commit = useCallback(() => {
    const committed = onCommit(`#${inputValue}`);
    if (!committed) {
      setInputValue(hex.replace('#', ''));
    }
  }, [inputValue, hex, onCommit]);

  const handleInputBlur = useCallback(() => {
    commit();
  }, [commit]);

  const handleInputKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        commit();
      }
    },
    [commit],
  );

  return { inputValue, handleInputChange, handleInputBlur, handleInputKeyDown };
}