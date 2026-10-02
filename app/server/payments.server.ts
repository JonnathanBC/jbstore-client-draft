import { AxiosError } from 'axios'
import { apiClient, ApiError, toApiError } from '~/lib/apiClient'
import type {
  CapturePaymentPayload,
  AuthorizePaymentResponse,
  NiubizRejectionData,
  PaymentSessionTokenResponse,
} from '~/types/payments'

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

/**
 * Confirma el pago en Laravel con el transactionToken que devuelve Niubiz.
 * Laravel debe validar el monto contra el carrito, no confiar en el cliente.
 */
export async function capturePayment(
  token: string,
  payload?: CapturePaymentPayload,
): Promise<
  | AuthorizePaymentResponse
  | { error: ApiError; rejection: NiubizRejectionData | null }
> {
  try {
    const { data } = await apiClient(token).post<AuthorizePaymentResponse>(
      `/api/payments/capture`,
      payload,
    )
    return data
  } catch (err) {
    // Laravel responde 402 con el `data` de Niubiz (o null) para mostrar el rechazo.
    const rejection =
      err instanceof AxiosError
        ? ((err.response?.data?.data as NiubizRejectionData | null) ?? null)
        : null
    return { error: toApiError(err), rejection }
  }
}
