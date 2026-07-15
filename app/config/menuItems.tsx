import type { ComponentType, SVGProps } from 'react'
import {
  Boxes,
  Briefcase,
  LayoutDashboard,
  PackageOpen,
  Settings,
  Tag,
  Tags,
} from 'lucide-react'
import { t } from '~/i18n'

interface MenuItem {
  key: string
  label: string
  href: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
}

export const menuItems: MenuItem[] = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    key: 'options',
    label: t('admin.options'),
    href: '/admin/options',
    icon: Settings,
  },
  {
    key: 'families',
    label: t('admin.families'),
    href: '/admin/families',
    icon: Boxes,
  },
  {
    key: 'categories',
    label: t('admin.categories'),
    href: '/admin/categories',
    icon: Tag,
  },
  {
    key: 'subcategories',
    label: t('admin.subcategories'),
    href: '/admin/subcategories',
    icon: Tags,
  },
  {
    key: 'products',
    label: t('global.products'),
    href: '/admin/products',
    icon: PackageOpen,
  },
  {
    key: 'covers',
    label: t('admin.covers'),
    href: '/admin/covers',
    icon: Briefcase,
  },
]
