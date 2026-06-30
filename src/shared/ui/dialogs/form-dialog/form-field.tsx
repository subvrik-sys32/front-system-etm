type Props = {
  label: string

  children: React.ReactNode
}

export function FormField({
  label,
  children,
}: Props) {

  return (

    <div className="space-y-1.5">

      <p className="text-sm font-medium text-neutral-300">

        {label}

      </p>

      {children}

    </div>

  )

}