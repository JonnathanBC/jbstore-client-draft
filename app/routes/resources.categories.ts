import {
  requireAdminMiddleware,
  requireSessionUser,
} from '~/server/auth.context.server'
import { getCategories } from '~/server/categories.server'
import { Route } from './+types/resources.categories'

export async function loader({ request, context }: Route.LoaderArgs) {
  const { token } = requireSessionUser(context)

  const url = new URL(request.url)
  const familyId = url.searchParams.get('family_id')

  const categories = await getCategories({
    token,
    page: 1,
    per_page: 10,
    family_id: familyId ?? undefined,
  })

  return {
    items: categories.data.map((c) => ({
      value: String(c.id),
      label: c.name,
      subcategories: (c.subcategories ?? []).map((s) => ({
        value: String(s.id),
        label: s.name,
      })),
    })),
  }
}

// Las resource routes no cuelgan del layout admin: llevan su propio guard
export const middleware: Route.MiddlewareFunction[] = [requireAdminMiddleware]
