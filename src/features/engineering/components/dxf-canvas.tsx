'use client';

import { useEffect, useRef, useState } from 'react';
import { DxfViewer } from 'dxf-viewer';
import * as THREE from 'three';

interface DxfCanvasProps {
  url: string;
}

export const DxfCanvas = ({ url }: DxfCanvasProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const viewerRef = useRef<DxfViewer | null>(null);
  const [progress, setProgress] = useState<number | null>(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;

    // Inicializamos el visor
    const viewer = new DxfViewer(container, {
      clearColor: new THREE.Color('#050505'),
      autoResize: true,
      antialias: true,
      colorCorrection: true,
    });

    // Guardamos la referencia para usarla en la limpieza
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

    // CORRECCIÓN: Limpieza segura usando la variable local 'viewer'
    return () => {
      if (viewer) {
        viewer.Destroy();
        viewerRef.current = null;
      }
    };
  }, [url]);

  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} className="h-full w-full" />

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