"use client"

type Props = {

  section: string

  title: string

  metric?: string | number

  metricLabel?: string

}

export function EntityExpandedHeader({

  section,

  title,

  metric,

  metricLabel,

}: Props) {

  return (

    <div className="mb-4 flex items-start justify-between select-none">

      <div>

        <p className="text-xs font-semibold tracking-[0.20em] text-neutral-500">

          {section}

        </p>

        <h3 className="mt-1 text-base font-semibold text-neutral-200">

          {title}

        </h3>

      </div>

      {metric !== undefined && (

        <div className="text-right">

          <p className="text-2xl font-semibold text-neutral-100">

            {metric}

          </p>

          <p className="text-xs text-neutral-500">

            {metricLabel}

          </p>

        </div>

      )}

    </div>

  )

}