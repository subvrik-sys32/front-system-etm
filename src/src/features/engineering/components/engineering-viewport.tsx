'use client';

import { useState } from 'react';
import { FileUp, Eye, Trash2 } from 'lucide-react';
import {
  useEngineeringFiles,
  useUploadEngineeringFile,
  useDeleteEngineeringFile,
} from '../hooks/use-engineering-files';
import { EngineeringFileViewer } from './engineering-file-viewer';
import { PrimaryAction } from '@/shared/ui/actions/primary-action';
import { EngineeringFile, FileStatus } from '../types/engineering-file';

const STATUS_LABELS: Record<FileStatus, string> = {
  UPLOADING: 'Subiendo',
  PROCESSING: 'Procesando',
  READY: 'Listo',
  FAILED: 'Falló',
};

const STATUS_STYLES: Record<FileStatus, string> = {
  UPLOADING: 'bg-blue-500/10 text-blue-400',
  PROCESSING: 'bg-yellow-500/10 text-yellow-400',
  READY: 'bg-green-500/10 text-green-400',
  FAILED: 'bg-red-500/10 text-red-400',
};

const formatSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const EngineeringViewport = () => {
  const { data: files, isLoading } = useEngineeringFiles();
  const { mutate: upload, isPending } = useUploadEngineeringFile();
  const { mutate: remove } = useDeleteEngineeringFile();
  const [previewFile, setPreviewFile] = useState<EngineeringFile | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) upload(file);
    e.target.value = '';
  };

  return (
    <div className="relative w-full overflow-hidden rounded-2xl bg-[#101012] shadow-2xl ring-1 ring-white/6">
      <div className="flex items-center justify-between border-b border-white/5 px-6 py-4">
        <div className="space-y-0.5">
          <h2 className="text-xs font-bold uppercase tracking-widest text-white">
            Archivos de Ingeniería
          </h2>
        </div>

        <input
          id="file-upload"
          type="file"
          accept=".dxf"
          className="hidden"
          onChange={handleFileChange}
        />
        <PrimaryAction
          label="Subir Archivo"
          icon={FileUp}
          isLoading={isPending}
          onClick={() => document.getElementById('file-upload')?.click()}
        />
      </div>

      <div className="min-h-50">
        <div className="grid grid-cols-4 gap-4 border-b border-white/5 px-6 py-3 text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
          <span>Archivo</span>
          <span>Estado</span>
          <span>Tamaño</span>
          <span>Acciones</span>
        </div>

        <div className="divide-y divide-white/5">
          {isLoading ? (
            <div className="p-8 text-center text-xs text-neutral-500">Cargando datos...</div>
          ) : !files || files.length === 0 ? (
            <div className="p-8 text-center text-xs text-neutral-500">
              No hay archivos registrados
            </div>
          ) : (
            files.map((file) => (
              <div
                key={file.id}
                className="grid grid-cols-4 items-center gap-4 px-6 py-3 text-xs text-neutral-300"
              >
                <span className="truncate" title={file.originalName}>
                  {file.originalName}
                </span>

                <span>
                  <span
                    className={`rounded-full px-2 py-1 text-[10px] font-medium ${STATUS_STYLES[file.status]}`}
                  >
                    {STATUS_LABELS[file.status]}
                  </span>
                </span>

                <span className="text-neutral-500">{formatSize(file.size)}</span>

                <span className="flex items-center gap-2">
                  <button
                    disabled={file.status !== 'READY'}
                    onClick={() => setPreviewFile(file)}
                    className="rounded-lg p-1.5 text-neutral-400 hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                    title={file.status === 'READY' ? 'Ver archivo' : 'Aún no disponible'}
                  >
                    <Eye size={14} />
                  </button>
                  <button
                    onClick={() => remove(file.id)}
                    className="rounded-lg p-1.5 text-neutral-400 hover:bg-red-500/10 hover:text-red-400"
                    title="Eliminar"
                  >
                    <Trash2 size={14} />
                  </button>
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {previewFile && (
        <EngineeringFileViewer
          fileId={previewFile.id}
          fileName={previewFile.originalName}
          onClose={() => setPreviewFile(null)}
        />
      )}
    </div>
  );
};