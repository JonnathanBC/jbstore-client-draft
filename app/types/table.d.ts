export interface Column<T> {
  title: string;
  dataIndex?: keyof T & string;
  render?: (row: T) => React.ReactNode;
}

export interface TableProps<T> {
  dataSource?: T[];
  columns?: Column<T>[];
  meta?: ApiResponse<unknown>;
  onPageChange?: (page: number) => void;
}