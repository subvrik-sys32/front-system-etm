"use client"

import { useMemo } from "react"

import { useResponsive } from "@/shared/responsive/hooks/use-responsive"
import { EntityTable } from "@/shared/ui/entity-table"
import { EntityTableLoading } from "@/shared/ui/entity-table/entity-table-loading"
import { useHydrated } from "@/shared/hooks/use-hydrated"

import { useUsers } from "@/features/users/hooks/use-users"

import { UserMobileCard } from "../components/cards/user-mobile-card"
import { useUserColumns } from "./user-columns"

type Props = {
  search: string
}

export function UserTable({
  search,
}: Props) {
  const hydrated = useHydrated()
  const { isMobile } = useResponsive()

  const {
    users,
    loading,
  } = useUsers()

  const columns = useUserColumns()

  const data = useMemo(() => {
    const query = search.trim().toLowerCase()

    return users.filter(user =>
      !query ||
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      (user.username ?? "").toLowerCase().includes(query),
    )
  }, [
    users,
    search,
  ])

  if (!hydrated || loading) {
    return (
      <EntityTableLoading
        label="Cargando usuarios..."
      />
    )
  }

  if (isMobile) {
    return (
      <div className="space-y-3">
        {data.length ? (
          data.map((user, index) => (
            <UserMobileCard
              key={user.id}
              user={user}
              index={index}
            />
          ))
        ) : (
          <div className="rounded-2xl bg-[#101012] px-4 py-8 text-center text-sm text-neutral-500 ring-1 ring-white/6">
            Sin usuarios
          </div>
        )}
      </div>
    )
  }

  return (
    <EntityTable
      data={data}
      columns={columns}
      rowId={user => user.id}
      emptyMessage="Sin usuarios"
    />
  )
}