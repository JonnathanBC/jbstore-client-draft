import { TableProps } from '~/types/table'
import { Pagination } from './Pagination'

const EMPTY_ARRAY: never[] = []
const EMPTY_COLUMNS: never[] = []

export const Table = <T,>({
  meta,
  dataSource = EMPTY_ARRAY,
  columns = EMPTY_COLUMNS,
  onPageChange,
}: TableProps<T>) => {
  return (
    <>
      <div className="rounded-base border-default relative overflow-x-auto border shadow-xs">
        <table className="text-body w-full text-left text-sm">
          <thead className="bg-neutral-secondary-soft border-default border-b text-sm">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.dataIndex ?? col.title}
                  className="px-6 py-3 font-medium"
                >
                  {col.title}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {dataSource.length === 0 ? (
              <tr>
                <td
                  className="p-6 text-center text-zinc-400"
                  colSpan={columns.length}
                >
                  No data
                </td>
              </tr>
            ) : (
              dataSource.map((row, i) => {
                const rowId =
                  typeof row === 'object' && row !== null && 'id' in row
                    ? String((row as Record<string, unknown>).id)
                    : String(i)
                return (
                  <tr
                    key={rowId}
                    className="bg-neutral-primary border-default hover:bg-neutral-secondary-soft border-b transition"
                  >
                    {columns.map((col, j) => (
                      <td
                        key={col.dataIndex ?? col.title + j}
                        className="px-6 py-4"
                      >
                        {col.render
                          ? col.render(row)
                          : col.dataIndex
                            ? (row[col.dataIndex] as React.ReactNode)
                            : null}
                      </td>
                    ))}
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
      {meta && onPageChange && (
        <Pagination meta={meta} onPageChange={onPageChange} />
      )}
    </>
  )
}