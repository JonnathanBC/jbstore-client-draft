import type { ApiResponse } from '@/types/api';

interface Props {
  meta: ApiResponse<unknown>;
  onPageChange: (page: number) => void;
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
      d="M15.8337 10H4.16699"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M10.0003 15.8332L4.16699 9.99984L10.0003 4.1665"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

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
      d="M4.16699 10H15.8337"
      stroke="currentColor"
      strokeWidth="1.66667"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M10 4.1665L15.8333 9.99984L10 15.8332"
      stroke="currentColor"
      strokeWidth="1.66667"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const Pagination = ({ meta, onPageChange }: Props) => {
  const lastIndex = meta.links.length - 1;

  return (
    <nav className="flex items-center justify-between mt-4 text-sm">
      <span className="text-slate-600">
        Mostrando {meta.from ?? 0}–{meta.to ?? 0} de {meta.total}
      </span>

      <ul className="flex items-center gap-1">
        {meta.links.map((link, i) => {
          const isPrev = i === 0;
          const isNext = i === lastIndex;
          const disabled = link.url === null || link.page === null;

          const baseClass =
            'inline-flex items-center justify-center min-w-8 h-8 px-3 rounded text-slate-500 transition-colors';

          const content = isPrev ? (
            <ArrowLeft />
          ) : isNext ? (
            <ArrowRight />
          ) : (
            <span dangerouslySetInnerHTML={{ __html: link.label }} />
          );

          if (disabled) {
            return (
              <li key={i}>
                <span className={`${baseClass} opacity-40 cursor-not-allowed`} aria-disabled="true">
                  {content}
                </span>
              </li>
            );
          }

          return (
            <li key={i}>
              <button
                type="button"
                onClick={() => onPageChange(link.page!)}
                aria-label={
                  isPrev ? 'Página anterior' : isNext ? 'Página siguiente' : `Página ${link.label}`
                }
                aria-current={link.active ? 'page' : undefined}
                className={[
                  baseClass,
                  'cursor-pointer hover:bg-slate-50 hover:text-slate-900',
                  link.active
                    ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700 hover:text-white'
                    : '',
                ].join(' ')}
              >
                {content}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
