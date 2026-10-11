import axios, { AxiosError } from 'axios'

const API_URL = process.env.API_URL

export const apiClient = (token?: string) =>
  axios.create({
    baseURL: API_URL || '/',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    // withCredentials: true,
  })

export type ApiError = {
  code:
    | 'BAD_REQUEST'
    | 'UNAUTHORIZED'
    | 'FORBIDDEN'
    | 'NOT_FOUND'
    | 'INTERNAL_SERVER_ERROR'
  message: string
  status: number
  errors?: Record<string, string[]>
}

const STATUS_TO_CODE: Record<number, ApiError['code']> = {
  400: 'BAD_REQUEST',
  401: 'UNAUTHORIZED',
  403: 'FORBIDDEN',
  404: 'NOT_FOUND',
  422: 'BAD_REQUEST',
}

const GENERIC_ERROR =
  'Ocurrió un error inesperado. Intentá de nuevo en unos minutos.'

export function toApiError(err: unknown): ApiError {
  if (err instanceof AxiosError) {
    const status = err.response?.status ?? 500
    const data = err.response?.data as
      | {
          message?: string
          errors?: Record<string, string[]>
        }
      | undefined

    // 500 / sin respuesta = excepción no controlada: su mensaje puede traer SQL, rutas o stack.
    // Otros 5xx (502 de la pasarela) traen mensajes pensados para el usuario: se respetan.
    const isUnhandled = status === 500 || !err.response
    if (isUnhandled) {
      console.error(
        '[api] error inesperado',
        status,
        err.config?.url,
        data?.message ?? err.message,
      )
    }

    return {
      code: STATUS_TO_CODE[status] ?? 'INTERNAL_SERVER_ERROR',
      message: isUnhandled ? GENERIC_ERROR : (data?.message ?? GENERIC_ERROR),
      status,
      errors: data?.errors,
    }
  }

  console.error('[api] error inesperado', err)
  return {
    code: 'INTERNAL_SERVER_ERROR',
    message: GENERIC_ERROR,
    status: 500,
  }
}
