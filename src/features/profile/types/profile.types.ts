export type Profile = {

  id: string

  name: string

  email: string

  username: string | null

  avatarUrl: string | null

  phone: string | null

  position: string | null

  color: string

  icon: string

  role: {
    id: string
    code: string
    name: string
    icon: string
    color: string
    active: boolean
  }

}

export type UpdateProfileDto = {

  name?: string

  phone?: string

  position?: string

}