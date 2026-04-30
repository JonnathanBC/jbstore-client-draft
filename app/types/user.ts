type UserRoleMap = {
  ROLE_ADMIN: 'ROLE_ADMIN'
  ROLE_USER: 'ROLE_USER'
}

export interface User {
  id: number
  name: string
  email: string
  email_verified_at: string
  created_at: string
  updated_at: string
  google_id: string | null
  avatar: string | null
  role: UserRoleMap[keyof UserRoleMap]
}

export const UserRole = {
  ADMIN: 'ROLE_ADMIN',
  USER: 'ROLE_USER',
} as const

export type UserRole = (typeof UserRole)[keyof typeof UserRole]
