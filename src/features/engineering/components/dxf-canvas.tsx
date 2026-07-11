'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import DxfParser from 'dxf-parser';
import { ZoomIn, ZoomOut, Maximize, RotateCcw } from 'lucide-react';

interface DxfCanvasProps {
  url: string;
}

interface Point { x: number; y: number }
interface ViewState { scale: number; offsetX: number; offsetY: number }

// Tabla de colores estándar AutoCAD Color Index (ACI), los más usados
// en DXFs reales. No es la tabla completa de 256 colores, pero cubre
// los índices que casi siempre se usan en dibujos técnicos.
const ACI_COLORS: Record<number, string> = {
  1: '#ff0000', // rojo
  2: '#ffff00', // amarillo
  3: '#00ff00', // verde
  4: '#00ffff', // cian
  5: '#0000ff', // azul
  6: '#ff00ff', // magenta
  7: '#ffffff', // blanco/negro (aquí se trata como blanco por el fondo oscuro)
  8: '#808080', // gris
  9: '#c0c0c0', // gris claro
};

function resolveColor(entity: any, layers: Record<string, any>): string {
  // 1. Color directo en la entidad (código de grupo 62)
  if (typeof entity.colorIndex === 'number' && entity.colorIndex > 0 && entity.colorIndex !== 256) {
    return ACI_COLORS[entity.colorIndex] || '#4ade80';
  }
  // 2. Heredado de la capa ("ByLayer")
  const layer = layers?.[entity.layer];
  if (layer && typeof layer.colorIndex === 'number' && layer.colorIndex > 0) {
    return ACI_COLORS[layer.colorIndex] || '#4ade80';
  }
  // 3. Fallback si no se encontró color en ningún lado
  return '#4ade80';
}

// Extrae solo las entidades que soportamos dibujar en 2D.
// Suficiente para piezas planas tipo panel (líneas, polilíneas,
// círculos, arcos, texto simple). No maneja hatches, splines,
// ni bloques con inserts complejos.
type Entity =
  | { kind: 'line'; a: Point; b: Point; color: string }
  | { kind: 'polyline'; points: Point[]; closed: boolean; color: string }
  | { kind: 'circle'; center: Point; radius: number; color: string }
  | { kind: 'arc'; center: Point; radius: number; startAngle: number; endAngle: number; color: string }
  | { kind: 'text'; position: Point; text: string; height: number; color: string };

function extractEntities(dxf: any): Entity[] {
  const out: Entity[] = [];
  const rawEntities = dxf?.entities ?? [];
  const layers = dxf?.tables?.layer?.layers ?? {};

  for (const e of rawEntities) {
    const color = resolveColor(e, layers);

    switch (e.type) {
      case 'LINE':
        if (e.vertices?.length >= 2) {
          out.push({ kind: 'line', a: e.vertices[0], b: e.vertices[1], color });
        }
        break;
      case 'LWPOLYLINE':
      case 'POLYLINE':
        if (e.vertices?.length >= 2) {
          out.push({
            kind: 'polyline',
            points: e.vertices.map((v: any) => ({ x: v.x, y: v.y })),
            closed: !!e.shape || !!e.closed,
            color,
          });
        }
        break;
      case 'CIRCLE':
        out.push({ kind: 'circle', center: e.center, radius: e.radius, color });
        break;
      case 'ARC':
        out.push({
          kind: 'arc',
          center: e.center,
          radius: e.radius,
          startAngle: (e.startAngle * Math.PI) / 180,
          endAngle: (e.endAngle * Math.PI) / 180,
          color,
        });
        break;
      case 'TEXT':
      case 'MTEXT':
        if (e.text && e.startPoint) {
          out.push({
            kind: 'text',
            position: e.startPoint,
            text: e.text,
            height: e.textHeight || e.height || 2.5,
            color,
          });
        }
        break;
    }
  }
  return out;
}

function computeBounds(entities: Entity[]) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

  const expand = (p: Point) => {
    if (!Number.isFinite(p.x) || !Number.isFinite(p.y)) return;
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x);
    maxY = Math.max(maxY, p.y);
  };

  for (const e of entities) {
    if (e.kind === 'line') { expand(e.a); expand(e.b); }
    else if (e.kind === 'polyline') e.points.forEach(expand);
    else if (e.kind === 'circle') {
      expand({ x: e.center.x - e.radius, y: e.center.y - e.radius });
      expand({ x: e.center.x + e.radius, y: e.center.y + e.radius });
    } else if (e.kind === 'arc') {
      expand({ x: e.center.x - e.radius, y: e.center.y - e.radius });
      expand({ x: e.center.x + e.radius, y: e.center.y + e.radius });
    } else if (e.kind === 'text') expand(e.position);
  }

  if (!Number.isFinite(minX) || !Number.isFinite(minY)) return null;
  return { minX, minY, maxX, maxY };
}

export const DxfCanvas = ({ url }: DxfCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const entitiesRef = useRef<Entity[]>([]);
  const viewRef = useRef<ViewState>({ scale: 1, offsetX: 0, offsetY: 0 });
  const draggingRef = useRef<{ startX: number; startY: number; startOffsetX: number; startOffsetY: number } | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dibuja el estado actual — se llama SOLO cuando algo cambió
  // (carga, zoom, pan, resize). Sin loop continuo: costo ~0 en reposo.
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const { scale, offsetX, offsetY } = viewRef.current;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;

    // Buffer interno = tamaño en pantalla * dpr, así el canvas
    // nunca se estira: el navegador no tiene que reescalar nada.
    if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
    }

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    ctx.save();
    // Origen al centro del canvas, luego pan, luego escala.
    // Y invertido porque DXF usa Y hacia arriba, canvas hacia abajo.
    ctx.translate(w / 2 + offsetX, h / 2 + offsetY);
    ctx.scale(scale, -scale);

    ctx.lineWidth = 1 / scale;

    for (const e of entitiesRef.current) {
      ctx.strokeStyle = e.color;
      ctx.fillStyle = e.color;
      ctx.beginPath();
      if (e.kind === 'line') {
        ctx.moveTo(e.a.x, e.a.y);
        ctx.lineTo(e.b.x, e.b.y);
        ctx.stroke();
      } else if (e.kind === 'polyline') {
        e.points.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
        if (e.closed) ctx.closePath();
        ctx.stroke();
      } else if (e.kind === 'circle') {
        ctx.arc(e.center.x, e.center.y, e.radius, 0, Math.PI * 2);
        ctx.stroke();
      } else if (e.kind === 'arc') {
        ctx.arc(e.center.x, e.center.y, e.radius, e.startAngle, e.endAngle);
        ctx.stroke();
      } else if (e.kind === 'text') {
        ctx.save();
        ctx.scale(1, -1); // el texto no debe quedar espejado por el flip de Y
        ctx.font = `${e.height}px sans-serif`;
        ctx.fillText(e.text, e.position.x, -e.position.y);
        ctx.restore();
      }
    }
    ctx.restore();
  }, []);

  const fitToView = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const bounds = computeBounds(entitiesRef.current);
    if (!bounds) return;

    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    const drawW = bounds.maxX - bounds.minX || 1;
    const drawH = bounds.maxY - bounds.minY || 1;
    const padding = 0.85; // deja ~15% de margen

    const scale = Math.min((w / drawW) * padding, (h / drawH) * padding);
    const centerX = (bounds.minX + bounds.maxX) / 2;
    const centerY = (bounds.minY + bounds.maxY) / 2;

    viewRef.current = { scale, offsetX: -centerX * scale, offsetY: centerY * scale };
    draw();
  }, [draw]);

  // Carga y parseo del DXF
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`No se pudo descargar el archivo (${res.status})`);
        return res.text();
      })
      .then((text) => {
        if (cancelled) return;
        const parser = new DxfParser();
        const dxf = parser.parseSync(text);
        entitiesRef.current = extractEntities(dxf);
        setLoading(false);
        // Esperamos un frame para que el canvas ya tenga su tamaño real
        requestAnimationFrame(fitToView);
      })
      .catch((err: Error) => {
        if (cancelled) return;
        setError(err.message || 'Error al leer el archivo DXF');
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, [url, fitToView]);

  // Redibuja si el contenedor cambia de tamaño (el modal, por ejemplo)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver(() => draw());
    observer.observe(container);
    return () => observer.disconnect();
  }, [draw]);

  // Pan con arrastre del mouse
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onPointerDown = (e: PointerEvent) => {
      draggingRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        startOffsetX: viewRef.current.offsetX,
        startOffsetY: viewRef.current.offsetY,
      };
      canvas.setPointerCapture(e.pointerId);
    };
    const onPointerMove = (e: PointerEvent) => {
      const drag = draggingRef.current;
      if (!drag) return;
      viewRef.current = {
        ...viewRef.current,
        offsetX: drag.startOffsetX + (e.clientX - drag.startX),
        offsetY: drag.startOffsetY + (e.clientY - drag.startY),
      };
      draw();
    };
    const onPointerUp = () => { draggingRef.current = null; };

    // Zoom con scroll, centrado en el cursor
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const cx = e.clientX - rect.left - rect.width / 2;
      const cy = e.clientY - rect.top - rect.height / 2;

      const { scale, offsetX, offsetY } = viewRef.current;
      const factor = e.deltaY < 0 ? 1.1 : 1 / 1.1;
      const newScale = scale * factor;

      // Mantiene fijo el punto bajo el cursor mientras hace zoom
      viewRef.current = {
        scale: newScale,
        offsetX: cx - (cx - offsetX) * factor,
        offsetY: cy - (cy - offsetY) * factor,
      };
      draw();
    };

    canvas.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('wheel', onWheel, { passive: false });

    return () => {
      canvas.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('wheel', onWheel);
    };
  }, [draw]);

  const handleZoom = useCallback((direction: 'in' | 'out') => {
    const factor = direction === 'in' ? 1.25 : 0.8;
    viewRef.current = { ...viewRef.current, scale: viewRef.current.scale * factor };
    draw();
  }, [draw]);

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full"
      style={{
        backgroundColor: '#0a0a0c',
        backgroundImage: 'radial-gradient(circle, #3a3a3f 1.5px, transparent 1.5px)',
        backgroundSize: '24px 24px',
      }}
    >
      <canvas ref={canvasRef} className="h-full w-full cursor-grab active:cursor-grabbing" />

      <div className="absolute right-6 top-6 flex flex-col gap-1 rounded-xl bg-[#101012]/90 p-1.5 ring-1 ring-white/10 backdrop-blur-sm">
        <button onClick={() => handleZoom('in')} className="rounded-lg p-2 text-neutral-300 hover:bg-white/10 hover:text-white" title="Acercar">
          <ZoomIn size={16} />
        </button>
        <button onClick={() => handleZoom('out')} className="rounded-lg p-2 text-neutral-300 hover:bg-white/10 hover:text-white" title="Alejar">
          <ZoomOut size={16} />
        </button>
        <div className="my-0.5 h-px bg-white/10" />
        <button onClick={fitToView} className="rounded-lg p-2 text-neutral-300 hover:bg-white/10 hover:text-white" title="Ajustar a la vista">
          <Maximize size={16} />
        </button>
        <button onClick={fitToView} className="rounded-lg p-2 text-neutral-300 hover:bg-white/10 hover:text-white" title="Centrar vista">
          <RotateCcw size={16} />
        </button>
      </div>

      {loading && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#050505]/80 text-xs text-neutral-400">
          Cargando geometría...
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#050505]/90 px-6 text-center text-xs text-red-400">
          {error}
        </div>
      )}
    </div>
  );
};