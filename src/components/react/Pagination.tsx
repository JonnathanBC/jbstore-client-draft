import type { ApiResponse } from '@/types/api';

interface Props {
  meta: ApiResponse<unknown>;
  onPageChange: (page: number) => void;
}

export const Pagination = ({ meta, onPageChange }: Props) => {
  return (
    <nav className="flex items-center justify-between mt-4 text-sm">
      <span className="text-slate-600">
        Mostrando {meta.from ?? 0}–{meta.to ?? 0} de {meta.total}
      </span>

      <div className="flex gap-1">
        {meta.links.map((link, i) =>
          link.url === null || link.page === null ? (
            <span
              key={i}
              className="px-3 py-1 border rounded text-slate-300 cursor-not-allowed"
              dangerouslySetInnerHTML={{ __html: link.label }}
            />
          ) : (
            <button
              key={i}
              onClick={() => onPageChange(link.page!)}
              className={[
                'px-3 py-1 border rounded hover:bg-slate-50',
                link.active ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700' : '',
              ].join(' ')}
              dangerouslySetInnerHTML={{ __html: link.label }}
            ></button>
          ),
        )}
      </div>
    </nav>
  );
};
