"use client"

import { useEffect, useState } from "react"
import { ArrowLeft, ArrowRight, Save } from "lucide-react"

import { isProductionFloorLevel } from "@/shared/core/constants/department-roles"
import { useRoles } from "@/features/roles/hooks/use-roles"
import { useAreas } from "@/features/areas/hooks/use-areas"
import { useUserMutations } from "@/features/users/hooks/use-user-mutations"
import { isLevelAllowedForRoles } from "@/features/users/utils/allowed-levels-for-roles"
import { generateUserDefaultsFromEmail } from "@/features/users/utils/generate-user-defaults-from-email"
import { validateUser } from "../../hooks/validate-user"
import type { User } from "@/features/users/types/user.types"
import type { EntityIcon } from "@/shared/constants/entity-icons"
import {
  UserForm,
  UserFormWizardProgress,
  USER_FORM_STEP_COUNT,
} from "../form/user-form"

type UserFormValue = {
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

const createInitialForm = (user: User): UserFormValue => ({
  username: user.username ?? "",
  name: user.name ?? "",
  email: user.email ?? "",
  password: "",
  confirmPassword: "",
  isChangingPassword: false,
  roleIds: user.roles?.map(role => role.id) ?? [],
  level: user.level ?? null,
  areaIds: user.areas?.map(area => area.id) ?? [],
  icon: user.icon ?? "user",
  color: user.color ?? "#7C3AED",
  active: user.active ?? true,
})

const STEP_ERROR_KEYS = {
  0: ["roleIds"],
  1: ["name", "username", "email", "password", "confirmPassword"],
  2: [],
} as const

export function UserMobileInlineEditor({
  user,
  onClose,
  onSaved,
}: {
  user: User
  onClose: () => void
  onSaved?: (user: User) => void
}) {
  const { roles, loading: loadingRoles } = useRoles(true)
  const { areas } = useAreas(true)
  const { updateUser } = useUserMutations()

  const [form, setForm] = useState<UserFormValue>(() => createInitialForm(user))
  const [step, setStep] = useState(0)
  const [attempted, setAttempted] = useState<Set<number>>(new Set())

  useEffect(() => {
    setForm(createInitialForm(user))
    setStep(0)
    setAttempted(new Set())
  }, [user.id])

  const update = (value: Partial<UserFormValue>) => {
    setForm(current => ({ ...current, ...value }))
  }

  const selectedRoles = roles.filter(role => form.roleIds.includes(role.id))
  const selectedAreas = areas.filter(area => form.areaIds.includes(area.id))

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

  const stepHasErrors = (stepIndex: number) =>
    STEP_ERROR_KEYS[stepIndex as 0 | 1 | 2].some(key => errors[key])

  const visibleErrors = attempted.has(step) ? errors : undefined
  const saving = updateUser.isPending
  const isLastStep = step === USER_FORM_STEP_COUNT - 1

  const handleNext = () => {
    if (stepHasErrors(step)) {
      setAttempted(current => new Set(current).add(step))
      return
    }
    setStep(current => Math.min(current + 1, USER_FORM_STEP_COUNT - 1))
  }

  const handleBack = () => {
    if (step === 0) {
      onClose()
      return
    }
    setStep(current => current - 1)
  }

  const handleSave = async () => {
    if (stepHasErrors(step) || Object.keys(errors).length > 0) {
      setAttempted(new Set([0, 1, 2]))
      return
    }

    const {
      confirmPassword: _confirmPassword,
      isChangingPassword: _isChangingPassword,
      password,
      ...rest
    } = form

    try {
      const updated = await updateUser.mutateAsync({
        id: user.id,
        dto: {
          ...rest,
          ...(password.trim() && { password }),
        },
      })
      if (updated) onSaved?.(updated)
      onClose()
    } catch (error) {
      console.error("USER MOBILE INLINE SAVE ERROR", error)
    }
  }

  return (
    <div className="space-y-3 border-t border-foreground/10 px-3 pb-3 pt-3">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Editar usuario
          </p>
          <p className="truncate text-sm font-medium text-foreground">{user.name}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 rounded-lg px-2 py-1 text-xs text-muted-foreground hover:bg-foreground/10 hover:text-foreground"
        >
          Cerrar
        </button>
      </div>

      <UserFormWizardProgress step={step} />

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
            ...(levelStillValid && (!isProductionFloorLevel(form.level) || !stillProduccion) && { areaIds: [] }),
          })
        }}
        onLevelChange={level => update({
          level,
          ...(!isProductionFloorLevel(level) && { areaIds: [] }),
        })}
        onAreasChange={nextAreas => update({ areaIds: nextAreas.map(area => area.id) })}
        onChangingPasswordChange={isChangingPassword => update({ isChangingPassword })}
        onNameChange={name => update({ name })}
        onUsernameChange={username => update({ username })}
        onEmailChange={email => update({ email })}
        onPasswordChange={password => update({ password })}
        onConfirmPasswordChange={confirmPassword => update({ confirmPassword })}
        onColorChange={color => update({ color })}
      />

      <div className="flex items-center justify-between gap-2 border-t border-foreground/10 pt-3">
        <button
          type="button"
          disabled={saving || loadingRoles}
          onClick={handleBack}
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-foreground/10 hover:text-foreground disabled:opacity-50"
        >
          <ArrowLeft size={14} />
          {step === 0 ? "Cancelar" : "Atrás"}
        </button>

        {isLastStep ? (
          <button
            type="button"
            disabled={saving || loadingRoles}
            onClick={() => void handleSave()}
            className="inline-flex items-center gap-1.5 rounded-lg bg-foreground px-3 py-2 text-xs font-semibold text-background disabled:opacity-50"
          >
            <Save size={14} />
            {saving ? "Guardando..." : "Guardar"}
          </button>
        ) : (
          <button
            type="button"
            disabled={saving || loadingRoles}
            onClick={handleNext}
            className="inline-flex items-center gap-1.5 rounded-lg bg-foreground px-3 py-2 text-xs font-semibold text-background disabled:opacity-50"
          >
            Siguiente
            <ArrowRight size={14} />
          </button>
        )}
      </div>
    </div>
  )
}
