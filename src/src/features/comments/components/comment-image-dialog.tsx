"use client"
import { ExternalLink } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
type Props = {
  imageUrl: string | null
  onClose: () => void
}
// Antes la foto se mostraba directo adentro del mensaje — en un
// panel chico (como "Últimos comentarios") eso rompía el layout
// entero, empujando todo lo demás. Ahora el mensaje solo muestra un
// ícono/indicador de que hay una foto adjunta; recién al tocarlo se
// abre esto, mostrándola a tamaño completo — con un botón aparte
// para ir a la URL directo, en vez de hacerlo de una.
export function CommentImageDialog({
  imageUrl,
  onClose,
}: Props) {
  return (
    <Dialog
      open={!!imageUrl}
      onOpenChange={open => {
        if (!open) onClose()
      }}
    >
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Foto adjunta</DialogTitle>
        </DialogHeader>
        {imageUrl && (
          <div className="flex flex-col gap-3 px-5 pb-5">
            <img
              src={imageUrl}
              alt="Foto adjunta al comentario"
              className="max-h-[70vh] w-full rounded-xl object-contain"
            />
            <a
              href={imageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-xl bg-white/5 px-4 py-2.5 text-sm font-medium text-neutral-300 transition-colors hover:bg-white/10 hover:text-white"
            >
              <ExternalLink size={15} />
              Abrir en una pestaña nueva
            </a>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}