"use client"

import {
  useState,
} from "react"

import {
  Eye,
  EyeOff,
  KeyRound,
  Users,
} from "lucide-react"

import {
  cn,
} from "@/shared/utils/utils"

import {
  Input,
} from "@/components/ui/input"

import {
  FormField,
} from "@/shared/ui/dialogs/form-dialog/form-field"

import {
  FormSection,
} from "@/shared/ui/dialogs/form-dialog/form-section"

type Props={

  name:string

  username:string

  email:string

  password:string

  confirmPassword:string

  isEditing:boolean

  isChangingPassword:boolean

  onChangingPasswordChange:(
    value:boolean
  )=>void

  onNameChange:(
    value:string
  )=>void

  onUsernameChange:(
    value:string
  )=>void

  onEmailChange:(
    value:string
  )=>void

  onPasswordChange:(
    value:string
  )=>void

  onConfirmPasswordChange:(
    value:string
  )=>void

}

export function UserFormSection({

  name,

  username,

  email,

  password,

  confirmPassword,

  isEditing,

  isChangingPassword,

  onChangingPasswordChange,

  onNameChange,

  onUsernameChange,

  onEmailChange,

  onPasswordChange,

  onConfirmPasswordChange,

}:Props){

  const [
    showPassword,
    setShowPassword,
  ]=useState(false)

  const changingPassword=

    !isEditing ||

    isChangingPassword

  const passwordsMatch=

    password.trim()!=="" &&
    confirmPassword.trim()!=="" &&
    password===confirmPassword

  const passwordTooShort=

    password.length>0 &&
    password.length<8

  return(

    <FormSection
      title="Información principal"
      icon={Users}
    >

      <div className="grid grid-cols-2 gap-4">

        <FormField label="Nombre">

          <Input
            value={name}
            onChange={event=>

              onNameChange(
                event.target.value
              )

            }
          />

        </FormField>

        <FormField label="Usuario">

          <Input
            value={username}
            onChange={event=>

              onUsernameChange(
                event.target.value
              )

            }
          />

        </FormField>

      </div>

      <FormField label="Correo">

        <Input
          type="email"
          value={email}
          onChange={event=>

            onEmailChange(
              event.target.value
            )

          }
        />

      </FormField>

      {isEditing && (

        <button
          type="button"
          onClick={()=>

            onChangingPasswordChange(
              !isChangingPassword
            )

          }
          className="flex w-full items-center justify-between rounded-xl bg-white/2 px-4 py-3 text-left transition-all hover:border-white/20 hover:bg-white/4"
        >

          <div className="flex items-center gap-3">

            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/4">

              <KeyRound
                size={14}
              />

            </div>

            <div>

              <div className="text-sm font-medium text-white">

                Cambiar contraseña

              </div>

              <div className="text-xs text-neutral-500">

                Actualizar credenciales del usuario

              </div>

            </div>

          </div>

          <div className="rounded-full bg-white/3 px-2.5 py-1 text-sm font-medium text-neutral-400">

            {isChangingPassword
              ? "Activo"
              : "Opcional"}

          </div>

        </button>

      )}

      {changingPassword && (

        <div className="space-y-4 rounded-xl bg-white/2 p-4">

          <div className="grid grid-cols-2 gap-4">

            <FormField label="Nueva contraseña">

              <div className="relative">

                <Input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  autoComplete="new-password"
                  value={password}
                  onChange={event=>

                    onPasswordChange(
                      event.target.value
                    )

                  }
                  className="pr-10"
                />

                <button
                  type="button"
                  onClick={()=>

                    setShowPassword(
                      current=>
                        !current
                    )

                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 transition-colors hover:text-neutral-300"
                >

                  {showPassword
                    ? (
                      <EyeOff
                        size={16}
                      />
                    )
                    : (
                      <Eye
                        size={16}
                      />
                    )}

                </button>

              </div>

                <div className="mt-2 h-4 text-xs">

                <span
                    className={cn(

                    "transition-colors",

                    passwordTooShort
                        ? "text-amber-400"
                        : "text-transparent"

                    )}
                >

                    La contraseña debe tener al menos 8 caracteres

                </span>

                </div>

            </FormField>

            <FormField label="Confirmar contraseña">

              <Input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                autoComplete="new-password"
                value={confirmPassword}
                onChange={event=>

                  onConfirmPasswordChange(
                    event.target.value
                  )

                }
              />

                <div className="mt-2 h-4 text-xs">

                <span
                    className={cn(

                    passwordsMatch
                        ? "text-emerald-400"
                        : "text-red-400",

                    confirmPassword.length===0 &&
                        "text-transparent"

                    )}
                >

                    {passwordsMatch
                    ? "Las contraseñas coinciden"
                    : "Las contraseñas no coinciden"}

                </span>

                </div>

            </FormField>

          </div>

        </div>

      )}

    </FormSection>

  )

}