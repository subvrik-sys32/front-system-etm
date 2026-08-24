"use client"

import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query"
import { detailAssetsApi } from "../api/detail-assets.api"

export const taskDetailAssetsKey = (taskId: string) =>
  ["detail-assets", "task", taskId] as const
export const projectDetailAssetsKey = (projectId: string) =>
  ["detail-assets", "project", projectId] as const

/**
 * Invalida dialog + badges de fila (detailAssetCount en listados).
 */
export function invalidateDetailAssetCaches(
  qc: QueryClient,
  scope: { taskId?: string; projectId?: string },
) {
  if (scope.taskId) {
    void qc.invalidateQueries({ queryKey: taskDetailAssetsKey(scope.taskId) })
  }
  if (scope.projectId) {
    void qc.invalidateQueries({ queryKey: projectDetailAssetsKey(scope.projectId) })
  }
  void qc.invalidateQueries({ queryKey: ["tasks"] })
  void qc.invalidateQueries({ queryKey: ["projects"] })
}

export function useTaskDetailAssets(taskId: string | undefined, enabled = true) {
  const q = useQuery({
    queryKey: taskDetailAssetsKey(taskId ?? ""),
    enabled: Boolean(taskId) && enabled,
    queryFn: () => detailAssetsApi.listTask(taskId!),
  })
  return {
    data: q.data,
    loading: q.isLoading,
    refetch: q.refetch,
  }
}

export function useProjectDetailAssets(
  projectId: string | undefined,
  enabled = true,
) {
  const q = useQuery({
    queryKey: projectDetailAssetsKey(projectId ?? ""),
    enabled: Boolean(projectId) && enabled,
    queryFn: () => detailAssetsApi.listProject(projectId!),
  })
  return {
    data: q.data ?? [],
    loading: q.isLoading,
    refetch: q.refetch,
  }
}

export function useDetailAssetMutations(scope: {
  taskId?: string
  projectId?: string
}) {
  const qc = useQueryClient()
  const invalidate = () => invalidateDetailAssetCaches(qc, scope)

  const uploadDxf = useMutation({
    mutationFn: ({ lineId, file }: { lineId: string; file: File }) =>
      detailAssetsApi.uploadMaterialLineDxf(lineId, file),
    onSuccess: invalidate,
  })

  const uploadPhoto = useMutation({
    mutationFn: (file: File) => {
      if (scope.taskId) return detailAssetsApi.uploadTaskPhoto(scope.taskId, file)
      return detailAssetsApi.uploadProjectPhoto(scope.projectId!, file)
    },
    onSuccess: invalidate,
  })

  const saveNote = useMutation({
    mutationFn: (text: string) => {
      if (scope.taskId) return detailAssetsApi.upsertTaskNote(scope.taskId, text)
      return detailAssetsApi.upsertProjectNote(scope.projectId!, text)
    },
    onSuccess: invalidate,
  })

  const remove = useMutation({
    mutationFn: (id: string) => detailAssetsApi.remove(id),
    onSuccess: invalidate,
  })

  return { uploadDxf, uploadPhoto, saveNote, remove }
}