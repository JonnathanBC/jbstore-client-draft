import { TableProps } from '~/types/table'
import { Pagination } from './Pagination'

export const Table = <T,>({
  meta,
  dataSource = [],
  columns = [],
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
                  className="px-6 py-6 text-center text-gray-400"
                  colSpan={columns.length}
                >
                  No data
                </td>
              </tr>
            ) : (
              dataSource.map((row, i) => (
                <tr
                  key={i}
                  className="bg-neutral-primary border-default hover:bg-neutral-secondary-soft border-b transition"
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
      {meta && onPageChange && (
        <Pagination meta={meta} onPageChange={onPageChange} />
      )}
    </>
  )
}
