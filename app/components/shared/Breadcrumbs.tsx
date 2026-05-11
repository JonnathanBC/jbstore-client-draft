import { Link, useMatches } from 'react-router'
import { cn } from '~/lib/utils'
import type { BreadcrumbItem, RouteHandle } from '~/types/route'

type Crumb = { label: string; to?: string }

export function Breadcrumbs() {
  const matches = useMatches()

  const crumbs: Crumb[] = matches.reduce<Crumb[]>((acc, match, i) => {
    const handle = match.handle as RouteHandle | undefined
    if (!handle?.breadcrumb) return acc

    const isLast = i === matches.length - 1

    const raw =
      typeof handle.breadcrumb === 'function'
        ? handle.breadcrumb({ match })
        : handle.breadcrumb

    if (typeof raw === 'string') {
      acc.push({ label: raw, to: isLast ? undefined : match.pathname })
      return acc
    }

    const items: BreadcrumbItem[] = Array.isArray(raw) ? raw : [raw]
    for (const item of items) {
      acc.push({
        label: item.label,
        to: item.to,
      })
    }
    return acc
  }, [])

  if (crumbs.length === 0) return null

  return (
    <nav className="mb-4">
      <ol className="flex flex-wrap">
        {crumbs.map((crumb, i) => {
          const isFirst = i === 0
          const isLast = i === crumbs.length - 1
          const crumbKey = crumb.to ?? crumb.label
          return (
            <li
              key={crumbKey}
              className={cn('text-sm leading-normal text-zinc-900', {
                "pl-2 before:float-left before:pr-2 before:content-['/']":
                  !isFirst,
              })}
            >
              {crumb.to && !isLast ? (
                <Link to={crumb.to} className="opacity-60 hover:opacity-100">
                  {crumb.label}
                </Link>
              ) : (
                crumb.label
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
