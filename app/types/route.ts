export type BreadcrumbItem = {
  label: string
  to?: string
}

type Breadcrumb =
  | string
  | BreadcrumbItem
  | BreadcrumbItem[]
  | ((args: { match: unknown }) => string | BreadcrumbItem | BreadcrumbItem[])

export interface RouteHandle {
  breadcrumb?: Breadcrumb
}
