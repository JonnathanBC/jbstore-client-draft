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

export type UserOption = Pick<User, 'id' | 'name' | 'email'> & {
  last_name: string | null
}

export const UserRole = {
  ADMIN: 'ROLE_ADMIN',
  USER: 'ROLE_USER',
} as const

export type UserRole = (typeof UserRole)[keyof typeof UserRole]
