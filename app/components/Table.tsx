import type { ApiResponse } from '~/types/api';
import { Pagination } from './Pagination';

interface Column<T> {
  title: string;
  dataIndex?: keyof T & string;
  render?: (row: T) => React.ReactNode;
}

interface Props<T> {
  dataSource?: T[];
  columns?: Column<T>[];
  meta?: ApiResponse<unknown>;
  onPageChange?: (page: number) => void;
}

export const Table = <T,>({
  meta,
  dataSource = [],
  columns = [],
  onPageChange,
}: Props<T>) => {
  return (
    <>
      <div className="relative overflow-x-auto rounded-base border border-default shadow-xs">
        <table className="w-full text-sm text-left text-body">
          <thead className="text-sm bg-neutral-secondary-soft border-b border-default">
            <tr>
              {columns.map((col) => (
                <th key={col.dataIndex ?? col.title} className="px-6 py-3 font-medium">
                  {col.title}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {dataSource.length === 0 ? (
              <tr>
                <td className="px-6 py-6 text-center text-gray-400" colSpan={columns.length}>
                  No data
                </td>
              </tr>
            ) : (
              dataSource.map((row, i) => (
                <tr
                  key={i}
                  className="bg-neutral-primary border-b border-default hover:bg-neutral-secondary-soft transition"
                >
                  {columns.map((col, j) => (
                    <td key={j} className="px-6 py-4">
                      {col.render
                        ? col.render(row)
                        : col.dataIndex
                          ? (row[col.dataIndex] as React.ReactNode)
                          : null}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {meta && onPageChange && <Pagination meta={meta} onPageChange={onPageChange} />}
    </>
  );
};
