import { apiClient, toApiError, type ApiError } from '~/lib/apiClient'
import { ProfileInput, User, UserOption } from '~/types/user'

export async function fetchMe(token: string): Promise<User> {
  const client = apiClient(token)
  const { data } = await client.get<User>('/api/user/me')
  return data
}

export async function completeProfile(
  token: string,
  profile: ProfileInput,
): Promise<User | { error: ApiError }> {
  try {
    const { data } = await apiClient(token).patch<User>(
      '/api/user/me/profile',
      profile,
    )
    return data
  } catch (err) {
    return { error: toApiError(err) }
  }
}

export async function getUsers({
  token,
  search,
}: {
  token: string
  search?: string
}): Promise<UserOption[]> {
  try {
    const { data } = await apiClient(token).get<UserOption[]>(
      '/api/admin/users',
      { params: { search } },
    )
    return data
  } catch (err) {
    throw toApiError(err)
  }
}
