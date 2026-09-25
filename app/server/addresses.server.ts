import { apiClient, toApiError, type ApiError } from '~/lib/apiClient'
import { Address, AddressInput } from '~/types/addresses'

export async function getAddresses(
  token: string,
): Promise<Address[] | { error: ApiError }> {
  try {
    const { data } = await apiClient(token).get<Address[]>('/api/addresses')
    return data
  } catch (err) {
    return { error: toApiError(err) }
  }
}

export async function createAddress(
  input: AddressInput,
  token: string,
): Promise<Address | { error: ApiError }> {
  try {
    const { data } = await apiClient(token).post<Address>(
      '/api/addresses',
      input,
    )
    return data
  } catch (err) {
    return { error: toApiError(err) }
  }
}
