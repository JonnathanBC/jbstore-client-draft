import { useStore } from '@nanostores/react'
import { Link } from 'react-router'
import type { User } from '~/types/user'
import { isSidebarOpen } from '~/stores/sidebar.store'

interface Props {
  user?: User | null
}

export function Navbar({ user }: Props) {
  const open = useStore(isSidebarOpen)

  return (
    <nav className="border-weak fixed top-0 z-50 w-full border-b bg-white">
      <div className="px-3 py-3 lg:px-5 lg:pl-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center justify-start rtl:justify-end">
            <button
              type="button"
              onClick={() => isSidebarOpen.set(!open)}
              className="text-strong-weak hover:bg-weak focus:ring-weak rounded-lg p-2 text-sm font-medium focus:ring-4 focus:outline-none sm:hidden"
            >
              <span className="sr-only">Open sidebar</span>
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>

            <Link
              to="/admin"
              className="text-strong ms-2 flex text-xl font-bold md:me-24"
            >
              JB Store
            </Link>
          </div>

          {user ? (
            <div className="flex items-center">
              <div className="bg-weak ms-3 flex items-center rounded-full px-3 py-1">
                <span className="text-strong-weak text-sm">{user.name}</span>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </nav>
  )
}
