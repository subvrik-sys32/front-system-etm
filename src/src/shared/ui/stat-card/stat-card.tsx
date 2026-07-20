import type {
  LucideIcon,
} from "lucide-react"

type StatCardProps={

  label:string

  value:number|string

  icon:LucideIcon

  color:string

}

export function StatCard({
  label,
  value,
  icon:Icon,
  color,
}:StatCardProps){

  return(

    <div
      className="relative h-30 overflow-hidden rounded-2xl p-5"
      style={{
        background:`
          linear-gradient(
            135deg,
            ${color}50,
            #101012
          )
        `,
      }}
    >

      <div className="relative z-10">

        <span
          className="text-sm font-bold uppercase tracking-[0.18em]"
          style={{
            color:color,
          }}
        >

          {label}

        </span>

        <p
          className="mt-5 text-3xl font-semibold"
          style={{
            color:color,
          }}
        >

          {value}

        </p>

      </div>

      <Icon
        size={34}
        strokeWidth={2}
        className="absolute right-5 top-1/2 -translate-y-1/2"
        style={{
          color:color,
        }}
      />

    </div>

  )

}