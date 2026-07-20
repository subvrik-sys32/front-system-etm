export interface AuthUser {
  id: string
  name: string
  email: string
  role: string
}

export interface LoginInput {
  email: string
  password: string
}

export interface LoginResponse {
  accessToken: string
  user: AuthUser
}