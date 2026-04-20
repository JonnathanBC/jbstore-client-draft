import { Link, useMatches } from 'react-router';
import { cn } from '~/lib/utils';
import type { RouteHandle } from '~/types/route';

interface Crumb {
  label: string;
  href?: string;
}

export function Breadcrumbs() {
  const matches = useMatches();

  const crumbs: Crumb[] = matches.reduce<Crumb[]>((acc, match, i) => {
    const handle = match.handle as RouteHandle | undefined;
    if (!handle?.breadcrumb) return acc;
    const isLast = i === matches.length - 1;
    acc.push({
      label: handle.breadcrumb,
      href: isLast ? undefined : match.pathname,
    });
    return acc;
  }, []);

  if (crumbs.length === 0) return null;

  return (
    <nav className="mb-4">
      <ol className="flex flex-wrap">
        {crumbs.map((crumb, i) => {
          const isFirst = i === 0;
          return (
            <li
              key={i}
              className={cn('text-sm leading-normal text-slate-900', {
                "pl-2 before:float-left before:pr-2 before:content-['/']": !isFirst,
              })}
            >
              {crumb.href ? (
                <Link to={crumb.href} className="opacity-60 hover:opacity-100">
                  {crumb.label}
                </Link>
              ) : (
                crumb.label
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
