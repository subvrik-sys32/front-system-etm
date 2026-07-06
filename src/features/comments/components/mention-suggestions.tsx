"use client"

interface MentionableUser{
  id:string
  username:string|null
  name:string
  avatarUrl:string|null
  color:string
}

type Props = {
  users: MentionableUser[]
  onSelect: (username: string) => void
}

export function MentionSuggestions({ users, onSelect }: Props) {

  if (users.length === 0) return null

  return (

    <div className="absolute bottom-full left-0 mb-1.5 w-64 overflow-hidden rounded-xl border border-white/10 bg-neutral-900 shadow-2xl">

      {users.slice(0, 6).map((user) => (

        <button
          key={user.id}
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => onSelect(user.username ?? user.name)}
          className="flex w-full items-center gap-2 px-3 py-2 text-left transition-colors hover:bg-white/5"
        >

          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt={user.name} className="h-6 w-6 rounded-full object-cover" />
          ) : (
            <div
              className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold text-white"
              style={{ backgroundColor: user.color }}
            >
              {user.name.charAt(0).toUpperCase()}
            </div>
          )}

          <span className="truncate text-sm text-neutral-200">{user.name}</span>
          <span className="ml-auto shrink-0 text-xs text-neutral-500">@{user.username}</span>

        </button>

      ))}

    </div>

  )

}