import {
  requireAdminMiddleware,
  requireSessionUser,
} from '~/server/auth.context.server'
import { getSubCategories } from '~/server/subcategories.server'
import { Route } from './+types/resources.categories'

export async function loader({ request, context }: Route.LoaderArgs) {
  const { token } = requireSessionUser(context)

  const url = new URL(request.url)
  const categoryId = url.searchParams.get('category_id')

  const subcategories = await getSubCategories({
    token,
    page: 1,
    per_page: 10,
    category_id: categoryId ?? undefined,
  })

  return {
    items: subcategories.data.map((f) => ({
      value: String(f.id),
      label: f.name,
    })),
  }
}

// Las resource routes no cuelgan del layout admin: llevan su propio guard
export const middleware: Route.MiddlewareFunction[] = [requireAdminMiddleware]
