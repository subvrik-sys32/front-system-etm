export type FileStatus = 'UPLOADING' | 'PROCESSING' | 'READY' | 'FAILED';

export interface EngineeringFile {
  id: string;
  originalName: string;
  filename: string;
  extension: string;
  mimeType: string;
  size: number;
  status: FileStatus;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}