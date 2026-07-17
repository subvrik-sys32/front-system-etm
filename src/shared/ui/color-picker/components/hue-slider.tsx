import { useCallback, useRef } from 'react';
import { clamp } from '../utils/color';

/**
 * Slider horizontal para seleccionar el matiz (0-360).
 * Única responsabilidad: capturar arrastre del puntero y traducirlo a hue.
 */
export interface HueSliderProps {
  hue: number;
  onChange: (hue: number) => void;
}

export function HueSlider({ hue, onChange }: HueSliderProps): React.JSX.Element {
  const trackRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);

  const updateFromPointer = useCallback(
    (clientX: number) => {
      const el = trackRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = clamp(clientX - rect.left, 0, rect.width);
      onChange((x / rect.width) * 360);
    },
    [onChange],
  );

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      isDraggingRef.current = true;
      event.currentTarget.setPointerCapture(event.pointerId);
      updateFromPointer(event.clientX);
    },
    [updateFromPointer],
  );

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!isDraggingRef.current) return;
      updateFromPointer(event.clientX);
    },
    [updateFromPointer],
  );

  const handlePointerUp = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = false;
    event.currentTarget.releasePointerCapture(event.pointerId);
  }, []);

  const thumbLeft = `${clamp((hue / 360) * 100, 0, 100)}%`;

  return (
    <div
      ref={trackRef}
      role="slider"
      aria-label="Matiz"
      aria-valuenow={Math.round(hue)}
      aria-valuemin={0}
      aria-valuemax={360}
      tabIndex={0}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      className="relative h-3 rounded-full cursor-pointer select-none touch-none"
      style={{
        background:
          'linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)',
      }}
    >
      <span
        className="absolute top-1/2 w-3.5 h-3.5 rounded-full border-2 border-white -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{ left: thumbLeft, backgroundColor: `hsl(${hue}, 100%, 50%)`, boxShadow: '0 0 0 1px rgba(0,0,0,0.25)' }}
      />
    </div>
  );
}