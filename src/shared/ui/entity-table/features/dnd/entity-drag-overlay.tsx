"use client"

type Props={
  children:React.ReactNode
}

export function EntityDragOverlay({
  children,
}:Props){

  return(

    <div className="pointer-events-none scale-[1.01] rounded-xl border border-white/10 bg-[#0F1015] shadow-[0_20px_60px_rgba(0,0,0,0.55)]">

      {children}

    </div>

  )

}