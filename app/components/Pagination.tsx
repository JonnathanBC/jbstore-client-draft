import type { ApiResponse } from '~/types/api'

interface Props {
  meta: ApiResponse<unknown>
  onPageChange: (page: number) => void
}

const ArrowLeft = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M15.8 10H4.17"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M10 15.8L4.17 10L10 4.17"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const ArrowRight = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M4.17 10H15.8"
      stroke="currentColor"
      strokeWidth="1.67"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M10 4.17L15.8 10L10 15.8"
      stroke="currentColor"
      strokeWidth="1.67"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

export const Pagination = ({ meta, onPageChange }: Props) => {
  const prevLink = meta.links[0]
  const nextLink = meta.links[meta.links.length - 1]

  // Extraemos solo los números de página
  const pageLinks = meta.links.slice(1, -1)

  return (
    <nav className="mt-4 flex items-center justify-between text-sm font-medium">
      {/* Texto informativo */}
      <span className="text-zinc-500">
        Mostrando <span className="text-zinc-800">{meta.from ?? 0}</span>–
        <span className="text-zinc-800">{meta.to ?? 0}</span> de{' '}
        <span className="text-zinc-800">{meta.total}</span>
      </span>

      <div className="flex items-center gap-4">
        {/* Botón Anterior */}
        <button
          type="button"
          onClick={() => prevLink.page && onPageChange(prevLink.page)}
          disabled={!prevLink.url}
          className={`flex items-center justify-center transition-colors ${
            prevLink.url
              ? 'hover:text-primary cursor-pointer text-zinc-600'
              : 'cursor-not-allowed text-zinc-300'
          }`}
          aria-label="Página anterior"
        >
          <ArrowLeft />
        </button>

        {/* Listado de Números */}
        <ul className="flex items-center gap-1">
          {pageLinks.map((link) => {
            const isEllipsis = link.url === null
            const baseClass =
              'inline-flex items-center justify-center min-w-8 size-8 px-3 rounded transition-all'
            const linkKey = link.label + (link.page ?? '')

            if (isEllipsis) {
              return (
                <li key={linkKey} className={`${baseClass} text-zinc-400`}>
                  <span>{link.label}</span>
                </li>
              )
            }

            return (
              <li key={linkKey}>
                <button
                  type="button"
                  onClick={() => onPageChange(link.page!)}
                  aria-current={link.active ? 'page' : undefined}
                  className={[
                    baseClass,
                    link.active
                      ? 'bg-primary text-white'
                      : 'hover:bg-primary-hover cursor-pointer text-zinc-600 hover:text-white',
                  ].join(' ')}
                >
                  <span>{link.label}</span>
                </button>
              </li>
            )
          })}
        </ul>

        {/* Botón Siguiente */}
        <button
          type="button"
          onClick={() => nextLink.page && onPageChange(nextLink.page)}
          disabled={!nextLink.url}
          className={`flex items-center justify-center transition-colors ${
            nextLink.url
              ? 'hover:text-primary cursor-pointer text-zinc-600'
              : 'cursor-not-allowed text-zinc-300'
          }`}
          aria-label="Página siguiente"
        >
          <ArrowRight />
        </button>
      </div>
    </nav>
  )
}
