import type { ComponentType, SVGProps } from 'react'
import {
  Boxes,
  Briefcase,
  CarIcon,
  LayoutDashboard,
  PackageOpen,
  SendIcon,
  Settings,
  ShoppingCartIcon,
  Tag,
  Tags,
} from 'lucide-react'
import { t } from '~/i18n'

interface MenuLink {
  type: 'link'
  key: string
  label: string
  href: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
}

interface MenuSection {
  type: 'section'
  key: string
  label: string
}

type MenuItem = MenuLink | MenuSection

export const menuItems: MenuItem[] = [
  {
    type: 'link',
    key: 'dashboard',
    label: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    type: 'section',
    key: 'page-management',
    label: t('admin.page_management'),
  },
  {
    type: 'link',
    key: 'options',
    label: t('admin.options'),
    href: '/admin/options',
    icon: Settings,
  },
  {
    type: 'link',
    key: 'families',
    label: t('admin.families'),
    href: '/admin/families',
    icon: Boxes,
  },
  {
    type: 'link',
    key: 'categories',
    label: t('admin.categories'),
    href: '/admin/categories',
    icon: Tag,
  },
  {
    type: 'link',
    key: 'subcategories',
    label: t('admin.subcategories'),
    href: '/admin/subcategories',
    icon: Tags,
  },
  {
    type: 'link',
    key: 'products',
    label: t('global.products'),
    href: '/admin/products',
    icon: PackageOpen,
  },
  {
    type: 'link',
    key: 'covers',
    label: t('admin.covers'),
    href: '/admin/covers',
    icon: Briefcase,
  },
  {
    type: 'section',
    key: 'payments-orders',
    label: t('admin.payments_orders'),
  },
  {
    type: 'link',
    key: 'orders',
    label: t('admin.orders'),
    href: '/admin/orders',
    icon: ShoppingCartIcon,
  },
  {
    type: 'link',
    key: 'drivers',
    label: t('admin.drivers'),
    href: '/admin/drivers',
    icon: CarIcon,
  },
  {
    type: 'link',
    key: 'shippings',
    label: t('admin.shippings'),
    href: '/admin/shippings',
    icon: SendIcon,
  },
]
