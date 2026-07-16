"use client"
import { useState } from "react"
import { Loader2, Eye, EyeOff, CheckCircle2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { authService } from "../services/auth.service"
import { useAuthStore } from "../store/auth-store"
import { usePermissionStore } from "@/features/permissions/store/permission-store"

export function LoginForm() {
  const router = useRouter()
  const setUser = useAuthStore(s=>s.setUser)
  const setPermissions = usePermissionStore(s=>s.setPermissions)
  const [loading,setLoading]=useState(false)
  const [email,setEmail]=useState("")
  const [password,setPassword]=useState("")
  const [showPassword,setShowPassword]=useState(false)
  const [success,setSuccess]=useState(false)
  const [error,setError]=useState<string|null>(null)

  const onSubmit=async(e:React.FormEvent<HTMLFormElement>)=>{
    e.preventDefault()
    if(loading)return
    setError(null)
    setLoading(true)
    try{
      const result=await authService.login(email,password)
      setUser(result.user)
      setPermissions(result.permissions)
      setSuccess(true)
      router.replace("/projects")
    }catch(err:any){
      setError(err?.response?.data?.message??"Credenciales incorrectas.")
    }finally{
      setLoading(false)
    }
  }

  const inputClass =
    "h-12 w-full rounded-xl bg-[#111113] px-4 text-base text-white outline-none " +
    "placeholder:text-neutral-600 transition-colors duration-200 " +
    "focus:bg-[#1c1c20] " +
    "disabled:cursor-not-allowed disabled:opacity-60"

  return (
    <form onSubmit={onSubmit} className="space-y-4">

      <div>
        <label className="mb-1.5 block text-sm font-medium text-neutral-300">
          Correo
        </label>
        <input
          value={email}
          disabled={loading}
          onChange={e=>setEmail(e.target.value)}
          placeholder="admin@etmsac.com"
          type="email"
          autoComplete="username"
          className={inputClass}
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-neutral-300">
          Contraseña
        </label>
        <div className="relative">
          <input
            value={password}
            disabled={loading}
            onChange={e=>setPassword(e.target.value)}
            placeholder="Contraseña"
            type={showPassword?"text":"password"}
            autoComplete="current-password"
            className={`${inputClass} pr-12`}
          />
          <button
            type="button"
            disabled={loading}
            onClick={()=>setShowPassword(v=>!v)}
            tabIndex={-1}
            aria-label={showPassword?"Ocultar contraseña":"Mostrar contraseña"}
            className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-neutral-400 transition-colors hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {showPassword?<EyeOff size={17}/>:<Eye size={17}/>}
          </button>
        </div>
      </div>

      <div className="min-h-5">
        {error&&<p className="text-sm font-medium text-red-400">{error}</p>}
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-colors ${
          success
            ? "bg-emerald-500 text-white"
            : "bg-white text-black hover:bg-neutral-200 disabled:cursor-not-allowed disabled:bg-neutral-300"
        }`}
      >
        {success
          ? <><CheckCircle2 size={17}/>Acceso concedido</>
          : loading
            ? <><Loader2 size={17} className="animate-spin"/>Verificando...</>
            : "Entrar"}
      </button>

    </form>
  )
}