import { apiClient, toApiError } from '~/lib/apiClient'
import { User, UserOption } from '~/types/user'

export async function fetchMe(token: string): Promise<User> {
  const client = apiClient(token)
  const { data } = await client.get<User>('/api/user/me')
  return data
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
