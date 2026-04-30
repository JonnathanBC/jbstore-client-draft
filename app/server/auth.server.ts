import { redirect } from 'react-router'
import { apiClient, toApiError, type ApiError } from '~/lib/apiClient'
import type { User } from '~/types/user'
import { getSession } from './session.server'

export interface AuthTokens {
  token: string
  userId: number
}

export async function getOptionalAuth(
  request: Request,
): Promise<AuthTokens | null> {
  const session = await getSession(request.headers.get('Cookie'))
  const token = session.get('token')
  const userId = session.get('userId')
  if (!token || typeof userId !== 'number') return null
  return { token, userId }
}

export async function requireAuth(request: Request): Promise<AuthTokens> {
  const auth = await getOptionalAuth(request)
  if (!auth) {
    const url = new URL(request.url)
    const redirectTo = url.pathname + url.search
    throw redirect(`/login?redirectTo=${encodeURIComponent(redirectTo)}`)
  }
  return auth
}

export async function fetchMe(token: string): Promise<User> {
  const client = apiClient(token)
  const { data } = await client.get<User>('/api/auth/me')
  return data
}

export interface LoginResult {
  token: string
  user: User
}

export async function login(
  email: string,
  password: string,
): Promise<LoginResult | { error: ApiError }> {
  try {
    const { data } = await apiClient().post<{ token: string; user: User }>(
      '/api/auth/login',
      {
        email,
        password,
      },
    )
    return { token: data.token, user: data.user }
  } catch (err) {
    return { error: toApiError(err) }
  }
}

export interface RegisterInput {
  name: string
  email: string
  password: string
  password_confirmation: string
}

export async function register(
  input: RegisterInput,
): Promise<LoginResult | { error: ApiError }> {
  try {
    const { data } = await apiClient().post<{ token: string; user: User }>(
      '/api/auth/register',
      input,
    )
    return { token: data.token, user: data.user }
  } catch (err) {
    return { error: toApiError(err) }
  }
}

export async function logoutBackend(token: string): Promise<void> {
  try {
    const client = apiClient(token)
    await client.post('/api/auth/logout')
  } catch {
    // Best-effort: if backend logout fails, we still destroy the local session.
  }
}

export async function fetchGoogleOAuthUrl(): Promise<string> {
  const { data } = await apiClient().get<{ url: string }>('/api/auth/google')
  return data.url
}
