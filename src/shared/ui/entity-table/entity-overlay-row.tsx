"use client"

type Props={
  templateColumns:string
  children:React.ReactNode
}

export function EntityOverlayRow({
  templateColumns,
  children,
}:Props){

  return(

    <div
      style={{
        gridTemplateColumns:templateColumns,
      }}
      className="grid min-w-0 items-center overflow-hidden rounded-xl border border-white/10 bg-[#15161A] shadow-[0_20px_60px_rgba(0,0,0,0.55)]"
    >

      {children}

    </div>

  )

}