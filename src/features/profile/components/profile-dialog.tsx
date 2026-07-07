"use client"

import { useEffect, useState } from "react"

import { useCloseSidebarPreview } from "@/shared/layouts/hooks/use-close-sidebar-preview"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import { Input } from "@/components/ui/input"

import { AvatarPicker } from "./avatar-picker"

import { useProfile } from "../hooks/use-profile"

type Props = {

  open: boolean

  onClose: () => void

}

export function ProfileDialog({ open, onClose }: Props) {

  useCloseSidebarPreview(
    open,
  )

  const {
    profile,
    loading,
    uploading,
    save,
    upload,
    removePhoto,
  } = useProfile()

  const [name, setName] = useState(profile?.name ?? "")
  const [phone, setPhone] = useState(profile?.phone ?? "")
  const [position, setPosition] = useState(profile?.position ?? "")

  useEffect(() => {

    if (!open) return

    setName(profile?.name ?? "")
    setPhone(profile?.phone ?? "")
    setPosition(profile?.position ?? "")

  }, [open, profile])

  async function handleSave() {

    await save({ name, phone, position })

    onClose()

  }

  return (

    <Dialog open={open} onOpenChange={v => !v && onClose()}>

      <DialogContent>

        <DialogHeader>

          <DialogTitle>
            Editar perfil
          </DialogTitle>

          <DialogDescription className="sr-only">
            Formulario de perfil de usuario
          </DialogDescription>

        </DialogHeader>

        <div className="space-y-5 pt-3">

          <AvatarPicker
            name={profile?.name ?? ""}
            avatarUrl={profile?.avatarUrl}
            uploading={uploading}
            onSelect={upload}
            onRemove={removePhoto}
          />

          <div className="space-y-3">

            <div className="space-y-1.5">

              <label className="text-xs font-medium text-neutral-500">
                Nombre
              </label>

              <Input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Tu nombre"
              />

            </div>

            <div className="space-y-1.5">

              <label className="text-xs font-medium text-neutral-500">
                Correo
              </label>

              <Input
                value={profile?.email ?? ""}
                disabled
                readOnly
              />

            </div>

            <div className="space-y-1.5">

              <label className="text-xs font-medium text-neutral-500">
                Cargo
              </label>

              <Input
                value={position}
                onChange={e => setPosition(e.target.value)}
                placeholder="Ej. Jefe de producción"
              />

            </div>

            <div className="space-y-1.5">

              <label className="text-xs font-medium text-neutral-500">
                Teléfono
              </label>

              <Input
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="Ej. 987654321"
              />

            </div>

          </div>

          <div className="flex justify-end gap-2 pt-2">

            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="h-10 rounded-xl px-5 text-sm font-medium text-neutral-400 transition hover:bg-white/5 hover:text-white disabled:opacity-50"
            >

              Cancelar

            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={loading}
              className="inline-flex h-10 items-center justify-center rounded-xl bg-white px-5 text-sm font-semibold text-black transition hover:bg-neutral-200 disabled:cursor-not-allowed disabled:bg-neutral-300"
            >

              {loading ? "Guardando..." : "Guardar"}

            </button>

          </div>

        </div>

      </DialogContent>

    </Dialog>

  )

}