import { apiClient, ApiError, toApiError } from '~/lib/apiClient'
import { PaymentSessionTokenResponse } from '~/types/payments'

export async function getPaymentSessionToken(
  token: string,
): Promise<PaymentSessionTokenResponse | { error: ApiError }> {
  try {
    const { data } = await apiClient(token).post<PaymentSessionTokenResponse>(
      `/api/payments/session`,
    )
    return data
  } catch (err) {
    return { error: toApiError(err) }
  }
}
