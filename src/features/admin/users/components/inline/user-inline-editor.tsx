 "use client"

import { useEffect, useMemo, useState } from "react"
import { Save, X } from "lucide-react"

import type { EntityIcon } from "@/shared/constants/entity-icons"
import type { User } from "@/features/users/types/user.types"
import type { Role } from "@/features/roles/types/role.types"
import type { Area } from "@/features/areas/types/area.types"

import { useUserMutations } from "@/features/users/hooks/use-user-mutations"
import { useRoles } from "@/features/roles/hooks/use-roles"
import { useAreas } from "@/features/areas/hooks/use-areas"
import { validateUser, type UserErrors } from "@/features/admin/users/hooks/validate-user"
import { isProductionFloorLevel } from "@/shared/core/constants/department-roles"
import { isLevelAllowedForRoles } from "@/features/users/utils/allowed-levels-for-roles"

import {
  UserForm,
  UserFormWizardProgress,
  USER_FORM_STEP_COUNT,
} from "../form/user-form"
import { PrimaryAction } from "@/shared/ui/actions/primary-action"

type Props = {
  user: User
  onCancel: () => void
  onSaved?: (user: User) => void
}

type FormValue = {
  username: string
  name: string
  email: string
  password: string
  confirmPassword: string
  isChangingPassword: boolean
  roleIds: string[]
  level: "GENERAL" | "OPERARIO" | "SUPERVISOR" | "TERCERO" | null
  areaIds: string[]
  icon: EntityIcon
  color: string
  active: boolean
}

const initialForm = (user: User): FormValue => ({
  username: user.username ?? "",
  name: user.name,
  email: user.email,
  password: "",
  confirmPassword: "",
  isChangingPassword: false,
  roleIds: user.roles?.map(role => role.id) ?? [],
  level: user.level ?? null,
  areaIds: user.areas?.map(area => area.id) ?? [],
  icon: user.icon,
  color: user.color,
  active: user.active,
})

const STEP_ERROR_KEYS: Record<number, (keyof UserErrors)[]> = {
  0: ["roleIds"],
  1: ["name", "username", "email", "password", "confirmPassword"],
  2: [],
}

export function UserInlineEditor({ user, onCancel, onSaved }: Props) {
  const { roles, loading: loadingRoles } = useRoles(true)
  const { areas } = useAreas(true)
  const { updateUser } = useUserMutations()

  const [form, setForm] = useState<FormValue>(() => initialForm(user))
  const [step, setStep] = useState(0)
  const [attempted, setAttempted] = useState(false)
  const [stepAttempted, setStepAttempted] = useState<Set<number>>(new Set())

  useEffect(() => {
    setForm(initialForm(user))
    setStep(0)
    setAttempted(false)
    setStepAttempted(new Set())
  }, [user.id])

  const selectedRoles = useMemo(
    () => roles.filter(role => form.roleIds.includes(role.id)),
    [roles, form.roleIds],
  )

  const selectedAreas = useMemo(
    () => areas.filter(area => form.areaIds.includes(area.id)),
    [areas, form.areaIds],
  )

  const errors = validateUser({
    name: form.name,
    username: form.username,
    email: form.email,
    password: form.password,
    confirmPassword: form.confirmPassword,
    roleIds: form.roleIds,
    isEditing: true,
    isChangingPassword: form.isChangingPassword,
  })

  const isValid = Object.keys(errors).length === 0
  const saving = updateUser.isPending
  const isLastStep = step === USER_FORM_STEP_COUNT - 1

  function update(next: Partial<FormValue>) {
    setForm(current => ({ ...current, ...next }))
  }

  function stepHasErrors(index: number) {
    return STEP_ERROR_KEYS[index].some(key => errors[key])
  }

  function nextStep() {
    if (stepHasErrors(step)) {
      setStepAttempted(current => new Set(current).add(step))
      return
    }
    setStep(current => Math.min(USER_FORM_STEP_COUNT - 1, current + 1))
  }

  function backStep() {
    if (step === 0) onCancel()
    else setStep(current => current - 1)
  }

  async function save() {
    if (!isValid) {
      setAttempted(true)
      return
    }

    const {
      confirmPassword: _confirmPassword,
      isChangingPassword: _isChangingPassword,
      password,
      ...rest
    } = form

    const saved = await updateUser.mutateAsync({
      id: user.id,
      dto: {
        ...rest,
        ...(password.trim() ? { password } : {}),
      },
    })

    if (saved) onSaved?.(saved)
  }

  const visibleErrors = stepAttempted.has(step) || attempted ? errors : undefined

  return (
    <div className="flex min-h-0 flex-col">
      <div className="mb-4 flex shrink-0 items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Editar perfil
          </p>
          <p className="mt-1 truncate text-sm font-medium text-foreground">
            {user.name}
          </p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="flex size-8 shrink-0 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-foreground/10 hover:text-foreground"
          aria-label="Cancelar edición"
        >
          <X size={16} />
        </button>
      </div>

      <div className="mb-4 rounded-xl bg-foreground/5 p-1 md:hidden">
        <UserFormWizardProgress step={step} />
      </div>

      <div className="min-h-0">
        <UserForm
          name={form.name}
          username={form.username}
          email={form.email}
          password={form.password}
          confirmPassword={form.confirmPassword}
          isEditing
          isChangingPassword={form.isChangingPassword}
          icon={form.icon}
          color={form.color}
          roles={roles}
          selectedRoles={selectedRoles}
          level={form.level}
          areas={selectedAreas}
          errors={visibleErrors}
          step={step}
          onRolesChange={nextRoles => {
            const levelStillValid = isLevelAllowedForRoles(form.level, nextRoles)
            const stillProduccion = nextRoles.some(role => role.code === "PRODUCCION")

            update({
              roleIds: nextRoles.map(role => role.id),
              ...(!levelStillValid && { level: null, areaIds: [] }),
              ...(levelStillValid &&
                (!isProductionFloorLevel(form.level) || !stillProduccion) && {
                  areaIds: [],
                }),
            })
          }}
          onLevelChange={level =>
            update({
              level,
              ...(!isProductionFloorLevel(level) && { areaIds: [] }),
            })
          }
          onAreasChange={nextAreas =>
            update({ areaIds: nextAreas.map(area => area.id) })
          }
          onChangingPasswordChange={isChangingPassword =>
            update({ isChangingPassword })
          }
          onNameChange={name => update({ name })}
          onUsernameChange={username => update({ username })}
          onEmailChange={email => update({ email })}
          onPasswordChange={password => update({ password })}
          onConfirmPasswordChange={confirmPassword => update({ confirmPassword })}
          onColorChange={color => update({ color })}
        />
      </div>

      <div className="mt-6 flex shrink-0 justify-end gap-2 border-t border-border/60 pt-4">
        <button
          type="button"
          onClick={backStep}
          disabled={saving}
          className="h-9 rounded-lg bg-foreground/5 px-3 text-xs font-semibold text-muted-foreground transition-colors hover:bg-foreground/10 hover:text-foreground disabled:opacity-50 md:hidden"
        >
          {step > 0 ? "Atrás" : "Cancelar"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="hidden h-9 rounded-lg bg-foreground/5 px-3 text-xs font-semibold text-muted-foreground transition-colors hover:bg-foreground/10 hover:text-foreground disabled:opacity-50 md:block"
        >
          Cancelar
        </button>
        <PrimaryAction
          label={!isLastStep ? "Siguiente" : "Guardar"}
          icon={!isLastStep ? undefined : Save}
          isLoading={saving || loadingRoles}
          onClick={!isLastStep ? nextStep : save}
          disabled={loadingRoles || saving || (!isLastStep ? stepHasErrors(step) : !isValid)}
        />
      </div>
    </div>
  )
}
