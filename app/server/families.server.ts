import { apiClient, toApiError } from '~/lib/apiClient'
import { ApiResource } from '~/types/api'
import { Family } from '~/types/family'
import { Option } from '~/types/option'

export async function getPublicFamily(id: number): Promise<Family> {
  try {
    const { data } = await apiClient().get<ApiResource<Family>>(
      `/api/public/families/${id}`,
    )
    return data.data
  } catch (err) {
    throw toApiError(err)
  }
}

export async function getPublicFamilyOptions(id: number): Promise<Option[]> {
  try {
    const { data } = await apiClient().get<ApiResource<Option[]>>(
      `/api/public/families/${id}/options`,
    )
    return data.data
  } catch (err) {
    throw toApiError(err)
  }
}
