"use client"

import React from "react"

export function ProductionVisual() {
  const origin = "absolute left-[57%] top-[53%] -translate-x-1/2 -translate-y-1/2"
  const nodeBase = "rounded-full absolute transition-all duration-300 ease-out cursor-pointer"

  return (
    <div className="relative size-full overflow-hidden select-none">
      {/* =====================================================
          FONDOS Y RESPLANDORES (AZUL Y AMARILLO VIBRANTE)
      ===================================================== */}
      <div 
        aria-hidden="true" 
        className={`${origin} size-[380px] rounded-full bg-[radial-gradient(circle,rgba(37,99,235,0.18)_0%,rgba(242,185,0,0.09)_45%,transparent_75%)] blur-3xl`} 
      />

      <div 
        aria-hidden="true" 
        className={`${origin} size-[260px] rounded-full border border-accent/30 transition-all shadow-[0_0_35px_rgba(242,185,0,0.08)]`} 
      />

      {/* =====================================================
          ÓRBITAS DINÁMICAS (CON ROTACIÓN FLUIDA)
      ===================================================== */}
      
      {/* Órbita AMARILLA PRINCIPAL */}
      <div 
        aria-hidden="true" 
        className={`${origin} h-[270px] w-[140px] rotate-[-34deg] rounded-[50%] border-2 border-accent/75 shadow-[0_0_25px_rgba(242,185,0,0.3)] animate-[spin_25s_linear_infinite]`}
      >
        <div className={`${nodeBase} -top-1.5 left-1/2 -translate-x-1/2 size-3.5 bg-accent border border-white/50 shadow-[0_0_15px_rgba(242,185,0,0.8)]`} />
      </div>

      {/* Órbita AZUL */}
      <div 
        aria-hidden="true" 
        className={`${origin} h-[140px] w-[270px] rotate-[-24deg] rounded-[50%] border-2 border-primary/60 shadow-[0_0_20px_rgba(37,99,235,0.2)] animate-[spin_35s_linear_infinite_reverse]`}
      >
        <div className={`${nodeBase} -right-1.5 top-1/2 -translate-y-1/2 size-3 bg-primary shadow-[0_0_15px_rgba(37,99,235,0.8)]`} />
      </div>

      {/* Segunda órbita amarilla secundaria */}
      <div 
        aria-hidden="true" 
        className={`${origin} h-[210px] w-[100px] rotate-[52deg] rounded-[50%] border border-accent/40 shadow-[0_0_15px_rgba(242,185,0,0.15)]`} 
      />

      {/* Órbita técnica neutra punteada */}
      <div 
        aria-hidden="true" 
        className={`${origin} h-[240px] w-[115px] rotate-[18deg] rounded-[50%] border border-dotted border-muted-foreground/30 animate-[spin_20s_linear_infinite]`} 
      />

      {/* =====================================================
          LÍNEAS TÉCNICAS DE EJE
      ===================================================== */}
      <div 
        aria-hidden="true" 
        className={`${origin} h-[300px] w-px bg-linear-to-b from-transparent via-accent/30 to-transparent`} 
      />
      <div 
        aria-hidden="true" 
        className={`${origin} h-px w-[300px] bg-linear-to-r from-transparent via-primary/30 to-transparent`} 
      />

      {/* =====================================================
          NÚCLEO CENTRAL
      ===================================================== */}
      <div className={`${origin} group flex size-20 items-center justify-center rounded-full border-2 border-primary/50 bg-card/90 shadow-[0_0_50px_rgba(37,99,235,0.25)] backdrop-blur-md transition-transform duration-500 hover:scale-110 hover:border-accent/60 cursor-pointer`}>
        <div className="absolute inset-2 rounded-full border-2 border-dashed border-accent/40 animate-pulse" />
        
        {/* Núcleo Central Amarillo */}
        <div className="size-4.5 rounded-full bg-accent shadow-[0_0_22px_rgba(242,185,0,0.95)] group-hover:scale-110 transition-transform" />
        
        {/* Satélite Azul interno */}
        <div className="absolute size-2.5 rounded-full bg-primary shadow-[0_0_16px_rgba(37,99,235,0.9)] translate-x-2.5 -translate-y-2.5 group-hover:translate-x-3.5 group-hover:-translate-y-3.5 transition-transform" />
      </div>

      {/* =====================================================
          NODOS AZULES Y AMARILLOS
      ===================================================== */}
      <div className="absolute left-[78%] top-[36%] group cursor-pointer">
        <div className="absolute inset-0 size-3 rounded-full bg-primary animate-ping opacity-75" />
        <div className="size-3 rounded-full border border-primary bg-primary/90 shadow-[0_0_16px_rgba(37,99,235,0.8)] group-hover:scale-125 transition-transform" />
      </div>

      <div className="absolute left-[32%] top-[68%] size-2.5 rounded-full bg-primary/80 shadow-[0_0_12px_rgba(37,99,235,0.6)] hover:scale-125 transition-transform cursor-pointer" />

      <div className="absolute left-[68%] top-[72%] group cursor-pointer">
        <div className="absolute inset-0 size-3.5 rounded-full bg-accent animate-ping opacity-60" style={{ animationDuration: '2.5s' }} />
        <div className="size-3.5 rounded-full border-2 border-white/70 bg-accent shadow-[0_0_22px_rgba(242,185,0,0.95)] group-hover:scale-125 transition-transform" />
      </div>

      <div className="absolute left-[44%] top-[28%] size-3 rounded-full bg-accent shadow-[0_0_18px_rgba(242,185,0,0.85)] hover:scale-125 transition-transform cursor-pointer" />
      <div className="absolute left-[58%] top-[58%] size-2.5 rounded-full bg-accent/90 shadow-[0_0_14px_rgba(242,185,0,0.8)] hover:scale-125 transition-transform cursor-pointer" />
      <div className="absolute left-[28%] top-[50%] size-2 rounded-full bg-accent/80 shadow-[0_0_12px_rgba(242,185,0,0.7)] hover:scale-125 transition-transform cursor-pointer" />

      <div className="absolute left-[42%] top-[35%] size-2 rounded-full bg-muted-foreground/60 shadow-sm" />
    </div>
  )
}