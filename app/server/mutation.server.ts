import { data, redirect } from 'react-router'

import type { ApiError } from '~/lib/apiClient'
import { commitSession, getSession } from './session.server'

/** Forma única de respuesta de los actions: lo que leen fetcher.data / actionData. */
export type MutationResult = {
  ok: boolean
  error?: string
  errors?: Record<string, string[]>
}

type Options = {
  /** Título del toast de éxito (llega por flash al root). */
  message: string
  /**
   * Si se pasa, redirige ahí (cierra un modal-ruta, vuelve al listado...).
   * Si no, responde `{ ok: true }` y te quedás en la página: el loader se revalida solo.
   */
  redirectTo?: string
}

/**
 * Cierra cualquier action que llame a la API:
 * - error → `{ ok: false, error, errors }` con el status de la API (los errores se pintan en el form).
 * - éxito → toast por flash + redirect o `{ ok: true }`.
 */
export async function handleMutation<T>(
  request: Request,
  result: T | { error: ApiError },
  { message, redirectTo }: Options,
) {
  if (result && typeof result === 'object' && 'error' in result) {
    return data<MutationResult>(
      {
        ok: false,
        error: result.error.message,
        errors: result.error.errors ?? {},
      },
      { status: result.error.status },
    )
  }

  const session = await getSession(request.headers.get('Cookie'))
  session.flash('toast', { kind: 'success', title: message })
  const headers = { 'Set-Cookie': await commitSession(session) }

  if (redirectTo) return redirect(redirectTo, { headers })

  return data<MutationResult>({ ok: true }, { headers })
}
