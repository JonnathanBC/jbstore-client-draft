import { useStore } from '@nanostores/react';
import { Link } from 'react-router';
import type { User } from '~/types/user';
import { isSidebarOpen } from '~/stores/sidebar.store';

interface Props {
  user?: User | null;
}

export function Navbar({ user }: Props) {
  const open = useStore(isSidebarOpen);

  return (
    <nav className="fixed top-0 z-50 w-full bg-white border-b border-gray-100">
      <div className="px-3 py-3 lg:px-5 lg:pl-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center justify-start rtl:justify-end">
            <button
              type="button"
              onClick={() => isSidebarOpen.set(!open)}
              className="sm:hidden text-gray-500 hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm p-2 focus:outline-none"
            >
              <span className="sr-only">Open sidebar</span>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>

            <Link to="/admin" className="flex ms-2 md:me-24 font-bold text-xl text-gray-800">
              JB Store
            </Link>
          </div>

          {user ? (
            <div className="flex items-center">
              <div className="flex items-center ms-3 px-3 py-1 rounded-full bg-gray-100">
                <span className="text-sm text-gray-700">{user.name}</span>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </nav>
  );
}
