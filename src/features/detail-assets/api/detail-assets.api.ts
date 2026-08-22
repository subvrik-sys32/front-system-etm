import { api } from "@/lib/api"
import type { DetailAsset, TaskDetailAssetsResponse } from "../types"

export const detailAssetsApi = {
  listProject(projectId: string) {
    return api.get<DetailAsset[]>(`/projects/${projectId}/detail-assets`).then(r => r.data)
  },

  listTask(taskId: string) {
    return api.get<TaskDetailAssetsResponse>(`/tasks/${taskId}/detail-assets`).then(r => r.data)
  },

  async uploadProjectPhoto(projectId: string, file: File) {
    const form = new FormData()
    form.append("file", file, file.name)
    const res = await api.post<DetailAsset>(`/projects/${projectId}/detail-assets/photo`, form, {
      timeout: 120_000,
      headers: { "Content-Type": undefined as unknown as string },
    })
    return res.data
  },

  async uploadTaskPhoto(taskId: string, file: File) {
    const form = new FormData()
    form.append("file", file, file.name)
    const res = await api.post<DetailAsset>(`/tasks/${taskId}/detail-assets/photo`, form, {
      timeout: 120_000,
      headers: { "Content-Type": undefined as unknown as string },
    })
    return res.data
  },

  upsertProjectNote(projectId: string, text: string) {
    return api.post<DetailAsset>(`/projects/${projectId}/detail-assets/note`, { text }).then(r => r.data)
  },

  upsertTaskNote(taskId: string, text: string) {
    return api.post<DetailAsset>(`/tasks/${taskId}/detail-assets/note`, { text }).then(r => r.data)
  },

  /** Paso 2: tras guardar la tarea (lineId real). */
  async uploadMaterialLineDxf(lineId: string, file: File, signal?: AbortSignal) {
    const form = new FormData()
    form.append("file", file, file.name)
    const res = await api.post<DetailAsset>(`/task-material-lines/${lineId}/dxf`, form, {
      signal,
      timeout: 120_000,
      headers: { "Content-Type": undefined as unknown as string },
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
    })
    return res.data
  },

  remove(id: string) {
    return api.delete(`/detail-assets/${id}`).then(r => r.data)
  },

  purgeDxf(opts?: { days?: number; dryRun?: boolean }) {
    const params = new URLSearchParams()
    if (opts?.days) params.set("days", String(opts.days))
    if (opts?.dryRun) params.set("dryRun", "1")
    return api.post(`/detail-assets/purge-dxf?${params}`).then(r => r.data)
  },
}
