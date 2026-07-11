'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { DxfViewer } from 'dxf-viewer';
import * as THREE from 'three';
import { ZoomIn, ZoomOut, Maximize, RotateCcw } from 'lucide-react';

interface DxfCanvasProps {
  url: string;
}

export const DxfCanvas = ({ url }: DxfCanvasProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const viewerRef = useRef<DxfViewer | null>(null);
  const [progress, setProgress] = useState<number | null>(0);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;

    const viewer = new DxfViewer(container, {
      clearColor: new THREE.Color('#0a0a0c'),
      autoResize: true,
      antialias: true,
      colorCorrection: true,
    });

    viewerRef.current = viewer;

    setError(null);
    setProgress(0);

    viewer
      .Load({
        url,
        fonts: [],
        progressCbk: (_phase: string, processedSize: number, totalSize: number) => {
          if (totalSize > 0) {
            setProgress(Math.round((processedSize / totalSize) * 100));
          }
        },
      })
      .then(() => {
        setProgress(null);
      })
      .catch((err: Error) => {
        setError(err.message || 'Error al cargar el archivo DXF');
        setProgress(null);
      });

    return () => {
      if (viewer) {
        viewer.Destroy();
        viewerRef.current = null;
      }
    };
  }, [url, reloadKey]);

  // Dispara un evento de rueda sintético sobre el canvas real del visor,
  // reutilizando el zoom que dxf-viewer ya soporta de forma nativa.
  const dispatchWheelZoom = useCallback((direction: 'in' | 'out') => {
    const canvas = containerRef.current?.querySelector('canvas');
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const wheelEvent = new WheelEvent('wheel', {
      deltaY: direction === 'in' ? -120 : 120,
      clientX: rect.left + rect.width / 2,
      clientY: rect.top + rect.height / 2,
      bubbles: true,
      cancelable: true,
    });

    canvas.dispatchEvent(wheelEvent);
  }, []);

  const handleZoomIn = () => dispatchWheelZoom('in');
  const handleZoomOut = () => dispatchWheelZoom('out');

  // No hay un método público confiable de "fit view" en dxf-viewer,
  // así que remontamos el visor: esto restaura el encuadre automático inicial.
  const handleFitView = () => setReloadKey((k) => k + 1);

  return (
    <div className="relative h-full w-full">
      {/* Fondo tipo CAD: grid de puntos */}
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: '#0a0a0c',
          backgroundImage: 'radial-gradient(circle, #2a2a2e 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      />

      {/* Marco con margen para que el grid de puntos se asome alrededor del canvas */}
      <div className="absolute inset-3 overflow-hidden rounded-lg ring-1 ring-white/5">
        <div ref={containerRef} className="h-full w-full" />
      </div>

      {/* Toolbar flotante */}
      <div className="absolute right-6 top-6 flex flex-col gap-1 rounded-xl bg-[#101012]/90 p-1.5 ring-1 ring-white/10 backdrop-blur-sm">
        <button
          onClick={handleZoomIn}
          className="rounded-lg p-2 text-neutral-300 hover:bg-white/10 hover:text-white"
          title="Acercar"
        >
          <ZoomIn size={16} />
        </button>
        <button
          onClick={handleZoomOut}
          className="rounded-lg p-2 text-neutral-300 hover:bg-white/10 hover:text-white"
          title="Alejar"
        >
          <ZoomOut size={16} />
        </button>
        <div className="my-0.5 h-px bg-white/10" />
        <button
          onClick={handleFitView}
          className="rounded-lg p-2 text-neutral-300 hover:bg-white/10 hover:text-white"
          title="Ajustar a la vista"
        >
          <Maximize size={16} />
        </button>
        <button
          onClick={handleFitView}
          className="rounded-lg p-2 text-neutral-300 hover:bg-white/10 hover:text-white"
          title="Restablecer vista"
        >
          <RotateCcw size={16} />
        </button>
      </div>

      {progress !== null && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#050505]/80 text-xs text-neutral-400">
          Cargando geometría... {progress}%
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