import { apiClient, ApiError, toApiError } from '~/lib/apiClient'
import { PaymentResponse } from '~/types/payments'

export async function getPaymentToken(
  token: string,
): Promise<PaymentResponse | { error: ApiError }> {
  try {
    const { data } =
      await apiClient(token).get<PaymentResponse>(`/api/payments/token`)
    return data
  } catch (err) {
    return { error: toApiError(err) }
  }
}
