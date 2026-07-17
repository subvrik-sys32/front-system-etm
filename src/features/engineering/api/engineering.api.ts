import { api, apiBaseUrl } from '@/lib/api';
import { EngineeringFile } from '../types/engineering-file';

export const engineeringApi = {
  upload: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<EngineeringFile>('/engineering/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data);
  },
  list: (signal?: AbortSignal) => api.get<EngineeringFile[]>('/engineering/files', { signal }).then((r) => r.data),
  findOne: (id: string) => api.get<EngineeringFile>(`/engineering/files/${id}`).then((r) => r.data),
  getRawUrl: (id: string) => `${apiBaseUrl}/engineering/files/${id}/raw`,
  
  // Nueva URL para reporte con modo condicional
  getReportUrl: (id: string, download: boolean = false) =>
    `${apiBaseUrl}/engineering/files/${id}/report${download ? '?download=true' : ''}`,
    
  remove: (id: string) => api.delete(`/engineering/files/${id}`).then((r) => r.data),
};