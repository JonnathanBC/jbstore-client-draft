import type { ApiResponse } from '@/types/api';
import { Pagination } from './Pagination';

interface Column {
  title: string;
  dataIndex?: string;
  render?: (row: any) => any;
}

interface Props {
  dataSource?: any[];
  columns?: Column[];
  meta?: ApiResponse<unknown>;
  onPageChange?: (page: number) => void;
}

export const Table = ({ meta, dataSource = [], columns = [], onPageChange }: Props) => {
  return (
    <>
      <div className="relative overflow-x-auto rounded-base border border-default shadow-xs">
        <table className="w-full text-sm text-left text-body">
          <thead className="text-sm bg-neutral-secondary-soft border-b border-default">
            <tr>
              {columns.map((col) => (
                <th key={col.dataIndex} className="px-6 py-3 font-medium">
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
                      {col.render ? col.render(row) : row[col.dataIndex ?? '']}
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
