import { Form, Link, useLocation } from 'react-router'
import { useStore } from '@nanostores/react'

import { menuItems } from '~/config/menuItems'
import { cn } from '~/lib/utils'
import { isSidebarOpen } from '~/stores/sidebar.store'

export function Sidebar() {
  const open = useStore(isSidebarOpen)
  const { pathname } = useLocation()

  const closeSidebar = () => isSidebarOpen.set(false)

  return (
    <>
      <aside
        className={cn(
          'border-weak fixed top-0 left-0 z-40 h-dvh w-64 border-r bg-white pt-20 transition-transform sm:translate-x-0',
          open ? 'translate-x-0 ease-out' : '-translate-x-full ease-in',
        )}
        aria-label="Sidebar"
      >
        <div className="flex h-full flex-col overflow-y-auto bg-white px-3 pb-4">
          <ul className="flex-1 space-y-2">
            {menuItems.map((menu) => {
              const Icon = menu.icon
              const isActive =
                menu.href === '/admin'
                  ? pathname === '/admin'
                  : pathname.startsWith(menu.href)

              return (
                <li key={menu.key}>
                  <Link
                    to={menu.href}
                    onClick={closeSidebar}
                    className={cn(
                      'hover:text-primary hover:bg-primary-light group flex items-center rounded-lg p-2',
                      isActive && 'text-primary bg-primary-light',
                    )}
                  >
                    <Icon className="group-hover:text-primary h-5 w-5" />
                    <span className="ms-3">{menu.label}</span>
                  </Link>
                </li>
              )
            })}
          </ul>

          <Form
            method="post"
            action="/logout"
            className="border-weak mt-4 border-t pt-4"
          >
            <button
              type="submit"
              className="flex w-full cursor-pointer items-center rounded-lg p-2 text-red-600 hover:bg-red-50"
            >
              <span className="ms-3">Cerrar sesión</span>
            </button>
          </Form>
        </div>
      </aside>

      <button
        type="button"
        aria-label="Cerrar menú"
        className={cn(
          'fixed inset-0 z-30 bg-black/40 sm:hidden',
          open ? 'block' : 'hidden',
        )}
        onClick={closeSidebar}
      />
    </>
  )
}
