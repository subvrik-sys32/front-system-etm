import { useCallback, useRef } from 'react';
import { clamp } from '../utils/color';

/**
 * Área bidimensional de saturación (eje X) y valor/brillo (eje Y).
 * Única responsabilidad: capturar arrastre del puntero y traducirlo a (s, v).
 */
export interface ColorCanvasProps {
  hue: number;
  saturation: number;
  value: number;
  onChange: (s: number, v: number) => void;
}

const CANVAS_SIZE = 200;

export function ColorCanvas({ hue, saturation, value, onChange }: ColorCanvasProps): React.JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);

  const updateFromPointer = useCallback(
    (clientX: number, clientY: number) => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = clamp(clientX - rect.left, 0, rect.width);
      const y = clamp(clientY - rect.top, 0, rect.height);

      const s = (x / rect.width) * 100;
      const v = 100 - (y / rect.height) * 100;
      onChange(s, v);
    },
    [onChange],
  );

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      isDraggingRef.current = true;
      event.currentTarget.setPointerCapture(event.pointerId);
      updateFromPointer(event.clientX, event.clientY);
    },
    [updateFromPointer],
  );

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!isDraggingRef.current) return;
      updateFromPointer(event.clientX, event.clientY);
    },
    [updateFromPointer],
  );

  const handlePointerUp = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = false;
    event.currentTarget.releasePointerCapture(event.pointerId);
  }, []);

  const thumbLeft = `${clamp(saturation, 0, 100)}%`;
  const thumbTop = `${100 - clamp(value, 0, 100)}%`;

  return (
    <div
      ref={containerRef}
      role="slider"
      aria-label="Saturación y brillo"
      aria-valuenow={Math.round(saturation)}
      tabIndex={0}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      className="relative rounded-md cursor-crosshair select-none touch-none"
      style={{
        width: CANVAS_SIZE,
        height: CANVAS_SIZE,
        backgroundColor: `hsl(${hue}, 100%, 50%)`,
        backgroundImage:
          'linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, transparent)',
      }}
    >
      <span
        className="absolute w-3.5 h-3.5 rounded-full border-2 border-white shadow-md -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{ left: thumbLeft, top: thumbTop, boxShadow: '0 0 0 1px rgba(0,0,0,0.25)' }}
      />
    </div>
  );
}