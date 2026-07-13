import { api } from '@/lib/api';
import { EngineeringFile } from '../types/engineering-file';

export const engineeringApi = {
  upload: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<EngineeringFile>('/engineering/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data);
  },
  list: () => api.get<EngineeringFile[]>('/engineering/files').then((r) => r.data),
  findOne: (id: string) => api.get<EngineeringFile>(`/engineering/files/${id}`).then((r) => r.data),
  getRawUrl: (id: string) => `${process.env.NEXT_PUBLIC_API_URL}/engineering/files/${id}/raw`,
  
  // Nueva URL para reporte con modo condicional
  getReportUrl: (id: string, download: boolean = false) =>
    `${process.env.NEXT_PUBLIC_API_URL}/engineering/files/${id}/report${download ? '?download=true' : ''}`,
    
  remove: (id: string) => api.delete(`/engineering/files/${id}`).then((r) => r.data),
};