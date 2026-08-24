"use client"

import { PhotoViewerDialog } from "@/shared/ui/media-lightbox/photo-viewer-dialog"

type Props = {
  imageUrl: string | null
  onClose: () => void
}

/**
 * Foto adjunta del comentario — Dialog/form (large → fullscreen en móvil).
 */
export function CommentImageDialog({ imageUrl, onClose }: Props) {
  return (
    <PhotoViewerDialog
      open={Boolean(imageUrl)}
      onOpenChange={open => {
        if (!open) onClose()
      }}
      src={imageUrl}
      title="Foto adjunta"
      alt="Foto adjunta"
    />
  )
}