"use client"

import React, { useCallback, useMemo, useRef, useState } from "react"
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
  useMotionTemplate,
} from "framer-motion"

/**
 * ProductionVisual — versión interactiva
 *
 * Metáfora: estás inspeccionando una placa con una lámpara. El cursor
 * ilumina las pistas cercanas (una capa "iluminada" recortada con una
 * máscara radial que sigue al mouse). La placa se inclina levemente hacia
 * donde miras. Al hacer clic en un pad, se envía un pulso de prueba real
 * que viaja por esa pista hasta el chip y lo hace "responder" (anillo de
 * confirmación). Al hacer clic en el chip, se dispara un barrido de
 * encendido: un pulso sale por las 9 pistas a la vez y cada pad parpadea
 * al recibirlo — como un power-on self-test.
 *
 * Requiere `framer-motion` instalado en el proyecto.
 */

const CENTER: [number, number] = [200, 200]

type Trace = {
  id: number
  color: "accent" | "primary" | "ground"
  points: [number, number][]
  component?: "resistor" | "capacitor"
}

const TRACES: Trace[] = [
  { id: 0, color: "accent", points: [[182, 168], [182, 130], [162, 110], [90, 110]] },
  { id: 1, color: "accent", points: [[200, 168], [200, 60]] }, // línea de datos principal
  { id: 2, color: "accent", points: [[218, 168], [218, 130], [238, 110], [310, 110]] },
  { id: 3, color: "primary", points: [[168, 182], [140, 182], [120, 162], [120, 96]], component: "resistor" },
  { id: 4, color: "primary", points: [[168, 218], [140, 218], [120, 238], [120, 290]] },
  { id: 5, color: "primary", points: [[232, 182], [270, 182], [290, 162], [290, 104]], component: "capacitor" },
  { id: 6, color: "primary", points: [[232, 218], [270, 218], [290, 238], [290, 290]] },
  { id: 7, color: "accent", points: [[182, 232], [182, 270], [162, 290], [100, 290]] },
  { id: 8, color: "accent", points: [[218, 232], [218, 270], [238, 290], [300, 290]] },
  { id: 9, color: "ground", points: [[200, 232], [200, 340]] },
]

const COLOR_CLASS: Record<Trace["color"], string> = {
  accent: "stroke-accent/60",
  primary: "stroke-primary/70",
  ground: "stroke-muted-foreground/50",
}
const PAD_CLASS: Record<Trace["color"], string> = {
  accent: "fill-accent/80",
  primary: "fill-primary/80",
  ground: "fill-muted-foreground/60",
}

function pathD(points: [number, number][]) {
  return points.map((p, i) => `${i === 0 ? "M" : "L"} ${p[0]} ${p[1]}`).join(" ")
}

function segmentTimes(points: [number, number][]) {
  const lens: number[] = [0]
  let total = 0
  for (let i = 1; i < points.length; i++) {
    const [x0, y0] = points[i - 1]
    const [x1, y1] = points[i]
    total += Math.hypot(x1 - x0, y1 - y0)
    lens.push(total)
  }
  return lens.map((l) => (total === 0 ? 0 : l / total))
}

type Pulse = {
  key: number
  points: [number, number][]
  times: number[]
  duration: number
  colorClass: string
  direction: "toChip" | "toPad"
  traceId: number
}

export function ProductionVisual() {
  const containerRef = useRef<HTMLDivElement>(null)
  const idRef = useRef(0)

  const [pulses, setPulses] = useState<Pulse[]>([])
  const [chipFlashes, setChipFlashes] = useState<number[]>([])
  const [padFlashes, setPadFlashes] = useState<number[]>([])

  // --- Seguimiento del mouse: luz de inspección + inclinación sutil ---
  const mx = useMotionValue(200)
  const my = useMotionValue(200)
  const tiltRawX = useMotionValue(0) // -1..1
  const tiltRawY = useMotionValue(0)

  const springX = useSpring(mx, { stiffness: 120, damping: 18 })
  const springY = useSpring(my, { stiffness: 120, damping: 18 })
  const tiltX = useSpring(tiltRawX, { stiffness: 100, damping: 16 })
  const tiltY = useSpring(tiltRawY, { stiffness: 100, damping: 16 })

  const rotateX = useTransform(tiltY, [-1, 1], [7, -7])
  const rotateY = useTransform(tiltX, [-1, 1], [-7, 7])

  const mxPx = useTransform(springX, (v) => `${v}px`)
  const myPx = useTransform(springY, (v) => `${v}px`)
  const spotlightMask = useMotionTemplate`radial-gradient(140px at ${mxPx} ${myPx}, black, transparent)`

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = containerRef.current?.getBoundingClientRect()
      if (!rect) return
      const relX = ((e.clientX - rect.left) / rect.width) * 400
      const relY = ((e.clientY - rect.top) / rect.height) * 400
      mx.set(relX)
      my.set(relY)
      tiltRawX.set(((e.clientX - rect.left) / rect.width) * 2 - 1)
      tiltRawY.set(((e.clientY - rect.top) / rect.height) * 2 - 1)
    },
    [mx, my, tiltRawX, tiltRawY]
  )

  const handleMouseLeave = useCallback(() => {
    tiltRawX.set(0)
    tiltRawY.set(0)
  }, [tiltRawX, tiltRawY])

  const tracesById = useMemo(() => Object.fromEntries(TRACES.map((t) => [t.id, t])), [])

  const firePulse = useCallback(
    (traceId: number, direction: "toChip" | "toPad") => {
      const trace = tracesById[traceId]
      if (!trace) return
      const raw =
        direction === "toChip"
          ? [...trace.points].reverse().concat([CENTER])
          : [CENTER, ...trace.points]
      const times = segmentTimes(raw)
      const key = idRef.current++
      const pulse: Pulse = {
        key,
        points: raw,
        times,
        duration: 0.22 * (raw.length - 1) + 0.35,
        colorClass:
          trace.color === "accent" ? "fill-accent" : trace.color === "primary" ? "fill-primary" : "fill-muted-foreground",
        direction,
        traceId,
      }
      setPulses((p) => [...p, pulse])
    },
    [tracesById]
  )

  const handlePadClick = (traceId: number) => firePulse(traceId, "toChip")

  const handleChipClick = () => {
    TRACES.forEach((t) => firePulse(t.id, "toPad"))
  }

  const onPulseArrive = (pulse: Pulse) => {
    setPulses((p) => p.filter((x) => x.key !== pulse.key))
    if (pulse.direction === "toChip") {
      const fk = idRef.current++
      setChipFlashes((f) => [...f, fk])
      setTimeout(() => setChipFlashes((f) => f.filter((x) => x !== fk)), 700)
    } else {
      setPadFlashes((f) => [...f, pulse.traceId])
      setTimeout(() => setPadFlashes((f) => f.filter((x) => x !== pulse.traceId)), 700)
    }
  }

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative size-full overflow-hidden select-none circuit-root"
      style={{ perspective: 900 }}
    >
      <style>{`
        @keyframes circuit-flow { to { stroke-dashoffset: -48; } }
        @keyframes circuit-flow-rev { to { stroke-dashoffset: 48; } }
        .circuit-signal { animation: circuit-flow linear infinite; }
        .circuit-signal-rev { animation: circuit-flow-rev linear infinite; }
        @media (prefers-reduced-motion: reduce) {
          .circuit-signal, .circuit-signal-rev { animation: none !important; }
        }
      `}</style>

      {/* Sustrato: trama de puntos, silkscreen de la placa */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.14]"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(148,163,184,0.9) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      />

      {/* Placa: se inclina levemente hacia el cursor */}
      <motion.div
        className="absolute inset-0"
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      >
        {/* Resplandor ambiental */}
        <div
          aria-hidden="true"
          className="absolute left-1/2 top-1/2 size-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(37,99,235,0.16)_0%,rgba(242,185,0,0.08)_50%,transparent_75%)] blur-3xl"
        />

        {/* Capa base: circuito tenue */}
        <svg aria-hidden="true" viewBox="0 0 400 400" className="absolute inset-0 size-full opacity-40">
          {TRACES.map((t) => (
            <path key={t.id} d={pathD(t.points)} className={`${COLOR_CLASS[t.color]} fill-none`} strokeWidth={t.color === "ground" ? 3.5 : 2} strokeLinecap="round" />
          ))}
        </svg>

        {/* Capa iluminada: recortada por una máscara que sigue al mouse — el efecto "lámpara" */}
        <motion.div className="absolute inset-0" style={{ WebkitMaskImage: spotlightMask as any, maskImage: spotlightMask as any }}>
          <svg viewBox="0 0 400 400" className="absolute inset-0 size-full">
            {TRACES.map((t) => (
              <path
                key={t.id}
                d={pathD(t.points)}
                className={`${COLOR_CLASS[t.color]} fill-none ${
                  t.color !== "ground" ? "circuit-signal" : ""
                }`}
                strokeWidth={t.color === "ground" ? 3.5 : 2.4}
                strokeLinecap="round"
                strokeDasharray={t.color === "ground" ? undefined : "5 11"}
                style={t.color !== "ground" ? { animationDuration: `${1.7 + (t.id % 5) * 0.3}s` } : undefined}
              />
            ))}
            {/* resistencia */}
            <path d="M 120 138 L 120 130 L 114 126 L 126 120 L 114 114 L 126 108 L 120 104 L 120 96" className="stroke-primary fill-none" strokeWidth="2" strokeLinecap="round" />
            {/* capacitor */}
            <line x1="282" y1="128" x2="298" y2="128" className="stroke-primary" strokeWidth="2.5" />
            <line x1="282" y1="120" x2="298" y2="120" className="stroke-primary" strokeWidth="2.5" />
          </svg>
        </motion.div>

        {/* Pads interactivos + destello de recepción */}
        <svg viewBox="0 0 400 400" className="absolute inset-0 size-full overflow-visible">
          {TRACES.map((t) => {
            const [px, py] = t.points[t.points.length - 1]
            const flashed = padFlashes.includes(t.id)
            return (
              <g key={t.id}>
                <circle
                  cx={px}
                  cy={py}
                  r={10}
                  fill="transparent"
                  className="cursor-pointer"
                  role="button"
                  tabIndex={0}
                  aria-label="Enviar señal de prueba al chip"
                  onClick={() => handlePadClick(t.id)}
                  onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handlePadClick(t.id)}
                />
                <motion.circle
                  cx={px}
                  cy={py}
                  r={3.4}
                  className={PAD_CLASS[t.color]}
                  animate={flashed ? { scale: [1, 1.9, 1], opacity: [1, 1, 1] } : { scale: 1 }}
                  transition={{ duration: 0.7 }}
                  style={{ transformOrigin: `${px}px ${py}px`, pointerEvents: "none" }}
                />
              </g>
            )
          })}
        </svg>

        {/* Pulsos viajando por las pistas */}
        <svg viewBox="0 0 400 400" className="absolute inset-0 size-full pointer-events-none">
          <AnimatePresence>
            {pulses.map((p) => (
              <motion.circle
                key={p.key}
                r={4}
                className={p.colorClass}
                style={{ filter: "drop-shadow(0 0 4px currentColor)" }}
                initial={{ cx: p.points[0][0], cy: p.points[0][1], opacity: 0 }}
                animate={{
                  cx: p.points.map((pt) => pt[0]),
                  cy: p.points.map((pt) => pt[1]),
                  opacity: [0, 1, 1, 1],
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: p.duration, times: p.times, ease: "linear" }}
                onAnimationComplete={() => onPulseArrive(p)}
              />
            ))}
          </AnimatePresence>
        </svg>

        {/* Chip central: clic dispara un barrido a las 9 pistas */}
        <div
          role="button"
          tabIndex={0}
          aria-label="Ejecutar barrido de encendido"
          onClick={handleChipClick}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handleChipClick()}
          className="group absolute left-1/2 top-1/2 flex size-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-lg border-2 border-primary/50 bg-card/95 backdrop-blur-md transition-transform duration-300 hover:scale-105 hover:border-accent/60 cursor-pointer"
          style={{ transform: "translateZ(20px)" }}
        >
          <span className="absolute -top-1 left-[30%] h-1.5 w-1 bg-primary/40" />
          <span className="absolute -top-1 left-1/2 h-1.5 w-1 -translate-x-1/2 bg-accent/70" />
          <span className="absolute -top-1 left-[70%] h-1.5 w-1 bg-primary/40" />
          <span className="absolute -bottom-1 left-1/2 h-1.5 w-1 -translate-x-1/2 bg-muted-foreground/50" />
          <span className="absolute -left-1 top-[35%] h-1 w-1.5 bg-primary/40" />
          <span className="absolute -left-1 top-[65%] h-1 w-1.5 bg-primary/40" />
          <span className="absolute -right-1 top-[35%] h-1 w-1.5 bg-primary/40" />
          <span className="absolute -right-1 top-[65%] h-1 w-1.5 bg-primary/40" />

          <div className="size-3 rounded-sm bg-accent shadow-[0_0_14px_rgba(242,185,0,0.85)] transition-transform group-hover:scale-110" />

          {/* anillo de confirmación cuando un pulso llega al chip */}
          <AnimatePresence>
            {chipFlashes.map((fk) => (
              <motion.span
                key={fk}
                className="absolute inset-0 rounded-lg border-2 border-accent"
                initial={{ scale: 1, opacity: 0.9 }}
                animate={{ scale: 2.1, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.65, ease: "easeOut" }}
              />
            ))}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}