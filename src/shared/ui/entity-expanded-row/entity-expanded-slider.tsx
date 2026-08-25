"use client"

type Panel<T extends string> = {
  value: T
  content: React.ReactNode
}

type Props<T extends string> = {
  value: T
  panels: Panel<T>[]
}

/**
 * Solo monta el panel activo (workflow / KPIs / …).
 *
 * Sin animar height ni ResizeObserver: al cambiar de pestaña el
 * contenido aparece en un paso (misma filosofía que CollapsibleHeightSection).
 * Los paneles inactivos no montan → no disparan useComments / KPI heavy.
 */
export function EntityExpandedSlider<T extends string>({
  value,
  panels,
}: Props<T>) {
  const active = panels.find(p => p.value === value) ?? panels[0]

  return (
    <div className="min-w-0 w-full">
      {active?.content ?? null}
    </div>
  )
}
