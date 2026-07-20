
import type {
  LucideIcon,
} from "lucide-react"

type Props={

  label:string

  value:string|number

  details?:{
    label:string
    value:string|number
  }[]

  icon:LucideIcon

  color:string
}

export function EntityStatCard({
  label,
  value,
  details,
  icon:Icon,
  color,
}:Props){

  return(

    <div
      className="relative h-27 overflow-hidden rounded-2xl p-5"
      style={{
        background:`linear-gradient(135deg,${color}50,#101012)`,
      }}
    >

      <Icon
        size={26}
        strokeWidth={1.8}
        className="absolute right-4 top-4 opacity-90"
        style={{
          color:color,
        }}
      />

      <div className="flex h-full flex-col justify-between">

        <span
          className="text-xs font-bold uppercase tracking-[0.14em]"
          style={{
            color:color,
          }}
        >

          {label}

        </span>

        <div className="flex min-w-0 items-end gap-3">

          <div className="min-w-0 flex-1">

            <p
              title={String(value)}
              className="truncate text-[30px] font-semibold leading-none"
              style={{
                color:color,
              }}
            >

              {value}

            </p>

          </div>

          {details?.length ? (

            <div className="flex min-w-0 items-center gap-2">

              {details.map((detail,index)=>(

                <div
                  key={`${detail.label}-${index}`}
                  className="flex min-w-0 items-center gap-2"
                >

                  <div className="h-9 w-px shrink-0 bg-white/10" />

                  <div className="min-w-0">

                    <p className="truncate text-xs font-bold uppercase tracking-[0.12em] text-neutral-500">

                      {detail.label}

                    </p>

                    <p
                      title={String(detail.value)}
                      className="truncate text-sm font-semibold"
                      style={{
                        color:color,
                      }}
                    >

                      {detail.value}

                    </p>

                  </div>

                </div>

              ))}

            </div>

          ):null}

        </div>

      </div>

    </div>

  )

}