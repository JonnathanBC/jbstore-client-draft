import {
  requireAdminMiddleware,
  requireSessionUser,
} from '~/server/auth.context.server'
import { getFeatures } from '~/server/feature.server'
import { Route } from './+types/resources.categories'

export async function loader({ request, context }: Route.LoaderArgs) {
  const { token } = requireSessionUser(context)

  const url = new URL(request.url)
  const optionId = url.searchParams.get('option_id')

  const features = await getFeatures({
    token,
    page: 1,
    per_page: 10,
    option_id: optionId,
  })

  return {
    items: features.data.map((f) => ({
      value: String(f.id),
      label: f.description || f.value,
      feature_value: f.value,
      description: f.description ?? '',
    })),
  }
}

// Las resource routes no cuelgan del layout admin: llevan su propio guard
export const middleware: Route.MiddlewareFunction[] = [requireAdminMiddleware]
