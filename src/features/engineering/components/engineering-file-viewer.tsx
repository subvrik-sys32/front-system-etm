'use client';

import dynamic from 'next/dynamic';
import { X } from 'lucide-react';
import { engineeringApi } from '../api/engineering.api';

const DxfCanvas = dynamic(
  () => import('./dxf-canvas').then((m) => m.DxfCanvas),
  { ssr: false },
);

interface EngineeringFileViewerProps {
  fileId: string;
  fileName: string;
  onClose: () => void;
}

export const EngineeringFileViewer = ({
  fileId,
  fileName,
  onClose,
}: EngineeringFileViewerProps) => {
  const rawUrl = engineeringApi.getRawUrl(fileId);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex h-[85vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-[#101012] ring-1 ring-white/10 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-white/5 px-5 py-4">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-white">{fileName}</h3>
            <p className="text-xs text-neutral-500">
              Vista previa del archivo de ingeniería — arrastra para mover, scroll para zoom
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-neutral-400 hover:bg-white/5 hover:text-white"
            title="Cerrar"
          >
            <X size={16} />
          </button>
        </div>

        <div className="relative min-h-0 flex-1 overflow-hidden">
          <DxfCanvas url={rawUrl} />
        </div>
      </div>
    </div>
  );
};