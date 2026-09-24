import { apiClient } from '~/lib/apiClient'
import { User } from '~/types/user'

export async function fetchMe(token: string): Promise<User> {
  const client = apiClient(token)
  const { data } = await client.get<User>('/api/user/me')
  return data
}
