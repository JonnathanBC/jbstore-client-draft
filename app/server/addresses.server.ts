import { apiClient, toApiError, type ApiError } from '~/lib/apiClient'

export type AddressInput = {
  type: 'shipping' | 'billing'
  address_line_1: string
  address_line_2: string
  city: string
  province: string
  postal_code: string
  country: string
  reference: string
  phone: string
}

export type Address = AddressInput & {
  id: number
  is_default: boolean
  created_at: string
  updated_at: string
}

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
): Promise<Record<string, unknown> | { error: ApiError }> {
  try {
    const { data } = await apiClient(token).post<Record<string, unknown>>(
      '/api/addresses',
      input,
    )
    return data
  } catch (err) {
    return { error: toApiError(err) }
  }
}
