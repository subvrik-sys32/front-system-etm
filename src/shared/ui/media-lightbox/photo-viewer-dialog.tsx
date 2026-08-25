"use client"

import { ExternalLink, ImageIcon } from "lucide-react"

import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog"
import { FormDialogHeader } from "@/shared/ui/dialogs/form-dialog/form-dialog-header"
import { ScrollArea } from "@/components/ui/scroll-area"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  src: string | null
  title?: string
  alt?: string
  /**
   * Deeplink a la entidad dueña del asset.
   * Solo se invoca si el caller decide que hay destino distinto al origen actual.
   */
  onOpenEntity?: () => void
  openEntityLabel?: string
}

/**
 * Visor de foto con el mismo contrato que el resto de forms:
 * Dialog size="large" → en móvil form edge-to-edge; en desktop card centrada.
 */
export function PhotoViewerDialog({
  open,
  onOpenChange,
  src,
  title = "Foto",
  alt = "Foto",
  onOpenEntity,
  openEntityLabel,
}: Props) {
  return (
    <Dialog open={open && Boolean(src)} onOpenChange={onOpenChange}>
      <DialogContent
        size="large"
        className="flex max-h-[min(92dvh,100%)] flex-col gap-0 overflow-hidden rounded-2xl border-none p-0 shadow-xs sm:max-w-2xl"
      >
        <FormDialogHeader title={title} icon={ImageIcon} />

        {src && (
          <ScrollArea className="min-h-0 flex-1">
            <div className="flex flex-col gap-3 px-4 py-3 pb-5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={alt}
                className="mx-auto max-h-[min(70dvh,36rem)] w-full rounded-xl bg-muted object-contain"
              />
              <div className="flex flex-col gap-2">
                {onOpenEntity && (
                  <button
                    type="button"
                    onClick={e => {
                      e.stopPropagation()
                      onOpenEntity()
                    }}
                    className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-primary/10 px-4 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/15 dark:bg-primary/20 dark:text-primary-foreground"
                  >
                    {openEntityLabel ?? "Ir a la entidad"}
                  </button>
                )}
                <a
                  href={src}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={e => e.stopPropagation()}
                  className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-foreground/5 px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-foreground/10 hover:text-foreground"
                >
                  <ExternalLink size={15} />
                  Abrir original
                </a>
              </div>
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  )
}
