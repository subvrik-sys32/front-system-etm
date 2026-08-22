export type DetailAssetKind = "PHOTO" | "NOTE" | "DXF"

export type DetailAsset = {
  id: string
  kind: DetailAssetKind
  storageKey: string | null
  publicUrl: string | null
  mimeType: string
  sizeBytes: number
  originalName: string
  meta: { text?: string; taskId?: string; materialLineId?: string } | null
  sortOrder: number
  createdAt: string
  projectId?: string | null
  taskId?: string | null
  materialLineId?: string | null
}

export type TaskDetailAssetsResponse = {
  taskAssets: DetailAsset[]
  materialLines: Array<{
    id: string
    pieces: number
    sortOrder: number
    material: { id: string; name: string; color?: string | null }
    thickness: { id: string; name: string }
    dxf: DetailAsset | null
  }>
}
