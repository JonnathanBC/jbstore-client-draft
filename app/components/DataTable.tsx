import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useSearchParams } from 'react-router'
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from '@tanstack/react-table'
import { Filter } from 'lucide-react'

import { Badge } from '~/components/Badge'
import { Pagination } from '~/components/Pagination'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'
import { t } from '~/i18n'
import type { ApiResponse } from '~/types/api'

export interface DataTableFilter {
  // Nombre del query param (ej. 'status')
  key: string
  label: string
  options: { label: string; value: string }[]
}

interface DataTableProps<TData> {
  columns: ColumnDef<TData, any>[]
  data: TData[]
  meta: ApiResponse<unknown>
  // false si el endpoint no soporta ?search: un input que no filtra nada confunde
  searchable?: boolean
  searchPlaceholder?: string
  filters?: DataTableFilter[]
  // Botones propios de la pantalla (ej. "Nuevo"): van en la misma línea que los filtros
  actions?: ReactNode
}

// Radix Select no admite value="" en un item, usamos un centinela para "Todos"
const ALL = 'all'
const SEARCH_DEBOUNCE_MS = 300

// Toda la state de filtros vive en la URL: el loader del route es quien trae los datos
function useUrlFilters(filters: DataTableFilter[]) {
  const [searchParams, setSearchParams] = useSearchParams()

  // Cualquier cambio de filtro vuelve a la página 1 para no quedar en una página inexistente
  const update = (changes: Record<string, string | null>) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      for (const [key, value] of Object.entries(changes)) {
        if (value) next.set(key, value)
        else next.delete(key)
      }
      next.delete('page')
      return next
    })
  }

  const clearAll = () => update({ search: null, ...nullKeys(filters) })

  const setPage = (page: number) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set('page', String(page))
      return next
    })
  }

  return { searchParams, update, clearAll, setPage }
}

const nullKeys = (filters: DataTableFilter[]) =>
  Object.fromEntries(filters.map((f) => [f.key, null]))

const SearchInput = ({
  value: urlValue,
  placeholder,
  onSearch,
}: {
  value: string
  placeholder?: string
  onSearch: (value: string) => void
}) => {
  const [value, setValue] = useState(urlValue)
  // Último valor que nosotros mandamos a la URL: evita pisar lo que el usuario sigue tipeando
  const lastPushed = useRef(urlValue)

  // La URL cambió desde afuera (ej. "Borrar"): reflejarlo en el input
  useEffect(() => {
    if (urlValue !== lastPushed.current) {
      lastPushed.current = urlValue
      setValue(urlValue)
    }
  }, [urlValue])

  useEffect(() => {
    if (value === lastPushed.current) return
    const timer = setTimeout(() => {
      lastPushed.current = value
      onSearch(value.trim())
    }, SEARCH_DEBOUNCE_MS)
    return () => clearTimeout(timer)
    // onSearch se recrea en cada render; solo nos importa reaccionar al valor tipeado
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  return (
    <Input
      type="search"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      placeholder={placeholder ?? t('global.search')}
      aria-label={t('global.search')}
      className="max-w-sm"
    />
  )
}

const FiltersPopover = ({
  filters,
  values,
  onChange,
}: {
  filters: DataTableFilter[]
  values: Record<string, string>
  onChange: (key: string, value: string) => void
}) => {
  const activeCount = filters.filter((f) => values[f.key]).length

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">
          {t('global.filters')}
          {activeCount > 0 && (
            <span className="bg-primary text-primary-foreground rounded-full px-1.5 text-xs">
              {activeCount}
            </span>
          )}
          <Filter />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64 space-y-3">
        {filters.map((filter) => (
          <div key={filter.key} className="space-y-1.5">
            <label className="text-sm font-medium capitalize">
              {filter.label}
            </label>
            <Select
              value={values[filter.key] || ALL}
              onValueChange={(v) => onChange(filter.key, v === ALL ? '' : v)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>{t('global.all')}</SelectItem>
                {filter.options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}
      </PopoverContent>
    </Popover>
  )
}

const AppliedFilters = ({
  filters,
  values,
  search,
  onRemove,
  onClear,
}: {
  filters: DataTableFilter[]
  values: Record<string, string>
  search: string
  onRemove: (key: string) => void
  onClear: () => void
}) => {
  const active = filters.flatMap((filter) => {
    const option = filter.options.find((o) => o.value === values[filter.key])
    // Un valor en la URL que no existe en las opciones no se muestra como chip
    return option ? [{ filter, option }] : []
  })

  if (!search && active.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <span className="font-medium">{t('global.applied_filters')}:</span>
      {search && (
        <Badge
          label={`${t('global.search')}: ${search}`}
          onClick={() => onRemove('search')}
        />
      )}
      {active.map(({ filter, option }) => (
        <Badge
          key={filter.key}
          label={`${filter.label}: ${option.label}`}
          onClick={() => onRemove(filter.key)}
        />
      ))}
      <Button variant="link" size="sm" onClick={onClear}>
        {t('global.clear')}
      </Button>
    </div>
  )
}

export function DataTable<TData>({
  columns,
  data,
  meta,
  searchable = true,
  searchPlaceholder,
  filters = [],
  actions,
}: DataTableProps<TData>) {
  const { searchParams, update, clearAll, setPage } = useUrlFilters(filters)
  const search = searchParams.get('search') ?? ''
  const values = Object.fromEntries(
    filters.map((f) => [f.key, searchParams.get(f.key) ?? '']),
  )

  // Filtrado y paginado son del lado del server: tanstack solo renderiza
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualFiltering: true,
    rowCount: meta.total,
  })

  return (
    <div className="space-y-4">
      <AppliedFilters
        filters={filters}
        values={values}
        search={search}
        onRemove={(key) => update({ [key]: null })}
        onClear={clearAll}
      />

      <div className="flex items-center justify-between gap-2">
        {searchable && (
          <SearchInput
            value={search}
            placeholder={searchPlaceholder}
            onSearch={(value) => update({ search: value || null })}
          />
        )}
        {/* ml-auto: sin buscador, filtros y acciones siguen pegados a la derecha */}
        <div className="ml-auto flex items-center gap-2">
          {filters.length > 0 && (
            <FiltersPopover
              filters={filters}
              values={values}
              onChange={(key, value) => update({ [key]: value || null })}
            />
          )}
          {actions}
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-zinc-400"
                >
                  {t('global.no_data')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Pagination
        meta={meta}
        onPageChange={setPage}
        summary={
          <>
            {t('global.showing')}{' '}
            <span className="text-zinc-800">{meta.total}</span>{' '}
            {t('global.results')}
          </>
        }
      />
    </div>
  )
}
