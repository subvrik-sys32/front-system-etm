import {
  cn,
} from "@/shared/utils/utils"

type Props={
  disabled:boolean
  onClick:()=>void
  className?:string
}

export function EntitySaveButton({
  disabled,
  onClick,
  className,
}:Props){

  return(

    <button
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "rounded-xl px-7 py-3 text-sm font-semibold transition",
        !disabled
          ? "bg-white text-black hover:bg-neutral-200"
          : "cursor-not-allowed bg-white/10 text-neutral-600",
        className
      )}
    >

      Guardar cambios

    </button>

  )

}