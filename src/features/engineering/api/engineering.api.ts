  import { api } from '@/lib/api'
import { EngineeringFile } from '../types/engineering-file';

export const engineeringApi = {
  upload: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api
      .post<EngineeringFile>('/engineering/files/upload', formData)
      .then((r) => r.data);
  },

  list: () => api.get<EngineeringFile[]>('/engineering/files').then((r) => r.data),

  findOne: (id: string) =>
    api.get<EngineeringFile>(`/engineering/files/${id}`).then((r) => r.data),

  // URL directa al DXF crudo, consumida por dxf-viewer en el navegador
  getRawUrl: (id: string) => `${process.env.NEXT_PUBLIC_API_URL}/engineering/files/${id}/raw`,

  remove: (id: string) => api.delete(`/engineering/files/${id}`).then((r) => r.data),
};