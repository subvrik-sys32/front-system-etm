"use client"

import { useState } from "react"
import { Eye, EyeOff, CheckCircle2 } from "lucide-react"
import { Spinner } from "@/shared/ui/spinner/spinner"
import { useRouter } from "next/navigation"
import { authService } from "../services/auth.service"
import { useAuthStore } from "../store/auth-store"
import { usePermissionStore } from "@/features/permissions/store/permission-store"

const SHORT = "[@media(max-height:520px)]"
const CORPORATE_DOMAIN = "@etmperu.com"

// Debe ser >= a la duración de la transición "assembling" del motor de
// partículas (transition.duration en hoverConfig, por defecto 0.9s en
// ProductionVisual). Se le suma un pequeño margen para que el logo se
// alcance a ver ya completamente formado, quieto, antes de navegar.
const ASSEMBLE_ANIMATION_MS = 1500

// Teclas que no deberían "romper" las partículas (no cambian el contenido
// del input, solo navegan/modifican el foco o el estado del teclado).
const IGNORED_KEYS = new Set([
  "Shift", "Control", "Alt", "Meta", "CapsLock", "Tab",
  "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown",
  "Escape", "Home", "End", "PageUp", "PageDown",
])

type LoginFormProps = {
  /** Se llama en cada tecla presionada dentro de los inputs del form. */
  onFieldActivity?: () => void
  /** Se llama justo cuando el login fue exitoso (antes de redirigir). */
  onLoginSuccess?: () => void
}

export function LoginForm({ onFieldActivity, onLoginSuccess }: LoginFormProps = {}) {
  const router = useRouter()
  const setUser = useAuthStore(s => s.setUser)
  const setPermissions = usePermissionStore(s => s.setPermissions)

  const [loading, setLoading] = useState(false)
  const [usernamePrefix, setUsernamePrefix] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const toggleShowPassword = () => {
    setShowPassword(prev => !prev)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (IGNORED_KEYS.has(e.key)) return
    onFieldActivity?.()
  }

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (loading) return

    setError(null)
    setLoading(true)

    const fullEmail = `${usernamePrefix.trim()}${CORPORATE_DOMAIN}`

    try {
      const result = await authService.login(fullEmail, password)
      setUser(result.user)
      setPermissions(result.permissions)
      setSuccess(true)
      // Dispara el ensamblaje del logo antes de navegar. Se espera el
      // tiempo completo de la animación (ver ASSEMBLE_ANIMATION_MS) para
      // que el logo termine de formarse y se vea quieto un instante antes
      // de redirigir — si se navega antes, la transición se corta a medias.
      onLoginSuccess?.()
      await new Promise(resolve => setTimeout(resolve, ASSEMBLE_ANIMATION_MS))
      router.replace("/projects")
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Credenciales incorrectas.")
      setPassword("")
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    `h-11 ${SHORT}:h-10 w-full rounded-xl bg-muted px-4 text-base text-foreground outline-none ` +
    "placeholder:text-muted-foreground transition-colors duration-200 " +
    "focus:bg-background focus:ring-2 focus:ring-ring/30 " +
    "disabled:cursor-not-allowed disabled:opacity-60"

  return (
    <form onSubmit={onSubmit} autoComplete="off" className={`space-y-3 ${SHORT}:space-y-2`}>
      <div>
        <label
          htmlFor="login_email_prefix"
          className={`mb-1.5 block text-sm font-medium text-muted-foreground ${SHORT}:mb-1 ${SHORT}:text-xs`}
        >
          Correo corporativo
        </label>

        <div className="relative flex items-center">
          <input
            id="login_email_prefix"
            name="corporate_username_prefix"
            value={usernamePrefix}
            disabled={loading}
            onChange={e => {
              const cleanValue = e.target.value.split("@")[0]
              setUsernamePrefix(cleanValue)
            }}
            onKeyDown={handleKeyDown}
            placeholder="usuario"
            type="text"
            autoComplete="off"
            className={`${inputClass} pr-32`}
          />

          <span className="pointer-events-none absolute right-4 text-sm font-medium text-muted-foreground select-none">
            {CORPORATE_DOMAIN}
          </span>
        </div>
      </div>

      <div>
        <label
          htmlFor="login_password"
          className={`mb-1.5 block text-sm font-medium text-muted-foreground ${SHORT}:mb-1 ${SHORT}:text-xs`}
        >
          Contraseña
        </label>
        <div className="relative flex items-center">
          <input
            id="login_password"
            name="corporate_user_password"
            value={password}
            disabled={loading}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Contraseña"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            className={`${inputClass} pr-12`}
          />
          <button
            type="button"
            disabled={loading}
            onClick={toggleShowPassword}
            onMouseDown={e => e.preventDefault()}
            tabIndex={-1}
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground outline-none transition-colors hover:bg-foreground/10 hover:text-foreground focus:outline-none focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60"
          >
            {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        </div>
      </div>

      <div className={`min-h-5 ${SHORT}:min-h-0`}>
        {error && <p className="text-sm font-medium text-red-400">{error}</p>}
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`flex h-11 ${SHORT}:h-10 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-colors bg-brand text-brand-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50`}
      >
        {success ? (
          <>
            <CheckCircle2 size={17} />
            Acceso concedido
          </>
        ) : loading ? (
          <Spinner size={17} />
        ) : (
          "Entrar"
        )}
      </button>
    </form>
  )
}