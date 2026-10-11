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
  // null en usuarios que entraron con Google y todavía no completaron el perfil
  last_name: string | null
  document_type: DocumentType | null
  document_number: string | null
  phone: string | null
  // Solo lo devuelve /api/user/me
  profile_complete?: boolean
}

export type DocumentType = 'CI' | 'RUC' | 'PP'

export interface ProfileInput {
  last_name: string
  document_type: string
  document_number: string
  phone: string
}

export type UserOption = Pick<User, 'id' | 'name' | 'email'> & {
  last_name: string | null
}

export const UserRole = {
  ADMIN: 'ROLE_ADMIN',
  USER: 'ROLE_USER',
} as const

export type UserRole = (typeof UserRole)[keyof typeof UserRole]
