import { LayoutDashboard } from 'lucide-react'
import type { ComponentType, SVGProps } from 'react'
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
    key: 'families',
    label: t('admin.families'),
    href: '/admin/families',
    icon: LayoutDashboard,
  },
  {
    key: 'categories',
    label: t('admin.categories'),
    href: '/admin/categories',
    icon: LayoutDashboard,
  },
  {
    key: 'subcategories',
    label: t('admin.subcategories'),
    href: '/admin/subcategories',
    icon: LayoutDashboard,
  },
  {
    key: 'products',
    label: t('global.products'),
    href: '/admin/products',
    icon: LayoutDashboard,
  },
]
