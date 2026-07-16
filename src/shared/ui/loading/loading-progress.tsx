"use client"

type Props = {
  progress: number
}

export function LoadingProgress({ progress }: Props) {
  return (
    // Contenedor base de la pista (transparente)
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
      {/* 
        La barra interna se colorea desde el padre mediante 
        el selector [&>div]:bg-[#FCD34D] en AppLoadingScreen
      */}
      <div 
        className="h-full transition-all duration-300 ease-out" 
        style={{ width: `${progress}%` }} 
      />
    </div>
  )
}